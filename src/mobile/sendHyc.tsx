import { createStyles } from "@material-ui/core"
import AppBar from "@material-ui/core/AppBar"
import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import ClickAwayListener from "@material-ui/core/ClickAwayListener"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import IconButton from "@material-ui/core/IconButton"
import Input from "@material-ui/core/Input"
import InputAdornment from "@material-ui/core/InputAdornment"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListSubheader from "@material-ui/core/ListSubheader"
import Paper from "@material-ui/core/Paper"
import TextField from "@material-ui/core/TextField"
import Toolbar from "@material-ui/core/Toolbar"
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
import ArrowBackIcon from "@material-ui/icons/ArrowBack"
import CameraEnhanceIcon from "@material-ui/icons/CameraEnhance"
import QRScannerIcon from "@material-ui/icons/CenterFocusWeak"
import CloseIcon from "@material-ui/icons/Close"
import AddressBookIcon from "@material-ui/icons/Contacts"
import TooltipIcon from "@material-ui/icons/Help"
import * as React from "react"
import { Link } from "react-router-dom"
import { IRest } from "../rest"
import { IText } from "./locales/m_locales"

// tslint:disable-next-line:no-var-requires
const Long = require("long")

const patternAddress = /^H[A-Za-z0-9+]{20,}$/
const patternHycon = /(^[0-9]*)([.]{0,1}[0-9]{0,9})$/
const scale = 9 * Math.log(10) / 100

// tslint:disable:object-literal-sort-keys
const styles = createStyles({
    root: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        padding: 0,
    },
    container: {
        display: "flex",
        justifyContent: "center",
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
})

interface IProps {
    rest: IRest
    language: IText
    wallet: any
}

export class SendHyc extends React.Component<IProps, any> {

    public static getDerivedStateFromProps(nextProps: IProps, previousState: any): any & IProps {
        return Object.assign(nextProps, {})
    }
    public mounted: boolean = false
    private MIN_HYC = 0.000000001

    constructor(props: IProps) {
        super(props)
        const storage = window.localStorage
        let add = ""
        let am = 0
        if (storage.getItem("hpay") !== "" && storage.getItem("hpay") != null) {
            const hpay = storage.getItem("hpay")
            add = hpay.split("+")[0]
            am = parseInt(hpay.split("+")[1])
        }

        this.state = {
            sendingStatus: false,
            dialogAddContact: false,
            dialogContacts: false,
            dialogStatus: false,
            alertDialogShown: false,
            rangeValue: 0,
            totalHYC: this.props.wallet.hycBalance,
            pendingHYC: this.props.wallet.pendingAmount,
            amountSending: am,
            amountFee: "",
            address: "",
            fromAddress: this.props.wallet.address,
            toAddress: add,
            password: "",
            contactsList: [],
            contactName: "",
            contactAddress: "",
            qrScannerReady: false,
            isScanning: false,
            isScannedForContact: false,
            tooltipOpen: false,
            error: this.props.language["send-hyc-fail"],
        }

        window.QRScanner.prepare((err, status) => {
            if (err) { console.error(err); return }
            if (status.authorized) {
                window.QRScanner.cancelScan()
                window.QRScanner.destroy()
                this.setState({ qrScannerReady: true })
            }
        })
    }

    public componentDidMount() {
        this.mounted = true
        this.getContacts()
    }

    public shouldComponentUpdate(nextProps: IProps, nextState: any): boolean {
        return true
    }

    public render() {
        return (
            <Grid container justify="space-between" style={styles.root}>
                <Grid item xs={12}>
                    <Grid item xs={12}>
                        <AppBar style={{ background: "transparent", boxShadow: "none", zIndex: 0 }} position="static">
                            <Toolbar style={styles.header}>
                                <Link to={"/wallet/" + this.props.wallet.name}>
                                    <IconButton><ArrowBackIcon /></IconButton>
                                </Link>
                                <Typography variant="button" align="center">
                                    {this.props.language["send-hyc-title"]}
                                </Typography>
                                <IconButton aria-label="Qr" disabled={!this.state.qrScannerReady} onClick={this.openQrScanner.bind(this)}><QRScannerIcon /></IconButton>
                            </Toolbar>
                        </AppBar>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="search-address"
                            value={this.state.toAddress}
                            onChange={this.handleChange("toAddress")}
                            placeholder={this.props.language["ph-wallet-address"]}
                            margin="normal"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton aria-label="Open Contact List" onClick={this.openContacts.bind(this)}>
                                            <AddressBookIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid container direction="row" alignItems="center" alignContent="flex-end">
                        <Grid item xs>
                        </Grid>
                        <Grid item xs>
                            <Typography align="right" style={{ padding: "0 auto" }}>
                                {this.props.language["send-hyc-how-it-works"]}
                            </Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <ClickAwayListener onClickAway={this.handleTooltipClose}>
                                <Tooltip
                                    disableTouchListener
                                    interactive
                                    open={this.state.tooltipOpen}
                                    onClose={this.handleTooltipClose}
                                    placement="bottom-end"
                                    title={this.props.language["send-hyc-answer-how-it-works"]}
                                    style={{ fontSize: 12 }}
                                    >
                                    <IconButton>
                                        <TooltipIcon onClick={this.handleTooltipOpen}/>
                                    </IconButton>
                                </Tooltip>
                            </ClickAwayListener>
                        </Grid>
                    </Grid >
                    <Card elevation={0}>
                        <CardContent>
                            <Grid container spacing={16}>
                                <Grid item xs={12}>
                                    <Card elevation={1}>
                                        <CardContent>
                                            <Typography variant="h6" align="left" gutterBottom>
                                                {this.props.language["detail-your-balance"]}
                                            </Typography>
                                            <Typography variant="h4" align="left">
                                                {this.state.totalHYC} HYC
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        value={this.state.amountSending}
                                        type="number"
                                        label={this.props.language["ph-amount"]}
                                        placeholder="0"
                                        variant="outlined"
                                        onChange={this.handleChange("amountSending")}
                                        style={{ width: "100%" }}
                                        inputProps={{ style: { maxWidth: "100%", textAlign: "right" } }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Button size="small" onClick={this.handleMaxClick.bind(this)}>
                                                        {this.props.language["btn-max"]}
                                                    </Button>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    HYC
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        value={this.state.amountFee}
                                        type="number"
                                        label={this.props.language["ph-fee"]}
                                        placeholder="0"
                                        variant="outlined"
                                        onChange={this.handleChange("amountFee")}
                                        style={{ width: "100%" }}
                                        inputProps={{ style: { maxWidth: "100%", textAlign: "right" } }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    HYC
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} style={{ padding: 0 }}>
                    <Grid item xs={12} style={{ paddingBottom: 2 }}>
                        <TextField fullWidth
                            id="password"
                            value={this.state.password}
                            onChange={this.handleChange("password")}
                            placeholder={this.props.language["ph-wallet-password"]}
                            inputProps={{ style: { textAlign: "center" } }}
                            type="password"
                        />
                    </Grid>
                    <Button
                        onClick={this.handleSubmit.bind(this)}
                        variant="text"
                        fullWidth
                        size="large"
                        style={{ backgroundColor: "#2195a0", color: "#fff" }}
                    >
                        {this.props.language["btn-send"]}
                    </Button>
                </Grid>
                {this.state.isScanning ?
                    <AppBar id="qrCloseButton" style={{ background: "transparent", boxShadow: "none", top: 12 }} position="absolute">
                        <Toolbar style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                variant="fab"
                                aria-label="Close Scanner"
                                onClick={this.closeScan.bind(this)}
                                style={{ backgroundColor: "#424242", color: "#fff" }}>
                                <CloseIcon />
                            </Button>
                        </Toolbar>
                    </AppBar> :
                    ""
                }

                <Dialog aria-labelledby="simple_dialog_title" open={this.state.dialogStatus}>
                    <DialogTitle>{this.props.language["send-hyc-tx-status"]}</DialogTitle>
                    <div>
                        {
                            this.state.sendingStatus === true ?
                                <Paper style={{ padding: 10 }}>
                                    <Typography gutterBottom align="center">
                                        {this.props.language["send-hyc-success"]}
                                    </Typography>
                                    <Link to={"/wallet/" + this.props.wallet.name}>
                                        <Button
                                            style={{ backgroundColor: "#172349", color: "#fff", width: "100%", padding: "16px 24px" }}>
                                            {this.props.language["btn-finish"]}
                                        </Button>
                                    </Link>
                                </Paper>
                                :
                                <Paper style={{ padding: 10 }}>
                                    <Typography gutterBottom align="center">
                                        {this.state.error}
                                    </Typography>
                                    <Button
                                        onClick={this.closeDialog.bind(this)}
                                        style={{ backgroundColor: "#172349", color: "#fff", width: "100%", padding: "16px 24px" }}>
                                        {this.props.language["btn-close"]}
                                    </Button>
                                </Paper>
                        }
                    </div>
                </Dialog>

                <Dialog
                    scroll="paper"
                    aria-labelledby="contact-list"
                    open={this.state.dialogContacts}
                    onClose={this.closeContacts.bind(this)}
                >
                    <div style={{ margin: "0 7px 0 7px", textAlign: "center" }}>
                        <List
                            subheader={
                                <ListSubheader style={{ backgroundColor: "white", fontSize: 10 }}>
                                    {this.state.contactsList.length === 0
                                        ? this.props.language["send-hyc-add-contact"]
                                        : this.props.language["send-hyc-select-address"]}
                                </ListSubheader>
                            }
                        >
                            {this.state.contactsList.map((value: any) => (
                                <div>
                                    <ListItem button key={value.address} onClick={this.setContactandClose(value.address)}>
                                        <ListItemText
                                            primary={value.alias}
                                            secondaryTypographyProps={{ style: { fontSize: 11 } }}
                                            secondary={value.address} />
                                    </ListItem>
                                    <Divider />
                                </div>
                            ))
                            }
                            <Button
                                onClick={this.openAddContact.bind(this)}
                                style={{ backgroundColor: "#172349", color: "#fff", width: "100%" }}>
                                {this.props.language["btn-add"]}
                            </Button>
                        </List>
                    </div>
                </Dialog>

                <Dialog
                    aria-labelledby="contact-add"
                    open={this.state.dialogAddContact}
                    onClose={this.closeAddContact.bind(this)}
                >
                    <div style={{ margin: "7px", textAlign: "center" }}>
                        <Typography style={{ fontSize: 10, margin: "5px" }}>
                            {this.props.language["send-hyc-add-contact-hint"]}
                        </Typography>
                        <Input
                            fullWidth
                            id="contact-name"
                            placeholder={this.props.language["ph-contact-name"]}
                            value={this.state.contactName}
                            onChange={this.handleChange("contactName")}
                        />
                        <Input
                            fullWidth
                            id="contact-address"
                            placeholder={this.props.language["ph-wallet-address"]}
                            value={this.state.contactAddress}
                            onChange={this.handleChange("contactAddress")}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton aria-label="Qr" disabled={!this.state.qrScannerReady} onClick={() => this.openQrScannerContact()}><CameraEnhanceIcon style={{ fontSize: 18 }} /></IconButton>
                                </InputAdornment>
                            }
                        />
                        <Button
                            onClick={this.addContact.bind(this)}
                            style={{ backgroundColor: "#172349", color: "#fff", width: "100%", marginTop: "20px" }}>
                            {this.props.language["btn-add"]}
                        </Button>
                    </div>
                </Dialog >

                {/* MODAL - HINT : This is be implemented later */}
                {/* <Modal aria-labelledby="password-hint" open={this.state.alertDialogShown} onClose={this.hideAlertDialog.bind(this)}>
                    <div style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", position: "absolute" }}>
                        <Paper style={{ padding: 10 }}>
                            <Typography>
                                Lorem Ipsum Dolor
                            </Typography>
                        </Paper>
                    </div>
                </Modal> */}
            </Grid >
        )
    }

    private handleTooltipClose = () => {
        this.setState({ tooltipOpen: false })
    }

    private handleTooltipOpen = () => {
        this.setState({ tooltipOpen: true })
    }

    private getContacts() {
        this.state.rest.getFavoriteList().then((data: any) => {
            this.setState({ contactsList: data })
        })
    }

    private closeDialog() {
        this.setState({ dialogStatus: false })
    }

    private hideAlertDialog() {
        this.setState({ alertDialogShown: false })
    }

    private openContacts() {
        this.setState({ dialogContacts: true })
    }

    private setContactandClose = (prop: any) => (event: any) => {
        this.setState({ toAddress: prop })
        this.closeContacts()
    }

    private closeContacts() {
        this.setState({ dialogContacts: false })
    }

    private openAddContact() {
        this.setState({ dialogAddContact: true })
    }

    private closeAddContact() {
        this.setState({ contactAddress: "", contactName: "", dialogAddContact: false, dialogContacts: true })
    }

    private addContact() {
        if (!this.state.contactName) {
            alert(this.props.language["alert-enter-name"]); return
        } else if (!this.state.contactAddress) {
            alert(this.props.language["alert-enter-address"]); return
        } else if (this.state.contactAddress && !patternAddress.test(this.state.contactAddress)) {
            alert(this.props.language["alert-invalid-address"]); return
        } else if (this.checkDuplicateContact({ alias: this.state.contactName, address: this.state.contactAddress })) {
            alert(this.props.language["alert-contact-address-duplicate"]); return
        }

        this.state.rest.addFavorite(this.state.contactName, this.state.contactAddress).then(() => {
            this.state.rest.getFavoriteList().then((data: any) => {
                this.setState({ contactAddress: "", contactName: "", contactsList: data, dialogAddContact: false, dialogContacts: true })
            })
        })
    }

    private checkDuplicateContact(contactToInspect: { alias: string, address: string }): boolean {
        let duplicated = false
        this.state.contactsList.forEach((contact: { alias: string, address: string }) => {
            if (contact.alias === contactToInspect.alias || contact.address === contactToInspect.address) {
                duplicated = true
            }
        })
        return duplicated
    }

    private handleSubmit() {

        const sending = Number(this.state.amountSending) + Number(this.state.amountFee)
        const left = Number(this.state.totalMoney) - Number(sending)

        if (this.state.amountSending <= 0) {
            alert(this.props.language["alert-invalid-amount"])
            return
        }
        if (this.state.amountSending.match(patternHycon) == null) {
            alert(this.props.language["alert-9decimal-amount"])
            return
        }
        if (this.state.amountFee.match(patternHycon) == null) {
            alert(this.props.language["alert-9decimal-fee"])
            return
        }
        if (this.hyconfromString(this.state.totalHYC).lessThan(this.hyconfromString(this.state.amountSending).add(this.hyconfromString(this.state.amountFee)))) {
            alert(this.props.language["alert-insufficient-balance"])
            return
        }
        if (this.hyconfromString(this.state.amountFee).equals(0)) {
            alert(this.props.language["alert-invalid-fee"])
            return
        }
        if (this.state.fromAddress === this.state.toAddress) {
            alert(this.props.language["alert-cannot-send-yourself"])
            return
        }
        if (!this.state.toAddress) {
            alert(this.props.language["alert-enter-to"])
            return
        }

        if (this.state.toAddress && !patternAddress.test(this.state.toAddress)) {
            alert(this.props.language["alert-invalid-address"])
            return
        }
        this.props.rest.sendTx({ name: this.props.wallet.name, password: this.state.password, address: this.state.toAddress, amount: this.state.amountSending, minerFee: this.state.amountFee, nonce: undefined })
            .then((data) => {
                if (data.res === true) {
                    this.setState({ sendingStatus: data.res, dialogStatus: true })
                } else {
                    if (data.case === 1) {
                        this.setState({ sendingStatus: data.res, dialogStatus: true, error: this.props.language["alert-invalid-password"] })
                    } else if (data.case === 2) {
                        this.setState({ sendingStatus: data.res, dialogStatus: true, error: this.props.language["alert-invalid-address"] })
                    } else if (data.case === 3) {
                        this.setState({ sendingStatus: data.res, dialogStatus: true, error: this.props.language["send-hyc-fail"] })
                    }
                }
            }).catch((err: Error) => {
                console.error(err)
                this.setState({ sendingStatus: false, dialogStatus: true, error: err })
            })

    }

    private handleMaxClick(e: any) {
        if (this.state.totalHYC <= this.MIN_HYC) {
            alert(this.props.language["alert-insufficient-balance"])
        } else {
            const max = Number(this.state.totalHYC) - this.MIN_HYC
            const minerFee = this.MIN_HYC
            const displayFee = Math.round(Math.log(10e8 * minerFee) / scale)
            this.setState({ amountSending: max.toFixed(9), amountFee: minerFee.toFixed(9) })
        }

    }

    private handleChange = (prop: any) => (event: any) => {
       this.setState({ [prop]: event.target.value })
        
    }

    private hyconfromString(val: string): Long {
        if (val === "" || val === undefined || val === null) { return Long.fromNumber(0, true) }
        if (val[val.length - 1] === ".") { val += "0" }
        const arr = val.toString().split(".")
        let hycon = Long.fromString(arr[0], true).multiply(Math.pow(10, 9))
        if (arr.length > 1) {
            arr[1] = arr[1].length > 9 ? arr[1].slice(0, 9) : arr[1]
            const subCon = Long.fromString(arr[1], true).multiply(Math.pow(10, 9 - arr[1].length))
            hycon = hycon.add(subCon)
        }
        return hycon.toUnsigned()
    }

    private openQrScanner() {
        this.setState({ isScanning: true, isScannedForContact: false })
        document.getElementById("blockexplorer").style.visibility = "hidden"
        window.QRScanner.scan((err, text) => {
            if (err) {
                console.error(err)
            }

            document.getElementById("blockexplorer").style.visibility = "visible"

            if (text.charAt(0) === "H") {
                this.setState({ toAddress: text, isScanning: false, isScannedForContact: false })
            } else {
                const obj = JSON.parse(text)
                this.setState({ toAddress: obj.address, amountSending: obj.amount, isScanning: false, isScannedForContact: false })
            }
            window.QRScanner.destroy()
        })
        window.QRScanner.show(((status) => {
            document.getElementById("qrCloseButton").style.visibility = "visible"
        }))
    }

    private openQrScannerContact() {
        this.setState({ dialogAddContact: false, dialogContacts: false, isScanning: true, isScannedForContact: true })
        document.getElementById("blockexplorer").style.visibility = "hidden"
        window.QRScanner.scan((err, text) => {
            if (err) {
                console.error(err)
            }
            document.getElementById("blockexplorer").style.visibility = "visible"

            if (text.charAt(0) === "H") {
                this.setState({ contactAddress: text, isScannedForContact: true })
            } else {
                this.setState({ contactAddress: JSON.parse(text).address, isScannedForContact: true })
            }

            window.QRScanner.destroy()
            this.setState({ dialogAddContact: true, dialogContacts: true, isScanning: false, isScannedForContact: true })
        })
        window.QRScanner.show(((status) => {
            document.getElementById("qrCloseButton").style.visibility = "visible"
        }))
    }

    private closeScan() {
        window.QRScanner.destroy()
        if (this.state.isScannedForContact) {
            this.setState({ dialogAddContact: true, dialogContacts: true, isScanning: false })
        } else {
            this.setState({ isScanning: false })
        }
        document.getElementById("qrCloseButton").style.visibility = "hidden"
        document.getElementById("blockexplorer").style.visibility = "visible"
    }
}
