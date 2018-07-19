import { Button, Dialog, DialogTitle, FormControlLabel, FormLabel, Grid, Icon, Radio, RadioGroup } from "@material-ui/core"
import { Avatar, List, ListItem, TextField } from "material-ui"
import * as tfa from "node-2fa"
import * as React from "react"
import { Link, Redirect } from "react-router-dom"
import { AddressBook } from "./addressBook"
import { IBlock, IHyconWallet, IRest } from "./rest"
import { WalletList } from "./walletList"

export class WalletView extends React.Component<any, any> {
    public mounted: boolean = false

    constructor(props: any) {
        super(props)
        this.state = {
            address: "",
            alias: "",
            dialog1: false,
            dialog2: false,
            dialog3: false,
            dialog4: false,
            errorText: "",
            errorText2: "",
            favorites: [],
            ledgerAddress: "",
            load: false,
            possibilityLedger: false,
            privateKey: undefined,
            redirect: false,
            redirectTxView: false,
            redirectTxViewWithLedger: false,
            rest: props.rest,
            totp: false,
            totpPw1: "",
            totpPw2: "",
            totpQr: "",
            totpSecret: "",
            totpToken: "",
            walletName: "",
            walletPass: "",
            walletType: "local",
        }
        this.nextMakeTx = this.nextMakeTx.bind(this)
    }
    public componentDidMount() {
        this.mounted = true
        this.state.rest.possibilityLedger().then((result: boolean) => {
            this.setState({ possibilityLedger: result })
            this.getFavorite()
        })
        this.state.rest.getTOTP().then((result: boolean) => {
            if (result) {
                this.setState({ totp: true })
            } else {
                this.setState({ totp: false })
            }
        })
    }

    public handleInputChange(event: any) {
        const name = event.target.name
        const value = event.target.value
        if (name === "alias") {
            this.setState({ alias: value })
        } else if (name === "addr") {
            this.setState({ address: value })
        } else if (name === "walletName") {
            this.setState({ walletName: value })
        } else if (name === "walletPass") {
            this.setState({ walletPass: value })
        } else if (name === "walletType") {
            this.setState({ walletType: value })
        }
    }

    public addWalletPrivateKey() {
        const patternWalletName = /^[a-zA-Z0-9\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]{2,20}$/

        if (this.state.walletName === "") {
            alert(this.props.language["alert-empty-fields"])
        } else if (this.state.walletName.search(/\s/) !== -1 || !patternWalletName.test(this.state.walletName)) {
            alert(this.props.language["alert-invalid-wallet"])
        } else {
            this.state.rest.addWalletFile(this.state.walletName, this.state.walletPass, this.state.privateKey).then((result: boolean) => {
                if (result) {
                    this.setState({ dialog3: false, redirect: true })
                } else {
                    alert(`${this.props.language["alert-load-address-failed"]}`)
                }
            })
        }
    }

    public nextMakeTx() {
        if (this.state.walletType === "local") {
            this.setState({ redirectTxView: true })
        } else {
            this.setState({ redirectTxViewWithLedger: true })
        }
    }
    public render() {
        if (this.state.redirect) {
            return <Redirect to={`/wallet/detail/${this.state.walletName}`} />
        }
        if (this.state.redirectTxView) {
            return <Redirect to={`/maketransaction/false`} />
        }
        if (this.state.redirectTxViewWithLedger) {
            return <Redirect to={`/maketransaction/true`} />
        }
        if (!this.state.load) {
            return <div></div>
        }
        return (
            <div>
                <div className="walletViewBtnDiv">
                    <button onClick={() => { this.setState({ dialog1: true }) }} className="mdl-button"><i className="material-icons">bookmark</i> {this.props.language["address-book"]}</button>
                    <button className="mdl-button">
                        <Link to="/wallet/addWallet" className="coloredBlack"><i className="material-icons">note_add</i> {this.props.language["add-wallet"]} </Link>
                    </button>
                    <button className="mdl-button">
                        <Link to="/wallet/recoverWallet" className="coloredBlack"><i className="material-icons">input</i> {this.props.language["recover-wallet"]} </Link>
                    </button>
                    <button onClick={() => { this.generateTOTP() }} className="mdl-button"><i className="material-icons">vpn_key</i> {this.props.language.totp}</button>
                    {(this.state.possibilityLedger ? (<button onClick={() => { this.setState({ dialog4: true }) }} className="mdl-button"><i className="material-icons">send</i> {this.props.language["button-transfer"]}</button>) : (<div></div>))}
                </div>
                <div>
                    <WalletList rest={this.state.rest} language={this.props.language} />
                    <Grid container direction={"row"}>
                        <List>
                            <ListItem style={{ width: "23em" }}
                                leftAvatar={<Avatar icon={<i className="material-icons walletIcon_white">note_add</i>} />}
                                primaryText={this.props.language["load-key-from-file"]}
                                secondaryText={<input type="file" style={{ height: "20px" }} onChange={(e) => this.onDrop(e.target.files)} />}
                            />
                        </List>
                    </Grid>
                </div>

                {/* ADDRESS BOOK */}
                <Dialog open={this.state.dialog1} onClose={() => { this.closeAddressBook() }}>
                    <AddressBook rest={this.state.rest} favorites={this.state.favorites} isWalletView={true} language={this.props.language} />
                </Dialog>

                {/* ENABLE TRANSACTION OTP */}
                <Dialog style={{ textAlign: "center" }} open={!this.state.totp && this.state.dialog2} onClose={() => { this.setState({ dialog2: false }) }}>
                    <DialogTitle id="simple-dialog-title">{this.props.language["enable-totp"]}</DialogTitle>
                    <div style={{ margin: "2em" }}>
                        <p>{this.props.language["enable-totp-tip1"]}<p></p><strong>{this.props.language["enable-totp-tip2"]}</strong></p>
                        <img src={this.state.totpQr} height="200" width="200" color="#084b8a" /><br /><br />
                        <p>{this.props.language["enable-totp-tip3"]}</p>
                        <span style={{ backgroundColor: "#f2d260"}}>{this.state.totpSecret}</span><br /><br />
                        <TextField floatingLabelText={this.props.language["totp-google-code"]} autoComplete="off"
                            errorText={this.state.errorText} errorStyle={{ float: "left" }}
                            value={this.state.totpToken}
                            onChange={(data) => { this.handleTOTP(data) }} /><br /><br />
                        <span style={{ display: "inline-flex" }}>
                            <TextField style={{ marginRight: "3%" }} floatingLabelText={this.props.language["totp-otp-password"]} floatingLabelFixed={true} type="password" autoComplete="off"
                                value={this.state.totpPw1}
                                onChange={(data) => { this.handleTOTPpassword(data) }} />
                            <TextField floatingLabelText={this.props.language["totp-confirm-otp-password"]} floatingLabelFixed={true} type="password" autoComplete="off"
                                errorText={this.state.errorText2} errorStyle={{ float: "left" }}
                                value={this.state.totpPw2}
                                onChange={(data) => { this.handleConfirmTOTPpassword(data) }} />
                        </span><br /><br />
                        <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                            <Button variant="raised" onClick={() => { this.setState({ dialog2: false }) }} style={{ backgroundColor: "rgb(225, 0, 80)", color: "white" }}>{this.props.language["button-cancel"]}</Button>
                            <Button variant="raised" onClick={() => { this.enableTOTP() }} style={{ backgroundColor: "#50aaff", color: "white", margin: "0 10px" }}>{this.props.language["button-submit"]}</Button>
                        </Grid>
                    </div>
                </Dialog>

                {/* DISABLE TRANSACTION OTP */}
                <Dialog style={{ textAlign: "center" }} open={this.state.totp && this.state.dialog2} onClose={() => { this.setState({ dialog2: false }) }}>
                    <DialogTitle id="simple-dialog-title" >{this.props.language["disable-totp"]}</DialogTitle>
                    <div style={{ margin: "2em" }}>
                        <p>{this.props.language["disable-totp-tip1"]}</p>
                        <p style={{fontSize: "0.8em", color: "#bc3309"}}>{this.props.language["disable-totp-tip2"]}<br />{this.props.language["disable-totp-tip3"]}</p>
                        <TextField floatingLabelText={this.props.language["totp-otp-password"]} type="password" autoComplete="off"
                            value={this.state.totpPw1}
                            onChange={(data) => { this.handleTOTPpassword(data) }} /><br /><br />
                        <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                            <Button variant="raised" onClick={() => { this.setState({ dialog2: false }) }} style={{ backgroundColor: "rgb(225, 0, 80)", color: "white" }}>{this.props.language["button-cancel"]}</Button>
                            <Button variant="raised" onClick={() => { this.disableTOTP() }} style={{ backgroundColor: "#50aaff", color: "white", margin: "0 10px" }}>{this.props.language["button-submit"]}</Button>
                        </Grid>
                    </div>
                </Dialog>

                {/* ADD PRIVATE KEY */}
                <Dialog open={this.state.dialog3} onClose={() => { this.setState({ dialog3: false }) }}>
                    <DialogTitle id="simple-dialog-title" style={{ textAlign: "center" }}><Icon style={{ marginRight: "10px", color: "grey" }}>account_balance_wallet</Icon>{this.props.language["title-add-wallet"]}</DialogTitle>
                    <div style={{ textAlign: "center" }}>
                        <p>{this.props.language["subtitle-add-wallet"]}</p>
                        <TextField style={{ marginRight: "3%" }} name="walletName" floatingLabelText="Name" floatingLabelFixed={true}
                            value={this.state.walletName}
                            onChange={(data) => { this.handleInputChange(data) }} />
                        <TextField name="walletPass" floatingLabelText="Password" floatingLabelFixed={true} type="password" autoComplete="off"
                            value={this.state.walletPass}
                            onChange={(data) => { this.handleInputChange(data) }} />
                    </div><br />
                    <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                        <Button variant="raised" onClick={() => { this.setState({ dialog3: false }) }} style={{ backgroundColor: "rgb(225, 0, 80)", color: "white" }}>Cancel</Button>
                        <Button variant="raised" onClick={() => { this.addWalletPrivateKey() }} style={{ backgroundColor: "#50aaff", color: "white", margin: "0 10px" }}>Save</Button>
                    </Grid><br />
                </Dialog>

                {/* Transfer type select view */}
                <Dialog open={this.state.dialog4} style={{ textAlign: "center" }} onClose={() => { this.setState({ dialog4: false }) }}>
                    <h4 style={{ color: "grey" }}><Icon style={{ color: "grey", marginRight: "10px" }}>send</Icon>{this.props.language["send-transaction"]}</h4>
                    <div style={{ width: "32em" }}>
                        <FormLabel component="legend">>{this.props.language["wallet-type-select"]}</FormLabel>
                        <RadioGroup style={{ width: "70%", margin: "auto" }} aria-label="walletType" name="walletType" value={this.state.walletType} onChange={(data) => { this.handleInputChange(data) }}>
                            <FormControlLabel value="local" control={<Radio />} label={this.props.language["local-wallet"]} />
                            <FormControlLabel value="ledger" control={<Radio />} label={this.props.language["Hardware-wallet"]} />
                        </RadioGroup>
                    </div>
                    <Button onClick={this.nextMakeTx}>{this.props.language["button-next"]}</Button>
                </Dialog>
            </div >
        )
    }

    private onDrop(files: any) {
        const reader = new FileReader()
        reader.onload = () => {
            this.setState({ dialog3: true, privateKey: reader.result })
        }
        reader.readAsText(files[0])
    }

    private closeAddressBook() {
        this.getFavorite()
        this.setState({ dialog1: false })
    }

    private getFavorite() {
        this.state.rest.setLoading(true)
        this.state.rest.getFavoriteList().then((data: Array<{ alias: string, address: string }>) => {
            this.state.rest.setLoading(false)
            if (this.mounted) {
                this.setState({ favorites: data, load: true })
            }
        })
    }
    private handleTOTP(data: any) {
        const patternSixDigits = /^[0-9]{6}$/
        this.setState({ totpToken: data.target.value })
        if (!patternSixDigits.test(data.target.value)) {
            this.setState({ errorText: this.props.language["alert-six-digit"] })
        } else {
            this.setState({ errorText: "" })
        }
    }
    private handleTOTPpassword(data: any) {
        if (this.state.totpPw2 !== "") {
            if (data.target.value === this.state.totpPw2) {
                this.setState({ errorText2: "" })
            } else { this.setState({ errorText2: this.props.language["password-not-matched"] }) }
        }
        this.setState({ totpPw1: data.target.value })
    }
    private handleConfirmTOTPpassword(data: any) {
        if (this.state.totpPw1 !== "") {
            if (data.target.value === this.state.totpPw1) {
                this.setState({ errorText2: "" })
            } else { this.setState({ errorText2: this.props.language["password-not-matched"] }) }
        }
        this.setState({ totpPw2: data.target.value })
    }
    private async enableTOTP() {
        const res = await this.state.rest.verifyTOTP(this.state.totpToken, this.state.totpPw1, this.state.totpSecret)
        if (!res) {
            alert(this.props.language["alert-invalid-google-code"])
        } else if (this.state.totpPw1 !== this.state.totpPw2) {
            alert(this.props.language["password-not-matched"])
        } else {
            const result = await this.state.rest.saveTOTP(this.state.totpSecret, this.state.totpPw1)
            if (!result) {
                alert(this.props.language["alert-enable-totp-fail"])
            } else {
                this.setState({ totp: true, dialog2: false })
                alert(this.props.language["alert-enable-totp-success"])
                location.reload()
            }
        }
    }
    private disableTOTP() {
        this.state.rest.deleteTOTP(this.state.totpPw1).then((result: { res: boolean, case?: number }) => {
            if (!result.res) {
                if (result.case === 1) {
                    alert(this.props.language["password-not-matched"])
                } else if (result.case === 2) {
                    alert(this.props.language["alert-disable-totp-delete-fail"])
                } else if (result.case === 3) {
                    alert(this.props.language["alert-disable-totp-fail"])
                }
                this.setState({ totpPw1: "" })
            } else {
                this.setState({ totp: false, dialog2: false })
                alert(this.props.language["alert-delete-success"])
                location.reload()
            }
        })
    }
    private generateTOTP() {
        this.setState({ dialog2: true })
        const s = tfa.generateSecret({name: "HYCON-LiteWallet", account: "TransactionOTP"})
        this.setState({ totpSecret: s.secret, totpQr: s.qr })
    }
}
