import { createStyles } from "@material-ui/core"
import AppBar from "@material-ui/core/AppBar"
import Button from "@material-ui/core/Button"
import Checkbox from "@material-ui/core/Checkbox"
import Dialog from "@material-ui/core/Dialog"
import Divider from "@material-ui/core/Divider"
import Fade from "@material-ui/core/Fade"
import Grid from "@material-ui/core/Grid"
import IconButton from "@material-ui/core/IconButton"
import Input from "@material-ui/core/Input"
import InputAdornment from "@material-ui/core/InputAdornment"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import ListSubheader from "@material-ui/core/ListSubheader"
import Snackbar from "@material-ui/core/Snackbar"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
import AddIcon from "@material-ui/icons/Add"
import ArrowBackIcon from "@material-ui/icons/ArrowBack"
import CameraEnhanceIcon from "@material-ui/icons/CameraEnhance"
import CloseIcon from "@material-ui/icons/Close"
import DeleteIcon from "@material-ui/icons/Delete"
import CopyIcon from "@material-ui/icons/FileCopy"
import * as React from "react"
import * as CopyToClipboard from "react-copy-to-clipboard"
import { Link } from "react-router-dom"
import { IHyconWallet, IRest } from "../rest"
import { IText } from "./locales/m_locales"

const patternAddress = /^H[A-Za-z0-9+]{20,}$/

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
})

interface IProps {
    rest: IRest
    language: IText
}

interface IState {
    wallets: IHyconWallet[]
}

export class Contacts extends React.Component<IProps, any> {
    public buttonPressTimer: any

    constructor(props: IProps) {
        super(props)
        this.state = {
            rest: this.props.rest,
            language: this.props.language,
            contactAddress: "",
            contacts: [],
            delay: 500,
            dialogAddContact: false,
            result: "No result",
            checked: [1],
            isRemoving: false,
            isScanning: false,
            qrScannerReady: false,
            wallets: [],
        }
        window.QRScanner.prepare((err, status) => {
            if (err) { console.error(err); return }
            if (status.authorized) {
                window.QRScanner.cancelScan()
                window.QRScanner.destroy()
                this.setState({ qrScannerReady: true })
            }
        })
        this.getContacts()
    }

    public shouldComponentUpdate(nextProps: IProps, nextState: IState): boolean {
        return true
    }

    public renderListContacts() {
        return (
            <List
                subheader={
                    <ListSubheader disableSticky component="div" style={styles.header}>
                        <span style={{ margin: "auto 0 auto 20px" }}>{this.props.language["contacts-list"]} ({this.state.contacts !== null ? this.state.contacts.length : 0})</span>
                        <div>
                            <span><IconButton aria-label="Add" onClick={this.openAddContact.bind(this)}><AddIcon style={{ fontSize: 18 }} /></IconButton></span>
                        </div>
                    </ListSubheader>
                }>
                {this.state.contacts.map((value: any) => (
                    <Grid item xs={12}>
                        <ListItem
                            button
                            key={value.address}
                            onTouchStart={this.handleButtonPress.bind(this)}
                            onTouchEnd={this.handleButtonRelease.bind(this)}
                            onMouseDown={this.handleButtonPress.bind(this)}
                            onMouseUp={this.handleButtonRelease.bind(this)}
                        >
                            <ListItemText primary={value.alias} secondary={value.address} />
                            {!this.state.isRemoving
                                ? <CopyToClipboard text={value.address}>
                                    <IconButton onClick={this.handleClick}><CopyIcon style={{ fontSize: 18 }} /></IconButton>
                                </CopyToClipboard>
                                : <ListItemSecondaryAction>
                                    <Checkbox onChange={this.handleToggle(value)} checked={this.state.checked.indexOf(value) !== -1} />
                                </ListItemSecondaryAction>}
                        </ListItem>
                        <Divider />
                    </Grid>))
                }

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
                                    <IconButton aria-label="Qr" disabled={!this.state.qrScannerReady} onClick={() => this.openQrScanner()}><CameraEnhanceIcon style={{ fontSize: 18 }} /></IconButton>
                                </InputAdornment>
                            }
                        />
                        <Button
                            onClick={this.addContact.bind(this)}
                            style={{ backgroundColor: "#172349", color: "#fff", width: "100%", marginTop: "20px" }}>
                            {this.props.language["btn-add"]}
                        </Button>
                    </div>
                </Dialog>
            </List>
        )
    }

    public render() {
        return (
            <div style={styles.root}>
                <AppBar style={{ background: "transparent", boxShadow: "none", zIndex: 0 }} position="static">
                    <Toolbar style={styles.header}>
                        <Link to="/">
                            <IconButton><ArrowBackIcon /></IconButton>
                        </Link>
                        <Typography variant="button" align="center">
                            {this.props.language["contacts-title"]}
                        </Typography>
                        {this.state.isRemoving
                            ? <IconButton onClick={this.deleteContacts.bind(this)}>{this.state.checked.length === 1 ? <CloseIcon /> : <DeleteIcon />}</IconButton>
                            : <div style={{ width: 48, height: 48 }} />
                        }
                    </Toolbar>
                </AppBar>
                <Divider />
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
                    this.renderListContacts()
                }

                <Snackbar
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    open={this.state.copied}
                    onClose={this.handleClose}
                    TransitionComponent={Fade}
                    ContentProps={{ "aria-describedby": "message-id" }}
                    message={<span id="message-id">{this.props.language["help-copied"]}!</span>}
                />
            </div>
        )
    }

    public handleClick = () => {
        this.setState({ copied: true })
    }

    public handleClose = () => {
        this.setState({ copied: false })
    }
    private getContacts() {
        this.state.rest.getFavoriteList().then((data: any) => {
            this.setState({ contacts: data })
        })
    }
    private handleButtonPress() {
        this.buttonPressTimer = setTimeout(() => {
            this.setState({ isRemoving: true })
            navigator.vibrate(500)
        }, 1200)
    }

    private handleButtonRelease() {
        clearTimeout(this.buttonPressTimer)
    }

    private deleteContacts() {
        if (this.state.checked.length > 1) {
            this.state.rest.deleteFavoriteTab(this.state.checked).then((res: any) => {
                this.state.rest.getFavoriteList().then((data: any) => {
                    this.setState({ contacts: data, isRemoving: false, checked: [1] })
                })
            })
        }
        this.setState({ isRemoving: false })
    }

    private handleChange = (prop: any) => (event: any) => {
        this.setState({ [prop]: event.target.value })
    }

    private handleToggle = (value: any) => () => {
        const { checked } = this.state
        const currentIndex = checked.indexOf(value)
        const newChecked = [...checked]

        if (currentIndex === -1) {
            newChecked.push(value)
        } else {
            newChecked.splice(currentIndex, 1)
        }

        this.setState({
            checked: newChecked,
        })

    }

    private openAddContact() {
        this.setState({ dialogAddContact: true })
    }

    private closeAddContact() {
        this.setState({ contactAddress: "", contactName: "", dialogAddContact: false })
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
                this.setState({ contactAddress: "", contactName: "", contacts: data, dialogAddContact: false, dialogContacts: true })
            })
        })
    }

    private checkDuplicateContact(contactToInspect: { alias: string, address: string }): boolean {
        let duplicated = false
        this.state.contacts.forEach((contact: { alias: string, address: string }) => {
            if (contact.alias === contactToInspect.alias || contact.address === contactToInspect.address) {
                duplicated = true
            }
        })
        return duplicated
    }

    private openQrScanner() {
        this.setState({ isScanning: true })
        document.getElementById("blockexplorer").style.visibility = "hidden"
        window.QRScanner.scan((err, text) => {
            if (err) {
                console.error(err)
            }
            document.getElementById("blockexplorer").style.visibility = "visible"

            if (text.charAt(0) === "H") {
                this.setState({ contactAddress: text })
            } else {
                this.setState({ contactAddress: JSON.parse(text).address })
            }

            window.QRScanner.destroy()
            this.setState({ isScanning: false })
        })
        window.QRScanner.show(((status) => {
            document.getElementById("qrCloseButton").style.visibility = "visible"
        }))
    }

    private closeScan() {
        window.QRScanner.destroy()
        this.setState({ isScanning: false })
        document.getElementById("qrCloseButton").style.visibility = "hidden"
        document.getElementById("blockexplorer").style.visibility = "visible"
    }
}
