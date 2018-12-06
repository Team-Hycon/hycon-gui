import { Dialog, DialogTitle, FormControl, FormControlLabel, FormLabel, Input, InputLabel, ListItemText, Radio, RadioGroup, Select } from "@material-ui/core"
import Button from "@material-ui/core/Button"
import Grid from "@material-ui/core/Grid"
import Icon from "@material-ui/core/Icon"
import { Avatar, IconButton, List, ListItem, TextField } from "material-ui"
import * as React from "react"
import { Link, Redirect } from "react-router-dom"
import { IBlock, IHyconWallet, IRest } from "../rest"
import { AddressBook } from "./addressBook"
import { WalletList } from "./walletList"

export class WalletView extends React.Component<any, any> {
    public mounted: boolean = false
    private pattern1 = /^[a-zA-Z0-9\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]{2,20}$/
    constructor(props: any) {
        super(props)
        this.state = {
            address: "",
            alias: "",
            dialog1: false,
            dialog3: false,
            dialog4: false,
            favorites: [],
            ledgerAddress: "",
            load: false,
            possibilityLedger: false,
            privateKey: undefined,
            redirect: false,
            redirectTxView: false,
            redirectTxViewHardwareWallet: false,
            rest: props.rest,
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
    }

    public handleInputChange(event: any) {
        const name = event.target.name
        const value = event.target.value
        this.setState({ [name]: value })
    }

    public addWalletPrivateKey() {
        if (this.state.walletName === "") {
            alert(this.props.language["alert-empty-fields"])
        } else if (this.state.walletName.search(/\s/) !== -1 || !this.pattern1.test(this.state.walletName)) {
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
            this.setState({ redirectTxViewHardwareWallet: true })
        }
    }
    public render() {
        if (this.state.redirect) {
            return <Redirect to={`/wallet/detail/${this.state.walletName}`} />
        }
        if (this.state.redirectTxView) {
            return <Redirect to={`/maketransaction/false`} />
        }
        if (this.state.redirectTxViewHardwareWallet) {
            return <Redirect to={`/maketransaction/${this.state.walletType}`} />
        }
        if (!this.state.load) {
            return <div></div>
        }
        return (
            <div>
                <div className="walletViewBtnDiv">
                    <button onClick={() => { this.setState({ dialog1: true }) }} className="mdl-button"><i className="material-icons">bookmark</i> {this.props.language["address-book"]} </button>
                    <button className="mdl-button">
                        <Link to="/wallet/addWallet" className="coloredBlack"><i className="material-icons">note_add</i> {this.props.language["add-wallet"]} </Link>
                    </button>
                    <button className="mdl-button">
                        <Link to="/wallet/recoverWallet" className="coloredBlack"><i className="material-icons">input</i> {this.props.language["recover-wallet"]} </Link>
                    </button>
                    {(this.state.possibilityLedger ? (<button onClick={() => { this.setState({ dialog4: true }) }} className="mdl-button"><i className="material-icons">send</i> {this.props.language["button-transfer"]}</button>) : (<div></div>))}
                </div>
                <div>
                    <WalletList rest={this.state.rest} language={this.props.language} />
                    <Grid container direction={"row"}>
                        <List>
                            <ListItem style={{ width: "23em" }}
                                leftAvatar={<Avatar icon={<i className="material-icons walletIcon_white">
                                    note_add</i>} />}
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

                {/* ADD PRIVATE KEY */}
                <Dialog open={this.state.dialog3} onClose={() => { this.setState({ dialog3: false }) }}>
                    <DialogTitle id="simple-dialog-title" style={{ textAlign: "center" }}><Icon style={{ marginRight: "10px", color: "grey" }}>account_balance_wallet</Icon>Add Wallet</DialogTitle>
                    <div style={{ textAlign: "center" }}>
                        <p>Input your wallet address name</p>
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
                            <FormControlLabel value="bitbox" control={<Radio />} label="Digital Bitbox" />
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
}
