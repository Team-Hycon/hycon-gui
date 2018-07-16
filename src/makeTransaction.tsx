import { Dialog, FormControl, FormControlLabel, FormLabel, Input, InputLabel, Radio, RadioGroup, Select } from "@material-ui/core"
import Button from "@material-ui/core/Button"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import Icon from "@material-ui/core/Icon"
import { Card, CircularProgress, MenuItem, TextField } from "material-ui"
import * as React from "react"
import update = require("react-addons-update")
import { Redirect } from "react-router"
import { AddressBook } from "./addressBook"
import { IHyconWallet, IRest } from "./rest"
import { hyconfromString } from "./stringUtil"

export class MakeTransaction extends React.Component<any, any> {
    public ledgerTimer: any // NodeJS.Timer
    public mounted = false
    public mapWallets: Map<string, IHyconWallet>

    constructor(props: any) {
        super(props)

        this.state = {
            address: "",
            amount: 0,
            dialog: false,
            favorites: [],
            fromAddress: "",
            isLedger: props.isLedger,
            isLoad: false,
            isLoading: false,
            isSelect: false,
            ledgerAccounts: [],
            ledgerStartIndex: 0,
            minerFee: 1,
            name: "",
            pendingAmount: "0",
            piggyBank: "0",
            rest: props.rest,
            selectedLedger: "",
            txStep: false,
            wallets: [],
        }
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.prevPage = this.prevPage.bind(this)
        this.handleLedgerAccount = this.handleLedgerAccount.bind(this)
        this.getLedgerAccounts = this.getLedgerAccounts.bind(this)
        this.mapWallets = new Map<string, IHyconWallet>()
    }
    public componentWillUnmount() {
        this.mounted = false
        window.clearTimeout(this.ledgerTimer)
    }
    public componentDidMount() {
        this.mounted = true
        this.state.rest.setLoading(true)
        if (this.state.isLedger === true || this.state.isLedger === "true") {
            this.getLedgerAccounts()
        } else {
            this.state.rest.getWalletList().then((data: { walletList: IHyconWallet[], length: number }) => {
                for (const wallet of data.walletList) {
                    this.mapWallets.set(wallet.address, wallet)
                }
                if (this.mounted) {
                    this.setState({ wallets: data.walletList, isLedger: false, isSelect: true, isLoad: true, txStep: true })
                }
                this.getFavorite()
                this.state.rest.setLoading(false)
            })
        }
    }

    public handlePassword(data: any) {
        this.setState({ password: data.target.value })
    }

    public handleInputChange(event: any) {
        const name = event.target.name
        const value = event.target.value
        if (name === "fromAddress") {
            const wallet = this.mapWallets.get(value)
            this.setState({ name: wallet.name, fromAddress: value, piggyBank: wallet.balance, pendingAmount: wallet.pendingAmount })
        } else {
            this.setState({ [name]: value })
        }
    }

    public async handleSubmit(event: any) {
        const pattern1 = /(^[0-9]*)([.]{0,1}[0-9]{0,9})$/
        if (this.state.amount <= 0) {
            alert("Enter a valid transaction amount")
            return
        }
        if (this.state.amount.match(pattern1) == null) {
            alert("Please enter a number with up to 9 decimal places")
            return
        }
        if (hyconfromString(event.target.value).add(hyconfromString(this.state.minerFee)).greaterThan(hyconfromString(this.state.piggyBank).sub(hyconfromString(this.state.pendingAmount)))) {
            alert("You can't spend the money you don't have")
            return
        }
        if (hyconfromString(this.state.minerFee).compare(hyconfromString("0")) === 0) {
            alert("Enter a valid miner fee")
            return
        }
        if (this.state.fromAddress === this.state.address) {
            alert("You cannot send HYCON to yourself")
            return
        }
        if (this.state.address === "" || this.state.address === undefined) {
            alert("Enter a to address")
            return
        }
        if (this.state.name === "" || this.state.fromAddress === "") {
            alert("Please check your from account.")
            return
        }

        this.setState({ isLoading: true })

        if (this.state.isLedger === true || this.state.isLedger === "true") {
            this.state.rest.sendTxWithLedger(Number(this.state.selectedLedger), this.state.fromAddress, this.state.address, this.state.amount.toString(), this.state.minerFee.toString()).then((result: { res: boolean, case: number }) => {
                this.alertResult(result)
            })
        } else {
            const namecheck = this.mapWallets.get(this.state.fromAddress)
            if (this.state.name !== namecheck.name) {
                alert(`Please try again.`)
                return
            }
            this.state.rest.sendTx({ name: this.state.name, password: this.state.password, address: this.state.address, amount: this.state.amount.toString(), minerFee: this.state.minerFee.toString() })
                .then((result: { res: boolean, case?: number }) => {
                    this.alertResult(result)
                })
        }
        event.preventDefault()
    }
    public handleCancel(event: any) {
        this.setState({ redirect: true })
    }

    public render() {
        let walletIndex = 0
        if (this.state.redirect) {
            return <Redirect to={`/wallet`} />
        }
        if (!this.state.isLoad) {
            return (
                <div style={{ textAlign: "center", marginTop: "11%" }}>
                    <CircularProgress style={{ marginRight: "5px" }} size={50} thickness={2} /> LOADING
                </div>
            )
        }
        return (
            <div style={{ width: "80%", margin: "auto" }}>
                <Card>
                    <h3 style={{ color: "grey", textAlign: "center" }}><Icon style={{ transform: "rotate(-25deg)", marginRight: "10px", color: "grey" }}>send</Icon>{this.props.language["send-transaction"]}</h3><br />
                    <CardContent style={{ display: `${this.state.txStep ? ("none") : ("block")}` }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ overflow: "scroll", height: "19em", margin: "1%" }}>
                                <table className="mdl-data-table mdl-js-data-table mdl-shadow--2dp" style={{ width: "100%", border: "0" }}>
                                    <thead>
                                        <tr>
                                            <th className="mdl-data-table__cell--non-numeric"> </th>
                                            <th className="mdl-data-table__cell--non-numeric">{this.props.language["wallet-address"]}</th>
                                            <th className="mdl-data-table__cell--numeric" style={{ paddingRight: "10%" }}>{this.props.language["wallet-balance"]}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.ledgerAccounts.map((account: IHyconWallet, idx: number) => {
                                            return (
                                                <tr key={idx}>
                                                    <td className="mdl-data-table__cell--non-numeric" style={{ padding: "0 0 0 0" }}>
                                                        <Radio
                                                            checked={this.state.selectedLedger === String(idx)}
                                                            onChange={this.handleInputChange}
                                                            value={String(idx)}
                                                            name="selectedLedger"
                                                        />
                                                    </td>
                                                    <td className="mdl-data-table__cell--non-numeric">{account.address}</td>
                                                    <td className="mdl-data-table__cell--numeric" style={{ paddingRight: "10%" }}>{account.balance} HYCON</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {/* <FormLabel component="legend">Select account to use</FormLabel>
                            <div style={{ overflow: "scroll", height: "17em", margin: "1%" }}>
                                <RadioGroup style={{ marginBottom: "5%", display: "inline-block" }} aria-label="selectedLedger" name="selectedLedger" value={this.state.selectedLedger} onChange={this.handleInputChange}>
                                    {this.state.ledgerAccounts.map((account: IHyconWallet, idx: number) => {
                                        const addresesBalance = account.address + " / " + account.balance + "HYCON"
                                        return <FormControlLabel style={{ width: "49%" }} key={idx} value={String(idx)} control={<Radio />} label={addresesBalance} />
                                    })}
                                </RadioGroup>
                            </div> */}
                            <Grid container direction={"row"} justify={"flex-end"} alignItems={"flex-end"}>
                                <Button variant="outlined" onClick={this.getLedgerAccounts}>{this.props.language["load-more"]}</Button>
                            </Grid>
                            <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                                <Button onClick={this.handleCancel}>{this.props.language["button-cancel"]}</Button>
                                <Button onClick={this.handleLedgerAccount}>{this.props.language["button-next"]}</Button>
                            </Grid>
                        </div>
                    </CardContent>
                    <CardContent style={{ display: `${this.state.txStep ? ("block") : ("none")}` }}>
                        <div style={{ textAlign: "center" }}>
                            <Grid container direction={"row"} justify={"flex-end"} alignItems={"flex-end"}>
                                <Button variant="raised" onClick={() => { this.setState({ dialog: true }) }} style={{ backgroundColor: "#f2d260", color: "white", float: "right", margin: "0 10px" }}>
                                    <Icon>bookmark</Icon><span style={{ marginLeft: "5px" }}>{this.props.language["address-book"]}</span>
                                </Button>
                            </Grid>
                            {(this.state.isSelect)
                                ? (<FormControl style={{ width: "330px", marginTop: "1.5%" }}>
                                    <InputLabel style={{ top: "19px", transform: "scale(0.75) translate(0px, -28px)", color: "rgba(0, 0, 0, 0.3)", fontSize: "16px" }} htmlFor="fromAddress">{this.props.language["from-address"]}</InputLabel>
                                    <Select value={this.state.fromAddress} onChange={this.handleInputChange} input={<Input name="fromAddress" />}>
                                        {this.state.wallets.map((wallet: IHyconWallet) => {
                                            return (
                                                <MenuItem key={walletIndex++} value={wallet.address}>{wallet.address}</MenuItem>
                                            )
                                        })}
                                    </Select>
                                </FormControl>)
                                : (<TextField style={{ width: "330px" }} floatingLabelFixed={true} floatingLabelText={this.props.language["from-address"]} type="text" disabled={true} value={this.state.fromAddress} />)
                            }
                            <TextField name="address" floatingLabelFixed={true} style={{ marginLeft: "30px", width: "330px" }} floatingLabelText={this.props.language["to-address"]} type="text" value={this.state.address} onChange={this.handleInputChange} />
                            <br />
                            <TextField style={{ width: "330px" }} floatingLabelFixed={true} floatingLabelText={this.props.language["wallet-balance"]} type="text" disabled={true} value={this.state.piggyBank} />
                            <TextField style={{ marginLeft: "30px", width: "330px" }} name="amount" floatingLabelFixed={true} floatingLabelText={this.props.language["total-amount"]} type="text" value={this.state.amount} max={this.state.piggyBank} onChange={this.handleInputChange} />
                            <br />
                            <TextField floatingLabelText={this.props.language["wallet-pending"]} floatingLabelFixed={true} style={{ width: "330px" }} type="text" disabled={true} value={this.state.pendingAmount} />
                            <TextField name="minerFee" floatingLabelFixed={true} style={{ marginLeft: "30px", width: "330px" }} floatingLabelText={this.props.language.fees} type="text" value={this.state.minerFee} onChange={this.handleInputChange} />
                            <br />
                            <TextField name="password" floatingLabelFixed={true} style={{ marginRight: "20px", width: "330px", display: `${this.state.isLedger ? ("none") : ("inline-block")}` }} floatingLabelText={this.props.language.password} value={this.state.password} type="password" autoComplete="off" onChange={(data) => { this.handlePassword(data) }} />
                            {/* {this.state.isHint ? (<span style={{ fontSize: "12px" }}>(Password Hint: {this.state.hint})</span>) : (<Button onClick={(e) => this.showHint(e)}>Hint</Button>)} */}
                            <br /><br />
                            <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                                {(this.state.isLedger ?
                                    (<Button onClick={this.prevPage}>{this.props.language["button-previous"]}</Button>)
                                    : (<Button onClick={this.handleCancel}>{this.props.language["button-cancel"]}</Button>))}
                                <Button onClick={this.handleSubmit}>{this.props.language["button-transfer"]}</Button>
                            </Grid>
                        </div>
                    </CardContent>
                </Card >

                {/* ADDRESSBOOK */}
                <Dialog open={this.state.dialog} onClose={() => { this.setState({ dialog: false }) }}>
                    <AddressBook rest={this.state.rest} favorites={this.state.favorites} language={this.props.language} isWalletView={false} callback={(address: string) => { this.handleListItemClick(address) }} />
                </Dialog>

                {/* LOADING */}
                <Dialog open={this.state.isLoading} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
                    <div style={{ textAlign: "center" }}>
                        <CircularProgress style={{ marginRight: "5px" }} size={50} thickness={2} /> {this.props.language.loading}
                    </div>
                </Dialog>
            </div >
        )
    }
    private handleListItemClick(toAddr: string) {
        this.setState({ address: toAddr, dialog: false })
    }

    private getFavorite() {
        this.state.rest.getFavoriteList()
            .then((data: Array<{ alias: string, address: string }>) => {
                if (this.mounted) { this.setState({ favorites: data }) }
            })
    }

    private alertResult(result: { res: boolean, case?: number }) {
        if (result.res === true) {
            alert(`A transaction of ${this.state.amount} HYCON has been submitted to ${this.state.address} with ${this.state.minerFee} HYCON as miner fees.`)
            this.setState({ redirect: true })
            return
        }
        if (result.case === 1) {
            alert("Invalid address: Please check 'To Address' input")
            this.setState({ isLoading: false })
        } else if (result.case === 2) {
            if (this.state.isLedger) {
                alert("Fail to sign: Please check connection with Ledger")
                this.setState({ isLoading: false })
            } else {
                alert("Invalid password: Please check your password")
                this.setState({ isLoading: false, password: "" })
            }
        } else if (result.case === 3) {
            alert("Fail to transfer hycon")
            this.setState({ redirect: true })
            window.location.reload()
        }
    }

    private getLedgerAccounts() {
        this.state.rest.getLedgerWallet(this.state.ledgerStartIndex).then((result: IHyconWallet[] | number) => {
            window.clearTimeout(this.ledgerTimer)
            if (this.mounted) {
                if (typeof (result) !== "number") {
                    this.setState({ isLedger: true, isLoad: true, ledgerStartIndex: this.state.ledgerStartIndex + result.length })
                    this.setState({ ledgerAccounts: update(this.state.ledgerAccounts, { $push: result }) })
                } else {
                    alert(`Please check connection and launch Hycon app.`)
                    this.setState({ isLoad: true, isLedger: true, redirect: true })
                    window.location.reload()
                }
            }
            this.getFavorite()
            this.state.rest.setLoading(false)
        })
        this.ledgerTimer = setTimeout(() => {
            alert(`Fail to load Ledger wallet. Please check connection and launch Hycon app.`)
            this.setState({ isLoad: true, isLedger: true, redirect: true })
            window.location.reload()
        }, 20000)
    }

    private handleLedgerAccount() {
        if (this.state.selectedLedger === "") {
            alert(`Please select account to use`)
            return
        }
        const account = this.state.ledgerAccounts[Number(this.state.selectedLedger)]
        this.setState({ name: "ledgerWallet", txStep: true, isLedger: true, fromAddress: account.address, piggyBank: account.balance, pendingAmount: account.pendingAmount })
    }

    private prevPage() {
        this.setState({
            address: "",
            amount: 0,
            fromAddress: "",
            isLedger: true,
            minerFee: 1,
            pendingAmount: "0",
            piggyBank: "0",
            selectedLedger: "",
            txStep: false,
        })
    }
}
