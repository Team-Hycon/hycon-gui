import * as Base58 from "base-58"
import * as bip39 from "bip39"
import * as blake2b from "blake2b"
import * as crypto from "crypto"
import HDKey = require("hdkey")
import * as tfa from "node-2fa"
import * as secp256k1 from "secp256k1"
import { chinese_simplified } from "../mnemonic/chinese_simplified"
import { chinese_traditional } from "../mnemonic/chinese_traditional"
import { english } from "../mnemonic/english"
import { french } from "../mnemonic/french"
import { italian } from "../mnemonic/italian"
import { japanese } from "../mnemonic/japanese"
import { korean } from "../mnemonic/korean"
import { spanish } from "../mnemonic/spanish"
import { hyconfromString } from "./desktop/stringUtil"
import * as proto from "./serialization/proto"

import {
    IBlock,
    IHyconWallet,
    ILogin,
    IMinedInfo,
    IMiner,
    IPeer,
    IResponseError,
    IRest,
    ISignedTx,
    ITxProp,
    IWalletAddress,
} from "./rest"

function getBip39Wordlist(language?: string) {
    switch (language.toString().toLowerCase()) {
        case "english":
            return english
        case "korean":
            return korean
        case "chinese_simplified":
            return chinese_simplified
        case "chinese_traditional":
            return chinese_traditional
        case "chinese":
            throw new Error("Did you mean chinese_simplified or chinese_traditional?")
        case "japanese":
            return japanese
        case "french":
            return french
        case "spanish":
            return spanish
        case "italian":
            return italian
        default:
            return english
    }
}
export interface IStoredWallet {
    data: string
    iv: string
    address: string
    hint: string
}

// tslint:disable:no-console
// tslint:disable:ban-types
// tslint:disable:object-literal-sort-keys
export class RestChrome implements IRest {
    public readonly isDev: boolean = (process.env.NODE_ENV === "development")
    public readonly coinNumber: number = 1397
    public readonly url = "https://network.hycon.io"
    public apiVersion = "v1"
    public loading: boolean
    public isHyconWallet: boolean
    public callback: (loading: boolean) => void

    public loadingListener(callback: (loading: boolean) => void): void {
        this.callback = callback
    }
    public setLoading(loading: boolean): void {
        this.loading = loading
        this.callback(this.loading)
    }

    public async login(data: ILogin): Promise<{ response: string } | IResponseError> {
        let res
        try {
            const formData = new FormData()
            formData.append("action", "login")
            formData.append("login_email", data.email)
            formData.append("login_pass", data.password)
            if (data.tfa_token) {
                formData.append("tfa_token", data.tfa_token)
            }

            const headers = new Headers()
            headers.append("Accept", "application/json")
            res = await fetch(`https://wallet.hycon.io/ajax.php`, {
                body: formData,
                headers,
                method: "POST",
            })
        } catch (e) {
            // tslint:disable-next-line:no-console
            alert(`Could not connect to https://wallet.hycon.io/ajax.php`)
            throw e
        }
        console.log(res)
        return res.json()
    }

    public async sendTx(tx: { name: string, password: string, address: string, amount: string, minerFee: string, nonce: number }, queueTx?: Function): Promise<{ res: boolean, case?: number }> {
        let status = 1
        try {
            const wallet = await this.getWallet(tx.name)
            const { from, to, nonce } = await this.prepareSendTx(wallet.address, tx.address, tx.amount, tx.minerFee, tx.nonce)
            const iTx: proto.ITx = {
                from,
                to,
                amount: hyconfromString(tx.amount),
                fee: hyconfromString(tx.minerFee),
                nonce,
            }

            status = 3

            const iTxNew = Object.assign({ networkid: "hycon" }, iTx)
            const protoTxNew = proto.Tx.encode(iTxNew).finish()
            const txHashNew = this.blake2bHash(protoTxNew)
            const privateKey = this.decryptWallet(tx.password, wallet.iv, wallet.data).toString()
            const newSignature = secp256k1.sign(Buffer.from(txHashNew), Buffer.from(privateKey, "hex"))

            let signedTx: ISignedTx
            if (Date.now() <= 1544108400000) {
                const protoTx = proto.Tx.encode(iTx).finish()
                const txHash = this.blake2bHash(protoTx)
                const oldSignature = secp256k1.sign(Buffer.from(txHash), Buffer.from(privateKey, "hex"))
                signedTx = {
                    amount: tx.amount,
                    fee: tx.minerFee,
                    from: wallet.address,
                    signature: oldSignature.signature.toString("hex"),
                    recovery: oldSignature.recovery,
                    to: tx.address,
                    transitionSignature: newSignature.signature.toString("hex"),
                    transitionRecovery: newSignature.recovery,
                    nonce,
                }
            } else {
                signedTx = {
                    amount: tx.amount,
                    fee: tx.minerFee,
                    from: wallet.address,
                    signature: newSignature.signature.toString("hex"),
                    recovery: newSignature.recovery,
                    to: tx.address,
                    nonce,
                }
            }

            const result = await this.outgoingTx(signedTx)
            if (!("txHash" in result) || (typeof result.txHash) !== "string") {
                return { res: false, case: 3 }
            }
            return { res: true }
        } catch (e) {
            if (this.isDev) { console.log(e) }
            if (typeof (e) === "number") { return { res: false, case: e } }
            return { res: false, case: status }
        }
    }

    public deleteWallet(name: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            chrome.storage.sync.remove(name, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError)
                } else {
                    resolve(true)
                }
            })
        })
    }

    public async generateWallet(Hwallet: IHyconWallet): Promise<string> {
        try {
            return await this.recoverWallet(Hwallet)
        } catch (e) {
            throw new Error(e)
        }
    }

    public getMnemonic(language: string): Promise<string> {
        const wordlist = getBip39Wordlist(language)
        return Promise.resolve(bip39.generateMnemonic(128, undefined, wordlist))
    }

    public async getWalletDetail(name: string): Promise<IHyconWallet | IResponseError> {
        const wallet = await this.getWallet(name)
        if (!wallet.address || wallet.address === "") { return { name, address: "" } }
        const addressInfo = await this.getAddressInfo(wallet.address) as IWalletAddress
        if (addressInfo.hash === undefined) {
            return addressInfo
        }
        const address = wallet.address
        const balance = addressInfo.balance
        const pendingAmount = addressInfo.pendingAmount
        const minedBlocks = addressInfo.minedBlocks === undefined ? [] : addressInfo.minedBlocks
        const txs = addressInfo.txs === undefined ? [] : addressInfo.txs
        const pendings = addressInfo.pendings === undefined ? [] : addressInfo.pendings // pending txs
        return { name, address, balance, minedBlocks, txs, pendingAmount, pendings }
    }

    public getWalletList(index?: number): Promise<{ walletList: IHyconWallet[], length: number }> {
        return new Promise((resolve, _) => {
            const walletList: IHyconWallet[] = []
            chrome.storage.sync.get(null, (wallets: { [key: string]: IStoredWallet }) => {
                let i = 0
                // tslint:disable-next-line:forin
                for (const name in wallets) {
                    i++
                    if (index && i < index) {
                        continue
                    }
                    if (index && i >= index + 12) {
                        break
                    }
                    if (name.slice(0, 1) === "/") {
                        continue
                    }
                    const wallet = wallets[name]
                    const address = wallet.address ? wallet.address : ""
                    walletList.push({ name, address })
                    // CORDOVA
                    // const address = wallet.address
                    // if (name != "/favorites") {
                    //     walletList.push({ name, address })
                    // }

                }
                resolve({ walletList, length: walletList.length })
            })
        })
    }

    public async recoverWallet(Hwallet: IHyconWallet): Promise<string> {
        if (Hwallet.name === undefined || Hwallet.mnemonic === undefined || Hwallet.language === undefined) {
            return Promise.reject("params")
        }

        if (await this.checkDupleName(Hwallet.name)) {
            return Promise.reject("name")
        }

        if (Hwallet.password === undefined) { Hwallet.password = "" }
        if (Hwallet.passphrase === undefined) { Hwallet.passphrase = "" }
        if (Hwallet.hint === undefined) { Hwallet.hint = "" }

        try {
            const hdKey = this.hdKeyFromMnemonic(Hwallet.mnemonic, Hwallet.language, Hwallet.passphrase)
            const wallet = this.deriveWallet(hdKey.privateExtendedKey)

            const { iv, encryptedData } = this.encryptWallet(Hwallet.password, wallet.privateKey.toString("hex"))

            const address = this.publicKeyToAddress(wallet.publicKey)
            const addressString = this.addressToString(address)
            if (typeof address === "number") {
                throw new Error("invalid address created")
            } else {
                address.slice(12)
            }

            if (await this.checkDupleAddress(addressString)) {
                return Promise.reject("address")
            }

            const store: any = {}
            store[Hwallet.name] = {
                iv,
                data: encryptedData,
                address: addressString,
                hint: Hwallet.hint,
            }
            return new Promise<string>((resolve, reject) => {
                chrome.storage.sync.set(store, () => {
                    if (chrome.runtime.lastError) {
                        if (this.isDev) { console.error(chrome.runtime.lastError) }
                        reject("db")
                    } else {
                        resolve(addressString)
                    }
                })
            })

        } catch (e) {
            return Promise.reject(e)
        }
    }

    public async getHint(name: string): Promise<string> {
        const wallet = await this.getWallet(name)
        return wallet.hint
    }

    public async checkDupleName(name: string): Promise<boolean> {
        try {
            await this.getWallet(name)
            return true
        } catch (e) {
            return false
        }
    }

    public getFavoriteList(): Promise<Array<{ alias: string, address: string }>> {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get("/favorites", (store) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError)
                }

                const list: Array<{ alias: string, address: string }> = []
                if ("/favorites" in store) {
                    const favorites = store["/favorites"]
                    if (this.isDev) { console.log(`Favorites: `, favorites) }
                    // tslint:disable-next-line:forin
                    for (const alias in favorites) {
                        list.push({ alias, address: favorites[alias] })
                    }
                }
                resolve(list.sort((a, b) => {
                    return ((a.alias === b.alias) ? 0 : ((a.alias > b.alias) ? 1 : -1))
                }))
            })
        })
    }

    public async addFavorite(alias: string, address: string): Promise<boolean> {
        return new Promise<boolean>((resolve, _) => {
            chrome.storage.sync.get("/favorites", (store) => {
                if (chrome.runtime.lastError) {
                    if (this.isDev) { console.error(chrome.runtime.lastError) }
                    resolve(false)
                }

                if (!("/favorites" in store)) {
                    store["/favorites"] = {}
                }
                store["/favorites"][alias] = address

                chrome.storage.sync.set(store, () => {
                    if (chrome.runtime.lastError) {
                        if (this.isDev) { console.error(chrome.runtime.lastError) }
                        resolve(false)
                    }
                    if (this.isDev) { console.log(`Stored "${alias}" -> ${JSON.stringify(store)}`) }
                    resolve(true)
                })
            })
        })
    }
    public deleteFavorite(alias: string) {
        return new Promise<boolean>((resolve, reject) => {
            chrome.storage.sync.get("/favorites", (store) => {
                if (chrome.runtime.lastError) {
                    if (this.isDev) { console.error(chrome.runtime.lastError) }
                    resolve(false)
                }

                delete store["/favorites"][alias]

                chrome.storage.sync.set(store, () => {
                    if (chrome.runtime.lastError) {
                        if (this.isDev) { console.error(chrome.runtime.lastError) }
                        resolve(false)
                    }
                    if (this.isDev) { console.log(`Deleted "${alias}" from ${JSON.stringify(store)}`) }
                    resolve(true)
                })
            })
        })
    }

    public deleteFavoriteTab(fav: any) {
        return new Promise<boolean>((resolve, reject) => {
            chrome.storage.sync.get("/favorites", (store) => {
                if (chrome.runtime.lastError) {
                    if (this.isDev) { console.error(chrome.runtime.lastError) }
                    resolve(false)
                }
                console.log(fav)
                for (let i = 1; i < fav.length; i++) {
                    console.log(fav[i].alias)
                    delete store["/favorites"][fav[i].alias]
                }

                chrome.storage.sync.set(store, () => {
                    if (chrome.runtime.lastError) {
                        if (this.isDev) { console.error(chrome.runtime.lastError) }
                        resolve(false)
                    }
                    if (this.isDev) { console.log(`Deleted "${fav.alias}" from ${JSON.stringify(store)}`) }
                    resolve(true)
                })
            })
        })
    }

    public async addWalletFile(name: string, password: string, key: string): Promise<boolean> {
        try {
            if (await this.checkDupleName(name)) {
                return Promise.reject("name")
            }

            const keyArr = key.split(":")
            let hint: string = ""
            let iv: string = ""
            let data: string = ""
            if (keyArr.length === 2) {
                iv = keyArr[0]
                data = keyArr[1]
            } else if (keyArr.length === 3) {
                hint = keyArr[0]
                iv = keyArr[1]
                data = keyArr[2]
            } else {
                throw new Error(`Fail to decryptAES`)
            }
            const store: any = {}
            store[name] = {
                iv,
                data,
                address: "",
                hint,
            }
            const decryptedKey = this.decryptWallet(password, iv, data).toString()
            if (decryptedKey.slice(0, 4) !== "xprv") {
                const publicKeyBuff = secp256k1.publicKeyCreate(Buffer.from(decryptedKey, "hex"))
                const address = this.publicKeyToAddress(publicKeyBuff)
                const addressStr = this.addressToString(address)

                if (await this.checkDupleAddress(addressStr)) {
                    return Promise.reject("address")
                }
                Object.assign(store[name], { address: addressStr })
            }

            return new Promise<boolean>((resolve, _) => {
                chrome.storage.sync.set(store, () => {
                    if (chrome.runtime.lastError) {
                        if (this.isDev) { console.error(chrome.runtime.lastError) }
                        return Promise.reject("db")
                    } else {
                        resolve(true)
                    }
                })
            })
        } catch (e) {
            if (this.isDev) { console.log(e) }
            return Promise.reject("key")
        }
    }

    public async outgoingTx(tx: ISignedTx, queueTx?: Function): Promise<{ txHash: string } | IResponseError> {
        const headers = new Headers()
        headers.append("Accept", "application/json")
        headers.append("Content-Type", "application/json")
        let response
        try {
            response = await fetch(`${this.url}/api/${this.apiVersion}/tx`, {
                method: "POST",
                headers,
                body: JSON.stringify(tx),
            })
        } catch (e) {
            alert(`Could not connect to ${this.url}`)
            throw e
        }
        return response.json()
    }

    public async getAddressInfo(address: string): Promise<IWalletAddress> {
        let response
        try {
            response = await fetch(`${this.url}/api/${this.apiVersion}/address/${address}`)
        } catch (e) {
            alert(`Could not connect to ${this.url}`)
            throw e
        }
        return response.json()
    }

    public async getBlock(hash: string): Promise<IBlock | IResponseError> {
        let response
        try {
            response = await fetch(`${this.url}/api/${this.apiVersion}/block/${hash}`)
        } catch (e) {
            alert(`Could not connect to ${this.url}`)
            throw e
        }
        return response.json()
    }

    public async getTx(hash: string): Promise<ITxProp> {
        let response
        try {
            response = await fetch(`${this.url}/api/${this.apiVersion}/tx/${hash}`)
        } catch (e) {
            alert(`Could not connect to ${this.url}`)
            throw e
        }
        return response.json()
    }

    public async getPendingTxs(index: number): Promise<{ txs: ITxProp[], length: number, totalCount: number, totalAmount: string, totalFee: string }> {
        let response
        try {
            response = await fetch(`${this.url}/api/${this.apiVersion}/txList/${index}`)
        } catch (e) {
            alert(`Could not connect to ${this.url}`)
            throw e
        }
        return response.json()
    }

    public async getNextTxs(address: string, txHash?: string, index?: number): Promise<ITxProp[]> {
        let response
        try {
            response = await fetch(`${this.url}/api/${this.apiVersion}/nextTxs/${address}/${txHash}/${index}`)
        } catch (e) {
            alert(`Could not connect to ${this.url}`)
            throw e
        }
        return response.json()
    }

    public async getMinedBlocks(address: string, blockHash: string, index: number): Promise<IMinedInfo[]> {
        let response
        try {
            response = await fetch(`${this.url}/api/${this.apiVersion}/getMinedInfo/${address}/${blockHash}/${index}`)
        } catch (e) {
            alert(`Could not connect to ${this.url}`)
            throw e
        }
        return response.json()
    }

    public async getNextTxsInBlock(blockhash: string, txHash: string, index: number): Promise<ITxProp[]> {
        let response
        try {
            response = await fetch(`${this.url}/api/${this.apiVersion}/nextTxsInBlock/${blockhash}/${txHash}/${index}`)
        } catch (e) {
            alert(`Could not connect to ${this.url}`)
            throw e
        }
        return response.json()
    }

    public createNewWallet(Hwallet: IHyconWallet): Promise<IHyconWallet | IResponseError> {
        try {
            const hdKey = this.hdKeyFromMnemonic(Hwallet.mnemonic, Hwallet.language, Hwallet.passphrase)
            const wallet = this.deriveWallet(hdKey.privateExtendedKey, 0)

            const address = this.publicKeyToAddress(wallet.publicKey)
            const addressString = this.addressToString(address)

            const hyconWallet: IHyconWallet = {
                address: addressString,
            }
            if (this.isDev) { console.log(addressString) }
            return Promise.resolve(hyconWallet)
        } catch (e) {
            return Promise.resolve(e)
        }
    }

    public getTOTP(): Promise<{ iv: string, data: string }> {
        return new Promise((resolve, _) => {
            chrome.storage.sync.get("/totp", (store: { [key: string]: { iv: string, data: string } }) => {
                if (chrome.runtime.lastError) {
                    if (this.isDev) { console.error(chrome.runtime.lastError) }
                    return false
                }
                const totp = store["/totp"]
                if (totp === undefined) {
                    if (this.isDev) { console.log(`TOTP is not found`) }
                    return false
                }
                if (this.isDev) { console.log(`TOTP is found: ${JSON.stringify(store)}`) }
                resolve({ iv: totp.iv, data: totp.data })
            })
        })
    }
    public async saveTOTP(secret: string, totpPw: string): Promise<boolean> {
        try {
            const iv = crypto.randomBytes(16)
            const key = Buffer.from(this.blake2bHash(totpPw))
            const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
            const encryptedData = Buffer.concat([cipher.update(Buffer.from(secret)), cipher.final()])
            const store: any = {}
            store["/totp"] = {
                iv: iv.toString("hex"),
                data: encryptedData.toString("hex"),
            }
            return new Promise<boolean>((resolve, _) => {
                chrome.storage.sync.set(store, () => {
                    if (chrome.runtime.lastError) {
                        if (this.isDev) { console.error(chrome.runtime.lastError) }
                        resolve(false)
                    } else {
                        if (this.isDev) { console.log(`Stored totp -> ${JSON.stringify(store)}`) }
                        resolve(true)
                    }
                })
            })
        } catch (e) {
            if (this.isDev) { console.error(e) }
            return Promise.resolve(false)
        }
    }
    public async deleteTOTP(totpPw: string): Promise<{ res: boolean, case?: number }> {
        try {
            const totp = await this.getTOTP()

            const secret = this.decryptTOTP(totpPw, totp.iv, totp.data).toString()
            if (secret === "false") {
                return Promise.resolve({ res: false, case: 1 })
            }

            const key = Buffer.from(this.blake2bHash(totpPw))
            const iv = Buffer.from(totp.iv, "hex")
            const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
            const encryptedData = Buffer.concat([cipher.update(Buffer.from(secret)), cipher.final()])

            if (totp.data === encryptedData.toString("hex")) {
                return new Promise<{ res: boolean, case?: number }>((resolve, _) => {
                    chrome.storage.sync.remove("/totp", () => {
                        if (chrome.runtime.lastError) {
                            if (this.isDev) { console.error(chrome.runtime.lastError) }
                            resolve({ res: false, case: 2 })
                        }
                        if (this.isDev) { console.log(`Removed totp -> ${JSON.stringify(totp)}`) }
                        resolve({ res: true })
                    })
                })
            }
            return Promise.resolve({ res: false, case: 3 })
        } catch (e) {
            if (this.isDev) { console.error(e) }
            return Promise.resolve({ res: false, case: 3 })
        }
    }
    public async verifyTOTP(token: string, totpPw: string, secret?: string) {
        if (secret) {
            return new Promise<boolean>((resolve, _) => {
                const res = tfa.verifyToken(secret, token)
                if (res === null || res.delta !== 0) { resolve(false) }
                resolve(true)
            })
        }

        const totp = await this.getTOTP()
        return new Promise<boolean>((resolve, _) => {
            if (!totp) {
                if (this.isDev) { console.error(`Fail to get Transaction OTP`) }
                resolve(false)
            }
            const s = this.decryptTOTP(totpPw, totp.iv, totp.data).toString()
            if (secret === "false") { resolve(false) }

            const res = tfa.verifyToken(s, token)
            if (res === null || res.delta !== 0) { resolve(false) }
            resolve(true)
        })
    }

    public getPrice(currency: string): Promise<number> {
        return new Promise((resolve, _) => {
            chrome.storage.sync.get("/price_" + currency.toLowerCase(), (store: { [key: string]: { val: number, timestamp: number } }) => {
                if (chrome.runtime.lastError) {
                    if (this.isDev) { console.error(chrome.runtime.lastError) }
                    return false
                }
                const price = store["/price_" + currency.toLowerCase()]
                if ((price === undefined) || (Math.round(price.timestamp / 1000) < (Math.round(Date.now() / 1000) - 300))) {
                    this.getHyconPrice(currency).then((res: any) => {
                        const p: number = Number(res.market_data.current_price[currency.toLowerCase()])
                        this.savePrice(currency, p)
                        return resolve(p)
                    }).catch((e: Error) => {
                        alert(e)
                    })
                } else {
                    return resolve(price.val)
                }
            })
        })
    }

    public getLedgerWallet(startIndex: number): Promise<IHyconWallet[] | number> {
        throw new Error("getLedgerWallet: Not Implemented")
    }

    public sendTxWithLedger(index: number, from: string, to: string, amount: string, fee: string, txNonce?: number, queueTx?: Function): Promise<{ res: boolean, case?: number }> {
        throw new Error("sendTxWithLedger: Not Implemented")
    }

    public getWalletBalance(address: string): Promise<{ balance: string } | IResponseError> {
        throw new Error("getWalletBalance: Not Implemented")
    }

    public getWalletTransactions(address: string, nonce?: number): Promise<{ txs: ITxProp[] } | IResponseError> {
        throw new Error("getWalletTransactions: Not Implemented")
    }
    public getAllAccounts(name: string, password: string, startIndex: number): Promise<Array<{ address: string, balance: string }> | boolean> {
        throw new Error("getAllAccounts not implemented")
    }

    public outgoingSignedTx(tx: { privateKey: string, to: string, amount: string, fee: string, nonce: number }, queueTx?: Function): Promise<{ txHash: string } | IResponseError> {
        throw new Error("outgoingSignedTx: Not Implemented")
    }

    public getPeerList(): Promise<IPeer[]> {
        throw new Error("getPeerList not implemented")
    }

    public getPeerConnected(index: number): Promise<{ peersInPage: IPeer[], pages: number }> {
        throw new Error("getPeerConnected not implemented")
    }

    public getBlockList(index: number): Promise<{ blocks: IBlock[], length: number }> {
        throw new Error("getBlockList not implemented")
    }

    public getTopTipHeight(): Promise<{ height: number }> {
        throw new Error("getTopTipHeight not implemented")
    }

    public getMiner(): Promise<IMiner> {
        throw new Error("getMiner not implemented")
    }

    public setMiner(address: string): Promise<boolean> {
        throw new Error("setMiner not implemented")
    }

    public startGPU(): Promise<boolean> {
        throw new Error("startGPU not implemented")
    }

    public setMinerCount(count: number): Promise<void> {
        throw new Error("setMinerCount not implemented")
    }

    public possibilityLedger(): Promise<boolean> {
        return Promise.resolve(false)
    }

    public async getHDWallet(name: string, password: string, index: number, count: number): Promise<IHyconWallet[] | IResponseError> {
        try {
            const chromeWallet = await this.getWallet(name)
            const rootKey = this.decryptWallet(password, chromeWallet.iv, chromeWallet.data).toString()
            const hyconWallets: IHyconWallet[] = []
            for (let i = index; i < index + count; i++) {
                hyconWallets.push(await this.getHDWalletInfo(rootKey, i))
            }
            return hyconWallets
        } catch (e) {
            return Promise.resolve({
                status: 404,
                timestamp: Date.now(),
                error: "NOT_FOUND",
                message: "the wallet cannot be found",
            })
        }
    }

    public async sendTxWithHDWallet(tx: { name: string; password: string; address: string; amount: string; minerFee: string; nonce?: number; }, index: number, queueTx?: Function): Promise<{ res: boolean; case?: number; }> {
        tx.password === undefined ? tx.password = "" : tx.password = tx.password
        let status = 1
        try {
            const wallet = await this.getWallet(tx.name)
            const rootKey = this.decryptWallet(tx.password, wallet.iv, wallet.data).toString()
            const hdWallet = await this.getHDWalletInfo(rootKey, index)
            status = 2

            const { from, to, nonce } = await this.prepareSendTx(hdWallet.address, tx.address, tx.amount, tx.minerFee, tx.nonce)
            const iTx: proto.ITx = {
                from,
                to,
                amount: hyconfromString(tx.amount),
                fee: hyconfromString(tx.minerFee),
                nonce,
            }
            status = 3

            const iTxNew = Object.assign({ networkid: "hycon" }, iTx)
            const protoTxNew = proto.Tx.encode(iTxNew).finish()
            const txHashNew = this.blake2bHash(protoTxNew)
            const privateKey = this.deriveWallet(rootKey, index).privateKey
            const { signature, recovery } = secp256k1.sign(Buffer.from(txHashNew), privateKey)

            let signedTx: ISignedTx
            if (Date.now() <= 1544108400000) {
                const protoTx = proto.Tx.encode(iTx).finish()
                const txHash = this.blake2bHash(protoTx)
                const old = secp256k1.sign(Buffer.from(txHash), privateKey)
                signedTx = {
                    amount: tx.amount,
                    fee: tx.minerFee,
                    from: this.addressToString(from),
                    signature: Buffer.from(old.signature).toString("hex"),
                    recovery: old.recovery,
                    to: tx.address,
                    transitionSignature: Buffer.from(signature).toString("hex"),
                    transitionRecovery: recovery,
                    nonce,
                }
            } else {
                signedTx = {
                    amount: tx.amount,
                    fee: tx.minerFee,
                    from: this.addressToString(from),
                    signature: Buffer.from(signature).toString("hex"),
                    recovery,
                    to: tx.address,
                    nonce,
                }
            }

            const result = await this.outgoingTx(signedTx)

            if (!("txHash" in result) || (typeof result.txHash) !== "string") {
                return { res: false, case: 3 }
            }
            return { res: true }
        } catch (e) {
            if (typeof (e) === "number") { return { res: false, case: e } }
            return { res: false, case: status }
        }
    }
    public generateHDWallet(Hwallet: IHyconWallet): Promise<string> {
        try {
            return this.recoverHDWallet(Hwallet)
        } catch (e) {
            return Promise.reject(e)
        }
    }
    public async recoverHDWallet(Hwallet: IHyconWallet): Promise<string> {
        if (Hwallet.name === undefined || Hwallet.mnemonic === undefined || Hwallet.language === undefined) {
            return Promise.reject("params")
        }
        if (await this.checkDupleName(Hwallet.name)) {
            return Promise.reject("name")
        }
        if (Hwallet.password === undefined) { Hwallet.password = "" }
        if (Hwallet.passphrase === undefined) { Hwallet.passphrase = "" }
        if (Hwallet.hint === undefined) { Hwallet.hint = "" }
        try {
            const hdKey = this.hdKeyFromMnemonic(Hwallet.mnemonic, Hwallet.language, Hwallet.passphrase)
            const { iv, encryptedData } = this.encryptWallet(Hwallet.password, hdKey.privateExtendedKey)
            const store: any = {}
            store[Hwallet.name] = {
                iv,
                data: encryptedData,
                hint: Hwallet.hint,
            }
            return new Promise<string>((resolve, reject) => {
                chrome.storage.sync.set(store, () => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError)
                        reject("db")
                    } else {
                        resolve(Hwallet.name)
                    }
                })
            })
        } catch (e) {
            return Promise.reject(e)
        }
    }

    public checkPasswordBitbox(): Promise<number | boolean> {
        throw new Error("Method not implemented.")
    }
    public checkWalletBitbox(password: string): Promise<number | boolean | { error: number; remain_attemp: string; }> {
        throw new Error("Method not implemented.")
    }
    public getBitboxWallet(password: string, startIndex: number, count: number): Promise<number | IHyconWallet[]> {
        throw new Error("Method not implemented.")
    }
    public sendTxWithBitbox(tx: { from: string; password: string; address: string; amount: string; minerFee: string; nonce?: number; }, index: number, queueTx?: Function): Promise<{ res: boolean; case?: number | { error: number; remain_attemp: string; }; }> {
        throw new Error("Method not implemented.")
    }
    public setBitboxPassword(password: string): Promise<number | boolean> {
        throw new Error("Method not implemented.")
    }
    public createBitboxWallet(name: string, password: string): Promise<number | boolean> {
        throw new Error("Method not implemented.")
    }
    public updateBitboxPassword(originalPwd: string, newPwd: string): Promise<number | boolean | { error: number; remain_attemp: string; }> {
        throw new Error("Method not implemented.")
    }
    public getMarketCap(): Promise<{ totalSupply: string; circulatingSupply: string; }> {
        throw new Error("Method not implemented.")
    }

    public isUncleBlock(blockHash: string): Promise<boolean | IResponseError> {
        throw new Error("Method not implemented.")
    }
    public getMiningReward(minerAddress: string, blockHash: string): Promise<string | IResponseError> {
        throw new Error("Method not implemented.")
    }

    private publicKeyToAddress(publicKey: Uint8Array): Uint8Array {
        const hash: Uint8Array = this.blake2bHash(publicKey)
        const address = new Uint8Array(20)
        for (let i = 12; i < 32; i++) {
            address[i - 12] = hash[i]
        }
        return address
    }

    private addressToString(publicKey: Uint8Array): string {
        return "H" + Base58.encode(publicKey) + this.addressCheckSum(publicKey)
    }
    private addressToUint8Array(address: string) {
        if (address.charAt(0) !== "H") {
            throw new Error(`Address is invalid. Expected address to start with 'H'`)
        }

        const out: Uint8Array = Base58.decode(address.slice(1, -4))
        if (out.length !== 20) {
            throw new Error("Address must be 20 bytes long")
        }

        const expectedChecksum = this.addressCheckSum(out)
        const checksum = address.slice(-4)
        if (expectedChecksum !== checksum) {
            throw new Error(`Address hash invalid checksum '${checksum}' expected '${expectedChecksum}'`)
        }

        return out
    }

    private addressCheckSum(arr: Uint8Array): string {
        const hash = this.blake2bHash(arr)
        let str = Base58.encode(hash)
        str = str.slice(0, 4)
        return str
    }

    private blake2bHash(ob: Uint8Array | string): Uint8Array {
        typeof ob === "string" ? ob = Buffer.from(ob) : ob = ob
        return blake2b(32).update(ob).digest()
    }

    private async getWallet(name: string) {
        return new Promise<IStoredWallet>((resolve, reject) => {
            chrome.storage.sync.get(name, (wallets: { [key: string]: IStoredWallet }) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError)
                }

                if (!(name in wallets)) {
                    reject(new Error(`Wallet '${name}' not found`))
                }

                resolve(wallets[name])
            })
        })
    }

    private encryptWallet(password: string, data: string): { iv: string, encryptedData: string } {
        const iv = crypto.randomBytes(16)
        const key = Buffer.from(this.blake2bHash(password))
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
        const encryptedData = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()])
        return { iv: iv.toString("hex"), encryptedData: encryptedData.toString("hex") }
    }

    private decryptWallet(password: string, iv: string, data: string) {
        const ivBuffer = Buffer.from(iv, "hex")
        const dataBuffer = Buffer.from(data, "hex")
        const key = this.blake2bHash(password)
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBuffer)
        const originalData = Buffer.concat([decipher.update(dataBuffer), decipher.final()])
        return originalData
    }

    private decryptTOTP(totpPw: string, iv: string, data: string): Buffer | boolean {
        try {
            const key = Buffer.from(this.blake2bHash(totpPw))
            const ivBuffer = Buffer.from(iv, "hex")
            const dataBuffer = Buffer.from(data, "hex")
            const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBuffer)
            const originalData = Buffer.concat([decipher.update(dataBuffer), decipher.final()])
            return originalData
        } catch (e) {
            return false
        }
    }

    private checkDupleAddress(address: string): Promise<boolean> {
        return new Promise((resolve, _) => {
            chrome.storage.sync.get(null, (wallets) => {
                if (chrome.runtime.lastError) {
                    if (this.isDev) { console.error(chrome.runtime.lastError) }
                    resolve(true)
                }
                let flag = false
                Object.keys(wallets).forEach((name) => {
                    if (wallets[name].address === address) {
                        flag = true
                    }
                })
                resolve(flag)
            })
        })
    }

    private hdKeyFromMnemonic(mnemonic: string, language: string, passphrase: string): HDKey { // should private
        if (!bip39.validateMnemonic(mnemonic, getBip39Wordlist(language))) {
            throw new Error("mnemonic")
        }

        const seed: Buffer = bip39.mnemonicToSeed(mnemonic, passphrase)
        const masterKey = HDKey.fromMasterSeed(seed)
        if (!masterKey.privateExtendedKey) {
            throw new Error("masterKey does not have Extended PrivateKey")
        }
        return masterKey
    }

    private deriveWallet(extendPrvKey: string, index: number = 0): { privateKey: Buffer, publicKey: Buffer } { // should private
        const hdkey = HDKey.fromExtendedKey(extendPrvKey)
        const wallet = hdkey.derive(`m/44'/${this.coinNumber}'/0'/0/${index}`)
        if (!wallet.privateKey) {
            throw new Error("Not much key information to save wallet")
        }

        if (!secp256k1.privateKeyVerify(wallet.privateKey)) {
            throw new Error("Fail to privateKeyVerify in generate Key with mnemonic")
        }

        if (!(this.checkPublicKey(wallet.publicKey, wallet.privateKey))) {
            throw new Error("publicKey from masterKey generated by hdkey is not equal publicKey generated by secp256k1")
        }
        return { privateKey: wallet.privateKey, publicKey: wallet.publicKey }
    }

    private checkPublicKey(publicKey: Buffer, privateKey: Buffer): boolean {
        let isEqual = true
        const secpPublicKey = secp256k1.publicKeyCreate(privateKey)
        if (publicKey.length !== secpPublicKey.length) {
            isEqual = false
        } else {
            for (let i = 0; i < publicKey.length; i++) {
                if (publicKey[i] !== secpPublicKey[i]) {
                    isEqual = false
                    break
                }
            }
        }
        return isEqual
    }

    private async prepareSendTx(fromAddress: string, toAddress: string, amount: string, minerFee: string, txNonce?: number): Promise<{ from: Uint8Array, to: Uint8Array, nonce: number }> {
        let checkAddr = false
        try {
            const from = this.addressToUint8Array(fromAddress)
            const address = this.addressToUint8Array(toAddress)
            checkAddr = true

            const addressInfo = await this.getAddressInfo(fromAddress) as IWalletAddress
            let accountBalance = hyconfromString(addressInfo.balance)

            let nonce: number
            const addressTxs = addressInfo.pendings
            if (txNonce !== undefined) {
                nonce = Number(txNonce)
            } else if (addressTxs.length > 0) {
                nonce = addressTxs[addressTxs.length - 1].nonce + 1
            } else {
                nonce = addressInfo.nonce + 1
            }

            let totalPendings = hyconfromString("0")
            for (const tx of addressTxs) {
                if (tx.nonce === nonce) {
                    break
                }
                totalPendings = totalPendings.add(tx.amount).add(tx.fee)
            }

            accountBalance = accountBalance.sub(totalPendings)

            const totalSend = hyconfromString(amount).add(hyconfromString(minerFee))

            if (totalSend.greaterThan(accountBalance)) {
                throw new Error("insufficient wallet balance to send transaction")
            }
            return { from, to: address, nonce }
        } catch (e) {
            if (!checkAddr) { throw 2 }
            throw 3
        }
    }

    private async getHDWalletInfo(rootKey: string, index: number) {
        const wallet = this.deriveWallet(rootKey, index)
        const address = this.publicKeyToAddress(wallet.publicKey)
        const addressString = this.addressToString(address)
        const addressInfo = await this.getAddressInfo(addressString) as IWalletAddress
        const balance = addressInfo.balance
        const pendingAmount = addressInfo.pendingAmount
        const minedBlocks = addressInfo.minedBlocks === undefined ? [] : addressInfo.minedBlocks
        const txs = addressInfo.txs === undefined ? [] : addressInfo.txs
        const pendings = addressInfo.pendings === undefined ? [] : addressInfo.pendings // pending txs
        return { name, address: addressString, balance, minedBlocks, txs, pendingAmount, pendings }
    }

    private async getHyconPrice(currency: string): Promise<any> {
        try {
            const headers = new Headers()
            headers.append("Accept", "application/json")
            // const res = await fetch(`https://api.coinmarketcap.com/v1/ticker/hycon/?convert=${currency}`, {
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/hycon?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`, {
                headers,
                method: "GET",
            })
            return res.json()
        } catch (e) {
            // tslint:disable-next-line:no-console
            alert(e)
        }
    }

    private async savePrice(currency: string, price: number): Promise<boolean> {
        try {
            const store: any = {}
            store["/price_" + currency.toLowerCase()] = {
                val: price,
                timestamp: Date.now(),
            }
            return new Promise<boolean>((resolve, _) => {
                chrome.storage.sync.set(store, () => {
                    if (chrome.runtime.lastError) {
                        if (this.isDev) { console.error(chrome.runtime.lastError) }
                        resolve(false)
                    } else {
                        if (this.isDev) { console.log(`Stored totp -> ${JSON.stringify(store)}`) }
                        resolve(true)
                    }
                })
            })
        } catch (e) {
            if (this.isDev) { console.error(e) }
            return Promise.resolve(false)
        }
    }
}
