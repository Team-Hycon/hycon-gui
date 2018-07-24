import { Tab, Tabs } from "material-ui/Tabs"
import * as QRCode from "qrcode.react"
import * as React from "react"
import update = require("react-addons-update")
import { Redirect } from "react-router"
import { IText } from "./locales/locales"
import { MinedBlockLine } from "./minedBlockLine"
import { IMinedInfo, IRest, ITxProp, IWalletAddress } from "./rest"
import { TxLine } from "./txLine"
interface IAddressProps {
    rest: IRest
    hash: string
    language: IText
    selectedLedger?: number
}
interface IAddressView {
    rest: IRest
    redirectTxView: boolean
    hash: string
    txs: ITxProp[]
    pendings: ITxProp[]
    hasMore: boolean
    hasMoreMinedInfo: boolean
    index: number
    minedBlocks: IMinedInfo[]
    minerIndex: number
    address?: IWalletAddress
    ledgerIndex?: number
}
export class AddressInfo extends React.Component<IAddressProps, IAddressView> {
    constructor(props: IAddressProps) {
        super(props)
        this.state = {
            hasMore: true,
            hasMoreMinedInfo: true,
            hash: props.hash,
            index: 1,
            ledgerIndex: props.selectedLedger,
            minedBlocks: [],
            minerIndex: 1,
            pendings: [],
            redirectTxView: false,
            rest: props.rest,
            txs: [],
        }
    }

    public componentWillReceiveProps(newProps: IAddressProps) {
        this.setState({ hash: newProps.hash })
        this.state.rest.setLoading(true)
        this.state.rest.getAddressInfo(newProps.hash).then((data: IWalletAddress) => {
            this.setState({
                address: data,
                minedBlocks: data.minedBlocks,
                pendings: data.pendings,
                txs: data.txs,
            })
            this.state.rest.setLoading(false)
        })
    }
    public componentWillMount() {
        this.state.rest.setLoading(true)
        this.state.rest.getAddressInfo(this.state.hash).then((data: IWalletAddress) => {
            this.setState({
                address: data,
                minedBlocks: data.minedBlocks,
                pendings: data.pendings,
                txs: data.txs,
            })
            this.state.rest.setLoading(false)
        })
    }
    public makeTransaction() {
        this.setState({ redirectTxView: true })
    }
    public render() {
        if (this.state.address === undefined) {
            return null
        }
        if (this.state.redirectTxView) {
            return <Redirect to={`/maketransaction/true/${this.state.ledgerIndex}`} />
        }
        let count = 0
        let minedIndex = 0
        return (
            <div>
                <button onClick={() => { this.makeTransaction() }} className="mdl-button" style={{ display: `${this.state.ledgerIndex === undefined ? ("none") : ("block")}`, float: "right" }}>
                    <i className="material-icons">send</i>{this.props.language["button-transfer"]}</button>
                {(this.state.ledgerIndex === undefined) ? (<div className="contentTitle">{this.props.language["hycon-address"]}</div>) : (<div className="contentTitle">{this.props.language["ledger-wallet"]}</div>)}
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
                                <td>{this.state.address.balance}</td>
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
                                    <TxLine tx={tx} rest={this.state.rest} address={this.state.address} />
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
                                    <TxLine tx={tx} rest={this.state.rest} address={this.state.address} />
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
