import * as React from "react"
import { Link } from "react-router-dom"
import { IText } from "../locales/locales"
import { IRest, ITxProp } from "../rest"
import { NotFound } from "./notFound"
import { TxLine } from "./txLine"
interface ITxProps {
    rest: IRest
    hash: string
    tx: ITxProp
    language: IText
    notFound: boolean
}

export class TxView extends React.Component<any, any> {
    public mounted: boolean = false
    constructor(props: ITxProps) {
        super(props)
        this.state = {
            hash: props.hash,
            notFound: false,
            rest: props.rest,
        }
    }
    public componentWillUnMount() {
        this.mounted = false
    }
    public componentDidMount() {
        this.mounted = true
        this.state.rest.setLoading(true)
        this.state.rest.getTx(this.state.hash)
            .then((data: ITxProp) => {
                this.state.rest.setLoading(false)
                if (data.hash === undefined) {
                    this.setState({ notFound: true })
                } else {
                    this.setState({ tx: data })
                }
            })
    }
    public render() {
        if (this.state.notFound) {
            return <NotFound />
        }
        if (!this.state.notFound && this.state.tx === undefined) {
            return null
        }
        const date = new Date(this.state.tx.receiveTime)
        return (
            <div>
                <div className="contentTitle">Transaction</div>
                <div>
                    <TxLine rest={this.state.rest} tx={this.state.tx} />
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored txAmtBtn green">
                        {this.state.tx.estimated + " HYCON"}
                    </button>
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored txAmtBtn">
                        {this.state.tx.confirmation} Confirmations
                    </button>
                </div>
                <div className="mdl-grid">
                    <table className="mdl-cell mdl-data-table mdl-js-data-table mdl-shadow--2dp table_margined tablesInRow txSummaryTable">
                        <thead>
                            <tr>
                                <th
                                    colSpan={2}
                                    className="mdl-data-table__cell--non-numeric tableHeader_floatLeft"
                                >
                                    Summary
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="mdl-data-table__cell--non-numeric">
                                    Received Time
                                </td>
                                <td className="numericTd">{date.toString()}</td>
                            </tr>
                            <tr>
                                <td className="mdl-data-table__cell--non-numeric">
                                    Included In Blocks
                                </td>
                                <td className="numericTd">
                                    {this.state.tx.blockHash}
                                </td>
                            </tr>
                            <tr>
                                <td className="mdl-data-table__cell--non-numeric">Fees</td>
                                <td className="numericTd">{this.state.tx.fee} HYCON</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
