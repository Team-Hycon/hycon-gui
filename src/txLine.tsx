import { Button, Dialog, DialogTitle, Grid, Icon, IconButton } from "@material-ui/core"
import * as React from "react"
import { Link, Redirect } from "react-router-dom"
import { IRest, ITxProp, IWalletAddress } from "./rest"
interface ITxLineProps {
    rest: IRest
    tx: ITxProp
    address?: IWalletAddress
    name?: string
}
interface ITxLineView {
    rest: IRest
    tx: ITxProp
    address?: IWalletAddress
    name?: string
    redirect?: boolean
    dialogPending?: boolean
}
export class TxLine extends React.Component<ITxLineProps, ITxLineView> {
    constructor(props: ITxLineProps) {
        super(props)
        this.state = { tx: props.tx, rest: props.rest, address: props.address ? props.address : undefined, name : props.name, redirect: false }
    }
    public componentWillReceiveProps(newProps: ITxLineProps) {
        this.setState(newProps)
    }
    public render() {
        if (this.state.redirect) {
            return <Redirect to={`/transaction/${this.state.name}/${this.state.tx.nonce}`}/>
        }
        const date = new Date(this.state.tx.receiveTime)
        return (
            <div>
            <table className="table_margined">
                <thead>
                    <tr>
                        <th colSpan={4} className="tableBorder_Header">
                            {this.state.tx.receiveTime ? (
                                <div>
                                    <Link to={`/tx/${this.state.tx.hash}`}>
                                        <span className="coloredText">{this.state.tx.hash}</span>
                                    </Link>
                                    <span className="timeStampArea">
                                        {date.toString()}
                                    </span>

                                </div>
                            ) : (
                                    <div>
                                        <span className="coloredText" style={{color: "black"}}>{this.state.tx.hash}<IconButton style={{ width: "16px", height: "16px", marginBottom: "5px", marginLeft: "5px", display: `${this.state.name === undefined ? ("none") : ("inline")}` }} onClick={() => { this.changePendingTx() }}><Icon style={{ fontSize: "17px" }}>edit</Icon></IconButton></span>
                                        <span className="timeStampArea textRed"> Pending </span>
                                    </div>
                                )}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="coloredText tableDivision txAddrTd">
                            {this.state.tx.from ? (
                                (this.state.tx.from === (this.state.address !== undefined ? this.state.address.hash : undefined) ?
                                    <div>{this.state.tx.from}</div> :
                                    <Link to={`/address/${this.state.tx.from}`}>
                                        {this.state.tx.from}
                                    </Link>)
                            ) : (
                                    <span className="NoFrom">No Inputs(Newly Generated Coins)</span>
                                )}
                        </td>
                        <td>
                            <i className="material-icons">forward</i>
                        </td>
                        <td className="coloredText tableDivision txAddrTd">
                            {this.state.tx.to
                            ? (this.state.tx.to === (this.state.address !== undefined ? this.state.address.hash : undefined)
                                ? <div>{this.state.tx.to}</div>
                                : <Link to={`/address/${this.state.tx.to}`}>{this.state.tx.to}</Link>
                            ) : (<span className="CantDecode">Unable to decode output address</span>)}
                        </td>
                        <td className="tableDivision amountTd">
                            {this.state.tx.amount + " HYCON"}<br />
                            {this.state.tx.fee ? (<span className="fee-font">Fee : {this.state.tx.fee} HYCON</span>) : ""}
                        </td>
                    </tr>
                </tbody>
            </table>
            <Dialog open={this.state.dialogPending} onClose={() => { this.setState({ dialogPending: false }) }} style={{ width: "100%", height: "100%" }}>
                <DialogTitle id="simple-dialog-title" style={{ textAlign: "center" }}>Caution</DialogTitle>
                <div style={{ margin: "2em" }}>
                    <div>Test</div>
                    <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                        <Button variant="raised" onClick={() => { this.setState({ redirect: true }) }} style={{ backgroundColor: "#50aaff", color: "white", margin: "0 10px" }} >I Agree</Button>
                        <Button variant="raised" onClick={() => { this.setState({ dialogPending: false }) }} style={{ backgroundColor: "rgb(225, 0, 80)", color: "white" }}>Cancel</Button>
                    </Grid>
                </div>
            </Dialog>
            </div>
        )
    }

    private changePendingTx() {
        this.setState({dialogPending: true})
    }
}
