import * as utils from "@glosfer/hyconjs-util"
import * as bip39 from "bip39"
import * as crypto from "crypto"
import HDKey = require("hdkey")
import * as datastore from "nedb"
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
import { hyconfromString, hyconIntfromString } from "./desktop/stringUtil"
import * as proto from "./serialization/proto"

// tslint:disable-next-line:no-var-requires
const { ipcRenderer } = require("electron")

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
    switch (language.toLowerCase()) {
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

function bytesToHex(bytes: Uint8Array) {
    const hex = []
    for (const byte of bytes) {
        // tslint:disable:no-bitwise
        hex.push((byte >>> 4).toString(16))
        hex.push((byte & 0xF).toString(16))
    }
    return hex.join("")
}

interface IStoredWallet {
    data: string
    iv: string
    address: string
    hint: string
    name: string
}

interface IStoredFavorite {
    alias: string
    address: string
}

// tslint:disable:no-console
// tslint:disable:ban-types
// tslint:disable:object-literal-sort-keys
export class RestElectron implements IRest {
    public readonly isDev: boolean = (process.env.NODE_ENV === "development")
    public readonly coinNumber: number = 1397
    public readonly url = "https://network.hycon.io"
    public apiVersion = "v1"
    public loading: boolean
    public isHyconWallet: boolean
    public callback: (loading: boolean) => void
    public userPath: string = ipcRenderer.sendSync("getUserPath")
    public osArch: string = ipcRenderer.sendSync("getOSArch")
    public walletsDB = new datastore({ filename: this.userPath + "/wallets.db", autoload: true })
    public favoritesDB = new datastore({ filename: this.userPath + "/favorites.db", autoload: true })
    public totpDB = new datastore({ filename: this.userPath + "/totp.db", autoload: true })
    public priceDB = new datastore({ filename: this.userPath + "/price.db", autoload: true })

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
                amount: utils.hyconfromString(tx.amount),
                fee: utils.hyconfromString(tx.minerFee),
                nonce,
            }
            status = 3

            const iTxNew = Object.assign({ networkid: "hycon" }, iTx)
            const protoTxNew = proto.Tx.encode(iTxNew).finish()
            const txHashNew = utils.blake2bHash(protoTxNew)
            const privateKey = this.decryptWallet(tx.password, wallet.iv, wallet.data).toString()
            const newSignature = secp256k1.sign(Buffer.from(txHashNew), Buffer.from(privateKey, "hex"))

            let signedTx: ISignedTx
            if (Date.now() <= 1544108400000) {
                const protoTx = proto.Tx.encode(iTx).finish()
                const txHash = utils.blake2bHash(protoTx)
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
                throw new Error("Fail to transfer hycon.")
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
            this.walletsDB.remove({ name }, {}, (err: any, n: number) => {
                if (err) {
                    reject(err)
                } else {
                    if (this.isDev) { console.log(`${n} wallet has been removed.`) }
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

    public async getWalletList(index?: number): Promise<{ walletList: IHyconWallet[], length: number }> {
        return new Promise<{ walletList: IHyconWallet[], length: number }>((resolve, _) => {
            const walletList: IHyconWallet[] = []
            this.walletsDB.find({}, async (err: Error, docs: IStoredWallet[]) => {
                if (err) {
                    if (this.isDev) { console.log(err) }
                    return
                }

                if (index) {
                    docs.map((doc, i) => {
                        if (i >= index * 12 && i < (index + 1) * 12) {
                            walletList.push({ address: doc.address, name: doc.name })
                        }
                    })
                } else {
                    docs.map((doc) => {
                        walletList.push({ address: doc.address, name: doc.name })
                    })
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

        const wordlist = getBip39Wordlist(Hwallet.language)

        if (!bip39.validateMnemonic(Hwallet.mnemonic, wordlist)) {
            return Promise.reject("mnemonic")
        }

        if (Hwallet.password === undefined) { Hwallet.password = "" }
        if (Hwallet.passphrase === undefined) { Hwallet.passphrase = "" }
        if (Hwallet.hint === undefined) { Hwallet.hint = "" }

        try {
            const hdKey = this.hdKeyFromMnemonic(Hwallet.mnemonic, Hwallet.language, Hwallet.passphrase)
            const wallet = this.deriveWallet(hdKey.privateExtendedKey)

            const { iv, encryptedData } = this.encryptWallet(Hwallet.password, wallet.privateKey.toString("hex"))

            const address = utils.publicKeyToAddress(wallet.publicKey)
            const addressStr = utils.addressToString(address)
            if (typeof address === "number") {
                throw new Error("invalid address created")
            } else {
                address.slice(12)
            }

            const store: IStoredWallet = {
                iv,
                data: encryptedData,
                address: addressStr,
                hint: Hwallet.hint,
                name: Hwallet.name,
            }

            if (await this.checkDupleAddress(addressStr)) {
                return Promise.reject("address")
            }

            return new Promise<string>((resolve, reject) => {
                this.walletsDB.insert(store, (err: Error, doc: IStoredWallet) => {
                    if (err) {
                        if (this.isDev) { console.error(err) }
                        reject("db")
                    } else {
                        resolve(doc.address)
                    }
                })
            })

        } catch (e) {
            return Promise.reject("bip39")
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
            this.favoritesDB.find({}, (err: Error, docs: IStoredFavorite[]) => {
                if (err) {
                    reject(err)
                }

                const list: Array<{ alias: string, address: string }> = []
                for (const favorite of docs) {
                    list.push({ alias: favorite.alias, address: favorite.address })
                }
                resolve(list)
            })
        })
    }

    public async addFavorite(alias: string, address: string): Promise<boolean> {
        const store: IStoredFavorite = {
            alias,
            address,
        }
        return new Promise<boolean>((resolve, _) => {
            this.favoritesDB.insert(store, (err: Error, doc: IStoredFavorite) => {
                if (err) {
                    if (this.isDev) { console.error(err) }
                    resolve(false)
                }
                if (this.isDev) { console.log(`Stored ${doc.address} -> ${JSON.stringify(doc)}`) }
                resolve(true)
            })
        })
    }
    public deleteFavorite(alias: string) {
        return new Promise<boolean>((resolve, _) => {
            this.favoritesDB.remove({ alias }, {}, (err: Error, n: number) => {
                if (err) {
                    if (this.isDev) { console.error(err) }
                    resolve(false)
                }
                if (this.isDev) { console.log(`Deleted "${alias}" from favorites`) }
                resolve(true)
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
            const store: IStoredWallet = {
                iv,
                data,
                address: "",
                hint,
                name,
            }
            const decryptedKey = this.decryptWallet(password, iv, data).toString()
            if (decryptedKey.slice(0, 4) !== "xprv") {
                const publicKeyBuff = secp256k1.publicKeyCreate(Buffer.from(decryptedKey, "hex"))
                const address = utils.publicKeyToAddress(publicKeyBuff)
                const addressStr = utils.addressToString(address)

                if (await this.checkDupleAddress(addressStr)) {
                    return Promise.reject("address")
                }
                Object.assign(store, { address: addressStr })
            }

            return new Promise<boolean>((resolve, _) => {
                this.walletsDB.insert(store, (err: Error, doc: IStoredWallet) => {
                    if (err) {
                        if (this.isDev) { console.error(err) }
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

    public outgoingTx(tx: { signature: string, from: string, to: string, amount: string, fee: string, recovery: number, nonce: number }, queueTx?: Function): Promise<{ txHash: string } | IResponseError> {
        const headers = new Headers()
        headers.append("Accept", "application/json")
        headers.append("Content-Type", "application/json")
        return Promise.resolve(fetch(`${this.url}/api/${this.apiVersion}/tx`, {
            method: "POST",
            headers,
            body: JSON.stringify(tx),
        })
            .then((response) => response.json())
            .catch((err: Error) => {
                console.log(err)
            }))
    }

    public getAddressInfo(address: string): Promise<IWalletAddress | IResponseError> {
        const apiVer = this.apiVersion
        return Promise.resolve(
            fetch(`${this.url}/api/${apiVer}/address/${address}`)
                .then((response) => response.json())
                .catch((err: Error) => {
                    console.log(err)
                }),
        )
    }

    public getTx(hash: string): Promise<ITxProp> {
        return Promise.resolve(
            fetch(`${this.url}/api/${this.apiVersion}/tx/${hash}`)
                .then((response) => response.json())
                .catch((err: Error) => {
                    console.log(err)
                }),
        )
    }

    public getPendingTxs(index: number): Promise<{ txs: ITxProp[], length: number, totalCount: number, totalAmount: string, totalFee: string }> {
        return Promise.resolve(
            fetch(`${this.url}/api/${this.apiVersion}/txList/${index}`)
                .then((response) => response.json())
                .catch((err: Error) => {
                    console.log(err)
                }),
        )
    }

    public getNextTxs(address: string, txHash?: string, index?: number): Promise<ITxProp[]> {
        return Promise.resolve(
            fetch(`${this.url}/api/${this.apiVersion}/nextTxs/${address}/${txHash}/${index}`)
                .then((response) => response.json())
                .catch((err: Error) => {
                    console.log(err)
                }),
        )
    }

    public getMinedBlocks(address: string, blockHash: string, index: number): Promise<IMinedInfo[]> {
        return Promise.resolve(
            fetch(`${this.url}/api/${this.apiVersion}/getMinedInfo/${address}/${blockHash}/${index}`)
                .then((response) => response.json())
                .catch((err: Error) => {
                    console.log(err)
                }),
        )
    }

    public async getLedgerWallet(startIndex: number): Promise<IHyconWallet[] | number> {
        try {
            const addresses = ipcRenderer.sendSync("getAddress", startIndex)
            const wallets: IHyconWallet[] = []
            for (const address of addresses) {
                const account = await this.getAddressInfo(address) as IWalletAddress
                if (account.hash === undefined) {
                    throw new Error("Fail to load account.")
                }
                wallets.push({
                    address,
                    balance: account.balance,
                    pendingAmount: account.pendingAmount,
                })
            }
            return wallets
        } catch (e) {
            if (this.isDev) { console.log(`Fail to getLedgerWallet: ${e}`) }
            return 1
        }
    }

    public async sendTxWithLedger(index: number, fromAddress: string, toAddress: string, amount: string, fee: string, txNonce?: number, queueTx?: Function): Promise<{ res: boolean, case?: number }> {
        const status = 1
        try {
            const { from, to, nonce } = await this.prepareSendTx(fromAddress, toAddress, amount, fee, txNonce)
            let protoTx: Uint8Array
            // 1544154600000 = Friday, December 7, 2018 12:50:00 PM GMT+09:00
            // Switch to the new method a little earlier than the fork
            const { height } = await this.getHTipHeight()
            if (height < 444414 && Date.now() <= 1544154600000) {
                protoTx = proto.Tx.encode({ from, to, amount: utils.hyconfromString(amount), fee: utils.hyconfromString(fee), nonce }).finish()
            } else {
                protoTx = proto.Tx.encode({ from, to, amount: utils.hyconfromString(amount), fee: utils.hyconfromString(fee), nonce, networkid: "hycon" }).finish()
            }
            const rawTxHex = bytesToHex(protoTx)
            const singed = ipcRenderer.sendSync("sign", { rawTxHex, index })

            if (!("signature" in singed)) { throw 4 }
            const signedTx = {
                signature: singed.signature,
                from: fromAddress,
                to: toAddress,
                amount,
                fee,
                nonce,
                recovery: singed.recovery,
            }

            const result = await this.outgoingTx(signedTx)

            if (!("txHash" in result) || (typeof result.txHash) !== "string") {
                throw new Error("Fail to transfer hycon.")
            }
            return Promise.resolve({ res: true })
        } catch (e) {
            if (this.isDev) { console.log(e) }
            if (typeof (e) === "number") { return { res: false, case: e } }
            return { res: false, case: status }
        }
    }

    public getNextTxsInBlock(blockhash: string, txHash: string, index: number): Promise<ITxProp[]> {
        return Promise.resolve(
            fetch(`${this.url}/api/${this.apiVersion}/nextTxsInBlock/${blockhash}/${txHash}/${index}`)
                .then((response) => response.json())
                .catch((err: Error) => {
                    console.log(err)
                }),
        )
    }

    public createNewWallet(Hwallet: IHyconWallet): Promise<IHyconWallet | IResponseError> {
        const hdKey = this.hdKeyFromMnemonic(Hwallet.mnemonic, Hwallet.language, Hwallet.passphrase)
        const wallet = this.deriveWallet(hdKey.privateExtendedKey, 0)

        const address = utils.publicKeyToAddress(wallet.publicKey)

        const hyconWallet: IHyconWallet = {
            address: utils.addressToString(address),
        }
        return Promise.resolve(hyconWallet)
    }
    public getTOTP(): Promise<{ iv: string, data: string }> {
        return new Promise((resolve, _) => {
            this.totpDB.find({}, (err: Error, docs: Array<{ iv: string, data: string }>) => {
                if (err) {
                    if (this.isDev) { console.error(err) }
                    return false
                }
                if (docs.length === 0) {
                    return false
                }
                resolve({ iv: docs[0].iv, data: docs[0].data })
            })
        })
    }
    public async saveTOTP(secret: string, totpPw: string): Promise<boolean> {
        try {
            const iv = crypto.randomBytes(16)
            const key = Buffer.from(utils.blake2bHash(totpPw))
            const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
            const encryptedData = Buffer.concat([cipher.update(Buffer.from(secret)), cipher.final()])
            const store: { iv: string, data: string } = {
                iv: iv.toString("hex"),
                data: encryptedData.toString("hex"),
            }
            return new Promise<boolean>((resolve, _) => {
                this.totpDB.insert(store, (err: Error, doc: { iv: string, data: string }) => {
                    if (err) {
                        if (this.isDev) { console.error(err) }
                        resolve(false)
                    }
                    resolve(true)
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

            const key = Buffer.from(utils.blake2bHash(totpPw))
            const iv = Buffer.from(totp.iv, "hex")
            const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
            const encryptedData = Buffer.concat([cipher.update(Buffer.from(secret)), cipher.final()])

            if (totp.data === encryptedData.toString("hex")) {
                return new Promise<{ res: boolean, case?: number }>((resolve, _) => {
                    this.totpDB.remove({ iv: totp.iv }, {}, (err: Error, n: number) => {
                        if (err) {
                            if (this.isDev) { console.error(err) }
                            resolve({ res: false, case: 2 })
                        }
                        resolve({ res: true })
                    })
                })
            }
            return Promise.resolve({ res: false, case: 3 })
        } catch (e) {
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
            const res = tfa.verifyToken(s, token)
            if (res === null || res.delta !== 0) { resolve(false) }
            resolve(true)
        })
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
    public getBlock(hash: string): Promise<IBlock | IResponseError> {
        return Promise.resolve(
            fetch(`${this.url}/api/${this.apiVersion}/block/${hash}`)
                .then((response) => response.json())
                .catch((err: Error) => {
                    console.log(err)
                }),
        )
    }

    public getBlockList(index: number): Promise<{ blocks: IBlock[], length: number }> {
        throw new Error("getBlockList not implemented")
    }

    public getTopTipHeight(): Promise<{ height: number }> {
        throw new Error("getTopTipHeight not implemented")
    }

    public getHTipHeight(): Promise<{ height: number }> {
        return Promise.resolve(
            fetch(`${this.url}/api/${this.apiVersion}/getHTipHeight`)
                .then((response) => response.json())
                .catch((err: Error) => {
                    console.log(err)
                }),
        )
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
        return (this.osArch === "x64") ? Promise.resolve(true) : Promise.resolve(false)
    }

    public async getHDWallet(name: string, password: string, index: number, count: number): Promise<IHyconWallet[] | IResponseError> {
        try {
            const electronWallet = await this.getWallet(name)
            const rootKey = this.decryptWallet(password, electronWallet.iv, electronWallet.data).toString()
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
            const txHashNew = utils.blake2bHash(protoTxNew)
            const privateKey = this.deriveWallet(rootKey, index).privateKey
            const { signature, recovery } = secp256k1.sign(Buffer.from(txHashNew), privateKey)

            let signedTx: ISignedTx
            if (Date.now() <= 1544108400000) {
                const protoTx = proto.Tx.encode(iTx).finish()
                const txHash = utils.blake2bHash(protoTx)
                const oldSignature = secp256k1.sign(Buffer.from(txHash), privateKey)
                signedTx = {
                    amount: tx.amount,
                    fee: tx.minerFee,
                    from: utils.addressToString(from),
                    signature: Buffer.from(oldSignature.signature).toString("hex"),
                    recovery: oldSignature.recovery,
                    to: tx.address,
                    transitionSignature: Buffer.from(signature).toString("hex"),
                    transitionRecovery: recovery,
                    nonce,
                }
            } else {
                signedTx = {
                    amount: tx.amount,
                    fee: tx.minerFee,
                    from: utils.addressToString(from),
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
            const store: IStoredWallet = {
                name: Hwallet.name,
                address: "",
                iv,
                data: encryptedData,
                hint: Hwallet.hint,
            }
            return new Promise<string>((resolve, reject) => {
                this.walletsDB.insert(store, (err: Error, doc: IStoredWallet) => {
                    if (err) {
                        if (this.isDev) { console.error(err) }
                        reject("db")
                    } else {
                        resolve(doc.name)
                    }
                })
            })
        } catch (e) {
            return Promise.reject(e)
        }
    }
    public async checkPasswordBitbox(): Promise<number | boolean> {
        try {
            const resultPasswordCheck = ipcRenderer.sendSync("checkBitboxPasswordSetting")
            if (resultPasswordCheck.error) { return resultPasswordCheck.error }
            return Promise.resolve(resultPasswordCheck)
        } catch (e) {
            return e
        }
    }
    public async checkWalletBitbox(password: string): Promise<number | boolean | { error: number; remain_attemp: string; }> {
        try {
            const resultWalletCheck = ipcRenderer.sendSync("checkBitboxWalletSetting", { password })
            if (resultWalletCheck.error) { return resultWalletCheck.error }
            return Promise.resolve(resultWalletCheck)
        } catch (e) {
            return e
        }
    }
    public async getBitboxWallet(password: string, startIndex: number, count: number): Promise<number | IHyconWallet[]> {
        try {
            const extendedKeys = ipcRenderer.sendSync("getBitboxExtendedKey", { password, startIndex, count })
            if (extendedKeys.error) { return extendedKeys.error }
            const wallets: IHyconWallet[] = []
            for (const extendedKey of extendedKeys) {
                const address = this.getAddressFromExtPubKey(extendedKey)
                const addressInfo = await this.getAddressInfo(address) as IWalletAddress
                if (addressInfo.hash === undefined) {
                    throw new Error("Fail to get Account.")
                }
                wallets.push({
                    address,
                    balance: addressInfo ? addressInfo.balance : "0",
                    pendingAmount: addressInfo ? addressInfo.pendingAmount : "0",
                })
            }
            return wallets
        } catch (e) {
            return e
        }
    }
    public async sendTxWithBitbox(tx: { from: string; password: string; address: string; amount: string; minerFee: string; nonce?: number; }, index: number, queueTx?: Function): Promise<{ res: boolean; case?: number | { error: number; remain_attemp: string; }; }> {
        try {
            const isSetted = ipcRenderer.sendSync("checkBitboxWalletSetting", { password: tx.password })
            if (isSetted.error) { return { res: false, case: isSetted.error } }
            if (!isSetted) { throw 22 }
            const extendedKey = ipcRenderer.sendSync("getBitboxExtendedKey", { password: tx.password, startIndex: index, count: 1 })
            if (extendedKey.error) { return { res: false, case: extendedKey.error } }

            const address = this.getAddressFromExtPubKey(extendedKey[0])
            if (address !== tx.from) { throw 23 }

            const { from, to, nonce } = await this.prepareSendTx(address, tx.address, tx.amount, tx.minerFee, tx.nonce)
            let iTx: proto.ITx
            // 1544154600000 = Friday, December 7, 2018 12:50:00 PM GMT+09:00
            // Switch to the new method a little earlier than the fork
            const { height } = await this.getHTipHeight()
            if (height < 444414 && Date.now() <= 1544154600000) {
                iTx = { from, to, amount: hyconfromString(tx.amount), fee: hyconfromString(tx.minerFee), nonce }
            } else {
                iTx = { from, to, amount: hyconfromString(tx.amount), fee: hyconfromString(tx.minerFee), nonce, networkid: "hycon" }
            }
            const txHash: Uint8Array = utils.blake2bHash(proto.Tx.encode(iTx).finish())
            const path = `m/44'/1397'/0'/0/${index}`
            const hash = Buffer.from(txHash).toString("hex")

            const signResponse = ipcRenderer.sendSync("sendTxWithBitbox", { password: tx.password, path, hash })
            if (signResponse.error) { return signResponse.error }

            const signedTx = {
                signature: signResponse.sig,
                from: address,
                to: tx.address,
                amount: tx.amount,
                fee: tx.minerFee,
                nonce,
                recovery: Number(signResponse.recid),
            }

            const result = await this.outgoingTx(signedTx)

            if (!("txHash" in result) || (typeof result.txHash) !== "string") {
                return { res: false, case: 3 }
            }
            return { res: true }
        } catch (e) {
            console.log(`Error : ${e}`)
            return e
        }
    }
    public async setBitboxPassword(password: string): Promise<number | boolean> {
        try {
            const resultCreatePasword = ipcRenderer.sendSync("createBitboxPassword", { password })
            if (resultCreatePasword.error) { return resultCreatePasword.error }
            return resultCreatePasword
        } catch (e) {
            return e
        }
    }
    public async createBitboxWallet(name: string, password: string): Promise<number | boolean> {
        try {
            const resultCreatewallet = ipcRenderer.sendSync("setBitboxWallet", { name, password })
            if (resultCreatewallet.error) { return resultCreatewallet.error }
            return resultCreatewallet
        } catch (e) {
            return e
        }
    }
    public async updateBitboxPassword(originalPwd: string, newPwd: string): Promise<number | boolean | { error: number; remain_attemp: string; }> {
        try {
            const resultUpdate = ipcRenderer.sendSync("updateBitboxPassword", { originalPwd, newPwd })
            if (resultUpdate.error) { return resultUpdate.error }
            return resultUpdate
        } catch (e) {
            return e
        }
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
    public getPrice(currency: string): Promise<number> {
        return new Promise((resolve, _) => {
            this.priceDB.findOne({ currency }, (err: Error, docs: { currency: string, val: number, timestamp: number }) => {
                if (err) {
                    if (this.isDev) { console.error(err) }
                    return resolve(-1)
                }

                if (docs === null) {
                    this.getHyconPrice(currency).then((res: any) => {
                        const p: number = hyconIntfromString(res[0]["price_" + currency.toLowerCase()])
                        this.insertPrice(currency, p)
                        return resolve(p)
                    }).catch((e: Error) => {
                        alert(e)
                    })
                } else if (Math.round(docs.timestamp / 1000) < (Math.round(Date.now() / 1000) - 300)) {
                    this.getHyconPrice(currency).then((res: any) => {
                        const p: number = hyconIntfromString(res[0]["price_" + currency.toLowerCase()])
                        this.updatePrice(currency, p)
                        return resolve(p)
                    }).catch((e: Error) => {
                        alert(e)
                    })
                } else {
                    return resolve(docs.val)
                }
            })
        })
    }

    private async getWallet(name: string) {
        return new Promise<IStoredWallet>((resolve, reject) => {
            this.walletsDB.findOne({ name }, (err: Error, doc: IStoredWallet) => {
                if (err) {
                    reject(err)
                }

                if (!doc) {
                    reject(new Error(`Wallet '${name}' not found`))
                }

                resolve(doc)
            })
        })
    }

    private encryptWallet(password: string, data: string): { iv: string, encryptedData: string } {
        const iv = crypto.randomBytes(16)
        const key = Buffer.from(utils.blake2bHash(password))
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
        const encryptedData = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()])
        return { iv: iv.toString("hex"), encryptedData: encryptedData.toString("hex") }
    }

    private decryptWallet(password: string, iv: string, data: string) {
        const ivBuffer = Buffer.from(iv, "hex")
        const dataBuffer = Buffer.from(data, "hex")
        const key = utils.blake2bHash(password)
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBuffer)
        const originalData = Buffer.concat([decipher.update(dataBuffer), decipher.final()])
        return originalData
    }

    private decryptTOTP(totpPw: string, iv: string, data: string): Buffer | boolean {
        try {
            const key = Buffer.from(utils.blake2bHash(totpPw))
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
        return new Promise<boolean>((resolve, _) => {
            this.walletsDB.count({ address }, (err: Error, exist: number) => {
                if (err) {
                    if (this.isDev) { console.error(err) }
                    resolve(true)
                }

                exist ? resolve(true) : resolve(false)
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
            throw new Error("Extended PrivateKey does not have privateKey")
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
            const from = utils.addressToUint8Array(fromAddress)
            const address = utils.addressToUint8Array(toAddress)
            checkAddr = true

            const addressInfo = await this.getAddressInfo(fromAddress) as IWalletAddress
            if (addressInfo.hash === undefined) {
                throw new Error(`Fail to prepareSendTx when getAddressInfo`)
            }
            if (addressInfo.nonce < 0) {
                throw 3
            }

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
        const address = utils.publicKeyToAddress(wallet.publicKey)
        const addressString = utils.addressToString(address)
        const addressInfo = await this.getAddressInfo(addressString) as IWalletAddress
        if (addressInfo.hash === undefined) {
            throw new Error(`Fail to getHDWalletInfo when getAddressInfo`)
        }
        const balance = addressInfo.balance
        const pendingAmount = addressInfo.pendingAmount
        const minedBlocks = addressInfo.minedBlocks === undefined ? [] : addressInfo.minedBlocks
        const txs = addressInfo.txs === undefined ? [] : addressInfo.txs
        const pendings = addressInfo.pendings === undefined ? [] : addressInfo.pendings // pending txs
        return { name, address: addressString, balance, minedBlocks, txs, pendingAmount, pendings }
    }

    private getAddressFromExtPubKey(extendedKey: string) {
        const wallet = HDKey.fromExtendedKey(extendedKey)
        return utils.addressToString(utils.publicKeyToAddress(wallet.publicKey))
    }

    private async getHyconPrice(currency: string): Promise<any> {
        try {
            const headers = new Headers()
            headers.append("Accept", "application/json")
            const res = await fetch(`https://api.coinmarketcap.com/v1/ticker/hycon/?convert=${currency}`, {
                headers,
                method: "GET",
            })
            return res.json()
        } catch (e) {
            // tslint:disable-next-line:no-console
            alert(e)
        }
    }

    private async insertPrice(currency: string, price: number): Promise<boolean> {
        try {
            const store: { currency: string, val: number, timestamp: number } = {
                currency,
                val: price,
                timestamp: Date.now(),
            }
            return new Promise<boolean>((resolve, reject) => {
                this.priceDB.insert(store, (err: Error, doc: { currency: string, val: number, timestamp: number }) => {
                    if (err) {
                        if (this.isDev) { console.error(err) }
                        resolve(false)
                    } else {
                        resolve(true)
                    }
                })
            })
        } catch (e) {
            if (this.isDev) { console.error(e) }
            return Promise.resolve(false)
        }
    }
    private async updatePrice(currency: string, price: number): Promise<boolean> {
        try {
            const store: { currency: string, val: number, timestamp: number } = {
                currency,
                val: price,
                timestamp: Date.now(),
            }
            return new Promise<boolean>((resolve, reject) => {
                this.priceDB.update({ currency: store.currency }, { $set: { val: store.val, timestamp: store.timestamp } }, {}, (err: Error, numReplaced: number) => {
                    if (err) {
                        if (this.isDev) { console.error(err) }
                        resolve(false)
                    } else {
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
