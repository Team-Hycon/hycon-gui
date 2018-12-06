import { Tab, Tabs } from "material-ui/Tabs"
import * as QRCode from "qrcode.react"
import * as React from "react"
import update = require("react-addons-update")
import { Redirect } from "react-router"
import { IText } from "../locales/locales"
import { IMinedInfo, IRest, ITxProp, IWalletAddress } from "../rest"
import { MinedBlockLine } from "./minedBlockLine"
import { NotFound } from "./notFound"
import { hyconIntfromString } from "./stringUtil"
import { TxLine } from "./txLine"
interface IAddressProps {
    rest: IRest
    hash: string
    language: IText
    name?: string
    price?: number
    selectedAccount?: string
    walletType?: string
}
interface IAddressView {
    currencyPrice: number
    rest: IRest
    redirectTxView: boolean
    hash: string
    txs: ITxProp[],
    pendings: ITxProp[]
    price: string
    hasMore: boolean,
    hasMoreMinedInfo: boolean
    index: number,
    minedBlocks: IMinedInfo[]
    minerIndex: number,
    name: string,
    notFound: boolean,
    address?: IWalletAddress
    accountIndex?: string
    walletType?: string
}
export class AddressInfo extends React.Component<IAddressProps, IAddressView> {
    public mounted: boolean = false
    constructor(props: IAddressProps) {
        super(props)
        this.state = {
            accountIndex: props.selectedAccount,
            currencyPrice: props.price,
            hasMore: true,
            hasMoreMinedInfo: true,
            hash: props.hash,
            index: 1,
            minedBlocks: [],
            minerIndex: 1,
            name: props.name ? props.name : "",
            notFound: false,
            pendings: [],
            price: "",
            redirectTxView: false,
            rest: props.rest,
            txs: [],
            walletType: props.walletType,
        }
    }
    public componentWillUnmount() {
        this.mounted = false
    }

    public componentWillReceiveProps(newProps: IAddressProps) {
        this.setState({ hash: newProps.hash })
        this.state.rest.setLoading(true)
        this.state.rest.getAddressInfo(newProps.hash).then((data: IWalletAddress) => {
            if (data.hash === undefined) {
                this.setState({ notFound: true })
            }
            this.setState({
                address: data,
                minedBlocks: data.minedBlocks,
                pendings: data.pendings,
                txs: data.txs,
            })
            this.state.rest.setLoading(false)

            if (this.state.currencyPrice !== newProps.price) {
                this.setState({
                    currencyPrice: newProps.price,
                    price: (hyconIntfromString(data.balance) * newProps.price).toFixed(2),
                })
            }
        })
    }
    public componentDidMount() {
        this.mounted = true
        this.state.rest.setLoading(true)
        this.state.rest.getAddressInfo(this.state.hash).then((data: IWalletAddress) => {
            if (data.hash === undefined) {
                this.setState({ notFound: true })
            }
            if (this.mounted) {
                this.setState({ address: data, minedBlocks: data.minedBlocks, pendings: data.pendings, txs: data.txs })
                switch (this.state.walletType) {
                    case "ledger": this.setState({ name: this.props.language["ledger-wallet"] }); break
                    case "bitbox": this.setState({ name: this.props.language["bitbox-wallet"] }); break
                }
            }
            this.state.rest.setLoading(false)

            this.props.rest.getPrice(this.props.language.currency).then((price: number) => {
                const amount: number = hyconIntfromString(data.balance)
                this.setState({
                    currencyPrice: price,
                    price: (amount * price).toFixed(2),
                })
            }).catch((e: Error) => {
                alert(e)
            })
        })
    }

    public makeTransaction() {
        this.setState({ redirectTxView: true })
    }
    public render() {
        if (this.state.notFound) {
            return <NotFound />
        }
        if (!this.state.notFound && this.state.address === undefined) {
            return null
        }
        if (this.state.redirectTxView) {
            if (this.state.walletType === "hdwallet") {
                return <Redirect to={`/maketransactionHDWallet/hdwallet/${this.state.name}/${this.state.hash}/${this.state.accountIndex}`} />
            }
            return <Redirect to={`/maketransactionAddress/${this.state.walletType}/${this.state.hash}/${this.state.accountIndex}`} />
        }
        let count = 0
        let minedIndex = 0
        return (
            <div>
                <button onClick={() => { this.makeTransaction() }} className="mdl-button" style={{ display: `${this.state.accountIndex === undefined ? ("none") : ("block")}`, float: "right" }}>
                    <i className="material-icons">send</i>{this.props.language["button-transfer"]}</button>
                    {(this.state.accountIndex === undefined) ? (<div className="contentTitle">{this.props.language["hycon-address"]}</div>) : (<div className="contentTitle">{this.state.name}</div>)}
                <div className="sumTablesDiv">
                    <table className="tablesInRow twoTablesInRow">
                        <thead>
                            <tr>
                                <th colSpan={2} className="tableBorder_Header tableHeader_floatLeft">{this.props.language.summary}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="tdSubTitle subTitle_width20">{this.props.language["address-placeholder"]}</td>
                                <td>{this.state.hash}</td>
                            </tr>
                            <tr>
                                <td className="tdSubTitle subTitle_width40">{this.props.language["final-balance"]}</td>
                                <td>{this.state.address.balance} HYCON {this.state.accountIndex === undefined ? `` : `(${this.state.price} ${this.props.language.currency})`} </td>
                            </tr>
                        </tbody>
                    </table>
                    <span className="QRSpan">
                        <QRCode size={170} value={this.state.hash} />
                    </span>
                </div>
                <Tabs style={{ paddingTop: "2px" }} inkBarStyle={{ backgroundColor: "#000" }}>
                    <Tab label={this.props.language.transaction} style={{ backgroundColor: "#FFF", color: "#000" }}>
                        {this.state.pendings.map((tx: ITxProp) => {
                            return (
                                <div key={count++}>
                                    <TxLine tx={tx} rest={this.state.rest} index={this.state.accountIndex} address={this.state.hash} name={this.state.name} walletType={this.state.walletType} language={this.props.language} />
                                    <div>
                                        {tx.from === this.state.hash
                                            ? (<button className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent txAmtBtn">-{tx.amount} HYCON</button>)
                                            : (<button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored txAmtBtn">{tx.amount} HYCON</button>)}
                                    </div>
                                </div>
                            )
                        })}
                        {this.state.txs.map((tx: ITxProp) => {
                            return (
                                <div key={count++}>
                                    <TxLine tx={tx} rest={this.state.rest} address={this.state.hash} language={this.props.language} name={this.state.name} />
                                    <div>
                                        {tx.from === this.state.hash
                                            ? (<button className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent txAmtBtn">-{tx.amount} HYCON</button>)
                                            : (<button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored txAmtBtn">{tx.amount} HYCON</button>)}
                                    </div>
                                </div>
                            )
                        })}
                        {this.state.hasMore && this.state.txs.length > 0 ?
                            (<div><button className="btn btn-block btn-info" style={{ width: "100%", cursor: "pointer" }} onClick={() => this.fetchNextTxs()}>{this.props.language["load-more"]}</button></div>)
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
                        {this.state.hasMoreMinedInfo && this.state.minedBlocks.length > 0
                            ? (<div><button className="btn btn-block btn-info" style={{ width: "100%", cursor: "pointer" }} onClick={() => this.fetchNextMinedInfo()}>{this.props.language["load-more"]}</button></div>)
                            : null}
                    </Tab>
                </Tabs>
            </div>
        )
    }
    private fetchNextTxs() {
        this.state.rest.getNextTxs(this.state.hash, this.state.txs[0].hash, this.state.index).then((result: ITxProp[]) => {
            if (result.length === 0) { this.setState({ hasMore: false }) }
            this.setState({
                index: this.state.index + 1,
                txs: update(this.state.txs, { $push: result }),
            })
        })
    }

    private fetchNextMinedInfo() {
        this.state.rest.getMinedBlocks(this.state.hash, this.state.minedBlocks[0].blockhash, this.state.minerIndex).then((result: IMinedInfo[]) => {
            if (result.length === 0) { this.setState({ hasMoreMinedInfo: false }) }
            this.setState({
                minedBlocks: update(this.state.minedBlocks, { $push: result }),
                minerIndex: this.state.minerIndex + 1,
            })
        })
    }
}
