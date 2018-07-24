import { Button } from "@material-ui/core"
import { Dialog } from "material-ui"
import Avatar from "material-ui/Avatar"
import { Tab, Tabs } from "material-ui/Tabs"
import * as QRCode from "qrcode.react"
import * as React from "react"
import update = require("react-addons-update")
import * as CopyToClipboard from "react-copy-to-clipboard"
import { Redirect } from "react-router"
import { IText } from "./locales/locales"
import { Login } from "./login"
import { MinedBlockLine } from "./minedBlockLine"
import { NotFound } from "./notFound"
import { IHyconWallet, IMinedInfo, IResponseError, IRest, ITxProp } from "./rest"
import { TxLine } from "./txLine"
interface IWalletDetailProps {
    rest: IRest
    language: IText
    name: string
    wallet: IHyconWallet
    minedBlocks: IMinedInfo[]
    accounts: IHyconWallet[]
    notFound: boolean
}
export class WalletDetail extends React.Component<any, any> {
    public mounted: boolean = false
    constructor(props: any) {
        super(props)
        this.state = {
            accounts: [],
            address: "",
            hasMore: true,
            hasMoreMinedInfo: true,
            index: 1,
            login: false,
            minedBlocks: [],
            minerIndex: 1,
            name: props.name,
            notFound: false,
            pendings: [],
            rest: props.rest,
            txs: [],
            visible: false,
        }
    }
    public componentWillUnmount() {
        this.mounted = false
    }

    public componentDidMount() {
        this.mounted = true
        this.props.rest.setLoading(true)
        this.props.rest.getWalletDetail(this.state.name).then((data: IHyconWallet & IResponseError) => {
            this.state.rest.setLoading(false)
            if (this.mounted && data.address) {
                this.setState({ wallet: data, address: data.address, txs: data.txs, minedBlocks: data.minedBlocks, pendings: data.pendings })
            } else {
                this.setState({ notFound: true })
            }
        }).catch((e: Error) => {
            alert(e)
        })
    }
    public handleSelectAccount(option: any) {
        this.setState({ represent: option.target.value })
    }
    public deleteWallet() {
        if (confirm(this.props.language["alert-delete-wallet"])) {
            this.state.rest.deleteWallet(this.state.name).then((isDeleted: boolean) => {
                if (isDeleted === true) {
                    alert(this.props.language["alert-delete-success"])
                    this.setState({ redirect: true })
                } else {
                    alert(this.props.language["alert-delete-failed"])
                }
            })
        }
    }
    public accountSelected() {
        this.state.rest.setLoading(true)
        this.state.rest.changeAccount(this.state.name, this.state.represent).then((isChanged: boolean) => {
            if (isChanged) {
                this.setState({ visible: false, wallet: undefined })
                this.state.rest.getWalletDetail(this.state.name).then((data: IHyconWallet) => {
                    this.state.rest.setLoading(false)
                    if (this.mounted) {
                        this.setState({ wallet: data })
                    }
                })
            } else {
                alert("Fail to change account")
                this.setState({ visible: false })
                this.state.rest.setLoading(false)
            }
        })
    }
    public cancelDialog() {
        this.setState({ login: false })
    }
    public searchAllAccounts() {
        this.state.rest.getAllAccounts(this.state.name).then((result: { represent: number, accounts: Array<{ address: string, balance: number }> } | boolean) => {
            if (typeof result === "boolean") { alert(`${this.props.language["alert-load-address-failed"]}`) } else {
                this.setState({ visible: true, accounts: result.accounts, represent: result.represent })
            }
        })
    }

    public transfer() {
        this.setState({ isTransfer: true })
    }

    public login() {
        this.setState({ login: true })
    }
    public render() {
        let accountIndex = 0
        let minedIndex = 0
        if (this.state.notFound) {
            return <NotFound />
        }
        if (!this.state.notFound && this.state.wallet === undefined) {
            return null
        }
        if (this.state.redirect) {
            return <Redirect to="/wallet" />
        }
        if (this.state.isTransfer) {
            return <Redirect to={`/transaction/${this.state.name}`} />
        }
        return (
            <div>
                <table className="table_wallet_txs">
                    <thead>
                        <tr>
                            <td colSpan={2} className="walletDetailFunctionTd">
                                <button onClick={() => { this.login() }} className="mdl-button">
                                    <i className="material-icons">assignment_ind</i>{this.props.language["button-claim"]}</button>
                                <button onClick={() => { this.transfer() }} className="mdl-button">
                                    <i className="material-icons">send</i>{this.props.language["button-transfer"]}</button>
                                <button onClick={() => { this.deleteWallet() }} className="mdl-button">
                                    <i className="material-icons">delete</i>{this.props.language["button-forget"]}</button>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <table className="walletTable_NameAddr">
                                    <tbody>
                                        <tr>
                                            <td className="walletNameTd">
                                                <span>
                                                    <Avatar style={{ width: "35px", height: "35px" }} icon={<i className="material-icons walletIcon_white">account_balance_wallet</i>} />
                                                </span>
                                                <span className="walletName">{this.state.name}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><br />
                                                <span>
                                                    <i className="material-icons">account_balance</i>
                                                </span>
                                                <span style={{ fontSize: "17px" }} className="walletName">
                                                    {this.state.wallet.balance} HYCON
                                                </span><br />
                                                <span style={{ marginLeft: "25px", fontSize: "14px" }} className="walletName">
                                                    pending: {this.state.wallet.pendingAmount} HYCON
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2}><br />
                                                <button className="mdl-button flaotLeft copyBtn">
                                                    <CopyToClipboard text={this.state.wallet.address} onCopy={() => this.setState({ copied: true })} >
                                                        <span>
                                                            <i className="material-icons">content_copy</i>
                                                        </span>
                                                    </CopyToClipboard>
                                                </button>
                                                <div className="flaotLeft addressDiv">
                                                    {this.state.wallet.address}
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <span className="QRCodeInWalletDetail">
                                    <QRCode size={120} value={this.state.wallet.address} />
                                </span>
                            </td>
                            <td />
                        </tr>
                    </tbody>
                </table>
                <Tabs style={{ paddingTop: "2px" }} inkBarStyle={{ backgroundColor: "#000" }}>
                    <Tab label={this.props.language.transaction} style={{ backgroundColor: "#FFF", color: "#000" }}>
                        {this.state.pendings.map((tx: ITxProp) => {
                            return (
                                <div key={accountIndex++}>
                                    <TxLine tx={tx} rest={this.state.rest} address={this.state.address} name={this.state.name}/>
                                    {tx.from === this.state.address ?
                                        (<button className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent txAmtBtn">-{tx.estimated} HYCON</button>)
                                        :
                                        (<button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored txAmtBtn">{tx.amount} HYCON</button>)}
                                </div>
                            )
                        })}
                        {this.state.txs.map((tx: ITxProp) => {
                            return (
                                <div key={accountIndex++}>
                                    <TxLine tx={tx} rest={this.state.rest} address={this.state.address}/>
                                    {tx.from === this.state.address ?
                                        (<button className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent txAmtBtn">-{tx.estimated} HYCON</button>)
                                        :
                                        (<button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored txAmtBtn">{tx.amount} HYCON</button>)}
                                </div>
                            )
                        })}
                        {this.state.hasMore && this.state.txs.length > 0 ?
                            (<div><button className="btn btn-block btn-info" style={{width: "100%", cursor: "pointer"}} onClick={() => this.fetchNextTxs()}>{this.props.language["load-more"]}</button></div>)
                            : null}
                    </Tab>
                    <Tab label={this.props.language["mine-reward"]} style={{ backgroundColor: "#FFF", color: "#000" }}>
                        <table className="mdl-data-table mdl-js-data-table mdl-shadow--2dp table_margined">
                            <thead>
                                <tr>
                                    <th className="mdl-data-table__cell--non-numeric">{this.props.language["block-hash"]}</th>
                                    <th className="mdl-data-table__cell--non-numeric">{this.props.language["miner-address"]}</th>
                                    <th className="mdl-data-table__cell--numeric" style={{ paddingRight: "10%" }}>{this.props.language["fee-reward"]}</th>
                                    <th className="mdl-data-table__cell--non-numeric">{this.props.language.timestamp}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.minedBlocks.map((minedInfo: IMinedInfo) => {
                                    return <MinedBlockLine key={minedIndex++} minedInfo={minedInfo} />
                                })}
                            </tbody>
                        </table>
                        <br />
                        {this.state.hasMoreMinedInfo && this.state.minedBlocks.length > 0 ?
                            (<div><button className="btn btn-block btn-info" style={{ width: "100%", cursor: "pointer" }} onClick={() => this.fetchNextMinedInfo()}>{this.props.language["load-more"]}</button></div>)
                            : null}
                    </Tab>
                </Tabs>
                <Dialog className="dialog" open={this.state.login}>
                    <Login address={this.state.wallet.address} rest={this.props.rest} language={this.props.language} cancelDialog={this.cancelDialog.bind(this)} />
                    <Button color="primary" id="modal_cancel" onClick={this.cancelDialog.bind(this)} >{this.props.language["button-close"]}</Button>
                </Dialog>
            </div >
        )
    }
    private fetchNextTxs() {
        this.state.rest.getNextTxs(this.state.wallet.address, this.state.txs[0].hash, this.state.index).then((result: ITxProp[]) => {
            if (result.length === 0) { this.setState({ hasMore: false }) }
            this.setState({
                index: this.state.index + 1,
                txs: update(this.state.txs, { $push: result }),
            })
        })
    }

    private fetchNextMinedInfo() {
        this.state.rest.getMinedBlocks(this.state.wallet.address, this.state.minedBlocks[0].blockhash, this.state.minerIndex).then((result: IMinedInfo[]) => {
            if (result.length === 0) { this.setState({ hasMoreMinedInfo: false }) }
            this.setState({
                minedBlocks: update(this.state.minedBlocks, { $push: result }),
                minerIndex: this.state.minerIndex + 1,
            })
        })
    }
}
