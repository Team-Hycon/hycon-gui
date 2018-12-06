import { createStyles } from "@material-ui/core"
import AppBar from "@material-ui/core/AppBar"
import Button from "@material-ui/core/Button"
import Checkbox from "@material-ui/core/Checkbox"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import IconButton from "@material-ui/core/IconButton"
import Input from "@material-ui/core/Input"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import ListSubheader from "@material-ui/core/ListSubheader"
import MenuItem from "@material-ui/core/MenuItem"
import TextField from "@material-ui/core/TextField"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
import AddIcon from "@material-ui/icons/Add"
import AddressBookIcon from "@material-ui/icons/Contacts"
import SettingsIcon from "@material-ui/icons/Settings"
import * as React from "react"
import { Link } from "react-router-dom"
import SwipeableViews from "react-swipeable-views"
import { IRest } from "../rest"
import { TermsOfUseContent } from "./content/termsOfUse"
import { IText } from "./locales/m_locales"
// tslint:disable:no-var-requires
const logo = require("./img/logo.png")
const logoBall = require("./img/hycon-logo-ball.png")
const logoBallW = require("./img/hycon-logo-ball-w.png")
const lock = require("./img/onboarding-lock.png")
const graph = require("./img/onboarding-graph.png")
const qr = require("./img/onboarding-qr.png")
const storage = window.localStorage

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
    },
    subheader: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "10px",
    },
    slides: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        // justifyContent: "space-around",
        background: "-webkit-linear-gradient(top, #172349 0%,#0095a1 100%)",
    },
    slide: {
        flex: 1,
        display: "flex",
        // flexDirection: "column",
        // justifyContent: "space-around",
    },
})

interface IProps {
    rest: IRest
    language: IText
    languageSelect: string
    languageChange: (code: string) => void
}

export class WalletList extends React.Component<IProps, any> {

    public mounted: boolean = false
    public buttonPressTimer: any

    constructor(props: IProps) {
        super(props)
        this.state = {
            rest: this.props.rest,
            language: this.props.language,
            languageSelect: this.props.languageSelect,
            wallets: [],
            contactName: "",
            contactAddress: "",
            contactList: [],
            dialogAddContact: false,
            activeStep: 0,
            secureOnDevice: false,
            recoverWithPhrase: false,
            termsOfUse: false,
            openDialog: false,
            scroll: "paper",
        }
        this.state.rest.getFavoriteList().then((data: any) => {
            this.setState({ contactList: data })
        })
    }

    public componentDidMount() {
        this.mounted = true
        this.setWallets()
    }

    public renderOnboarding() {
        const onboardingSlides = [
            {
                label: "1",
                slide: (
                    <Grid container alignItems="center" style={{ margin: "0 20%" }}>
                        <Grid item xs={12}>
                            <Typography variant="caption" align="center" style={{ color: "#0095a2" }}>{this.props.language["onboarding-step1-text1"]}</Typography>
                            <Grid item style={{ marginTop: "15%", textAlign: "center" }}><img style={{ maxHeight: 70 }}src={logoBallW}/></Grid>
                            <Typography variant="subtitle2" align="center" style={{ color: "white" }}>{this.props.language["onboarding-step1-text2"]}</Typography>
                        </Grid>
                        <Grid item xs={12}/>
                        <Grid item xs={12}>
                            <Typography variant="body2" align="center" style={{ color: "white" }}>{this.props.language["onboarding-step1-text3"]}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button fullWidth variant="contained" style={{ background: "#172349", color: "white", textTransform: "none" }} onClick={this.handleNext}>{this.props.language["btn-get-started"]}</Button>
                        </Grid>
                    </Grid >
                ),
            }, {
                label: "2",
                slide: (
                    <Grid container alignItems="center" style={{ margin: "0 20%" }}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" align="center" style={{ color: "white" }}>{this.props.language["onboarding-step2-text1"]}</Typography>
                            <Typography variant="caption" align="center" style={{ color: "#0095a2" }}>{this.props.language["onboarding-step2-text2"]}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid item style={{ textAlign: "center" }}>
                                { Number(window.orientation) % 180 === 0 ? <img style={{ maxHeight: 180 }} src={qr} /> : <img style={{ maxHeight: 120 }} src={qr} /> }
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2" align="center" style={{ color: "white" }}>{this.props.language["onboarding-step2-text3"]}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button fullWidth variant="contained" style={{ background: "#172349", color: "white", textTransform: "none" }} onClick={this.handleNext}>{this.props.language["btn-got-it"]}</Button>
                        </Grid>
                    </Grid >
                ),
            }, {
                label: "3",
                slide: (
                    <Grid container alignItems="center" style={{ margin: "0 20%" }}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" align="center" style={{ color: "white" }}>{this.props.language["onboarding-step3-text1"]}</Typography>
                            <Typography variant="caption" align="center" style={{ color: "#0095a2" }}>{this.props.language["onboarding-step3-text2"]}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid item style={{ textAlign: "center" }}>
                                {Number(window.orientation) % 180 === 0 ? <img style={{ maxHeight: 180 }} src={graph} /> : <img style={{ maxHeight: 120 }} src={graph} />}
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2" align="center" style={{ color: "white" }}>{this.props.language["onboarding-step3-text3"]}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button fullWidth variant="contained" style={{ background: "#172349", color: "white", textTransform: "none" }} onClick={this.handleNext}>{this.props.language["btn-got-it"]}</Button>
                        </Grid>
                    </Grid >
                ),
            }, {
                label: "4",
                slide: (
                    <Grid container alignItems="center" style={{ margin: "0 20%" }}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" align="center" style={{ color: "white" }}>{this.props.language["onboarding-step4-text1"]}</Typography>
                            <Typography variant="caption" align="center" style={{ color: "#0095a2" }}>{this.props.language["onboarding-step4-text2"]}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid item style={{ textAlign: "center" }}>
                                {Number(window.orientation) % 180 === 0 ? <img style={{ maxHeight: 180 }} src={lock} /> : <img style={{ maxHeight: 120 }} src={lock} />}
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2" align="center" style={{ color: "white" }}>{this.props.language["onboarding-step4-text3"]}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button fullWidth variant="contained" style={{ background: "#172349", color: "white", textTransform: "none" }} onClick={this.handleNext}>{this.props.language["btn-got-it"]}</Button>
                        </Grid>
                    </Grid >
                ),
            }, {
                label: "5",
                slide: (
                    <Grid container alignItems="center">
                        <Grid item xs={12} style={{ margin: "0 20%" }}>
                            <Typography variant="subtitle1" align="center" style={{ color: "white" }}>{this.props.language["onboarding-step5-text1"]}</Typography>
                            <Typography variant="caption" align="center" style={{ color: "#0095a2" }}>{this.props.language["onboarding-step5-text2"]}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <List>
                                <ListItem key={1} disableRipple button>
                                    <Checkbox disableRipple checked={this.state.secureOnDevice} onChange={this.handleCheckbox("secureOnDevice")} value="secureOnDevice" style={{ color: "white" }}/>
                                    <ListItemText disableTypography
                                        primary={<Typography variant="caption" style={{ color: "white" }}>
                                            {this.props.language["onboarding-step5-checkbox1"]}
                                        </Typography>}
                                    />
                                </ListItem>
                                <ListItem key={2} disableRipple button>
                                    <Checkbox disableRipple checked={this.state.recoverWithPhrase} onChange={this.handleCheckbox("recoverWithPhrase")} value="recoverWithPhrase" style={{ color: "white" }}/>
                                    <ListItemText disableTypography
                                        primary={<Typography variant="caption" style={{ color: "white" }}>
                                            {this.props.language["onboarding-step5-checkbox2"]}
                                        </Typography>}
                                    />
                                </ListItem>
                                <ListItem key={3} disableRipple button>
                                    <Checkbox disableRipple checked={this.state.termsOfUse} onChange={this.handleCheckbox("termsOfUse")} value="termsOfUse" style={{ color: "white" }}/>
                                    <ListItemText disableTypography
                                        primary={<Typography variant="caption" style={{ color: "white" }}>
                                            {this.props.language["onboarding-step5-checkbox3"]} <a onClick={this.handleDialog} style={{ color: "#0095a2", textDecoration: "underline" }}>{this.props.language["terms-of-use"]}</a>
                                        </Typography>}
                                    />
                                </ListItem>
                                <ListItem key={4} disableRipple button onClick={this.handleCheckbox("all")}>
                                    <ListItemText disableTypography
                                        primary={<Typography align="right" variant="caption" style={{ color: "white" }}>{this.props.language["check-all"]}</Typography>}
                                    />
                                    <ListItemSecondaryAction>
                                        <Checkbox
                                            disableRipple
                                            checked={ [this.state.secureOnDevice, this.state.recoverWithPhrase, this.state.termsOfUse].filter((v) => (v)).length === 3 }
                                            onChange={this.handleCheckbox("all")}
                                            value="checkAll"
                                            style={{ color: "white" }}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid item xs={12}>
                        </Grid>
                        <Grid item xs={12} style={{ margin: "0 20%" }}>
                            {[this.state.secureOnDevice, this.state.recoverWithPhrase, this.state.termsOfUse].filter((v) => (v)).length !== 3 ?
                                <Button fullWidth variant="contained" disabled style={{ textTransform: "none" }}
                                >{this.props.language["btn-finish"]}</Button> :
                                <Button fullWidth variant="contained" style={{ background: "#172349", color: "white", textTransform: "none" }} onClick={this.handleFinish}
                                >{this.props.language["btn-finish"]}</Button>
                            }
                        </Grid>
                    </Grid>
                ),
            },
        ]

        const maxSteps = onboardingSlides.length
        return (
            <Grid item xs={12} style={styles.root}>
                <SwipeableViews
                    axis={"x"}
                    index={this.state.activeStep}
                    onChangeIndex={this.handleStepChange}
                    style={styles.slides}
                    containerStyle={ styles.slide}
                >
                    {onboardingSlides.map((step, index) => (
                        <Grid container key={step.label} style={{ height: "100%" }}>
                            {step.slide}
                        </Grid>
                    ))}
                </SwipeableViews>
                <Dialog open={this.state.openDialog} onClose={this.handleDialog} scroll={this.state.scroll}>
                    <DialogTitle id="terms-of-use-title"><Typography variant="h6">{this.props.language["terms-of-use"]}</Typography></DialogTitle>
                    <TermsOfUseContent language={this.props.language} />
                    <DialogActions>
                        <Button style={{ color: "#172349" }} onClick={this.handleDialog}>{this.props.language["btn-close"]}</Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        )
    }

    public renderList() {
        return (
            <Grid item xs={12} style={styles.root}>
                <Grid item xs={12}>
                    <List subheader={
                        <ListSubheader disableSticky component="div" style={styles.subheader}>
                            <span style={{ margin: "auto 0" }}>{this.props.language["wallet-list"]} ({this.state.wallets.length})</span>
                            <div>
                                <span><Link to="/addwallet"><IconButton aria-label="add-wallet"><AddIcon style={{ fontSize: 20 }} /></IconButton></Link></span>
                                <span><Link to="/contacts"><IconButton aria-label="contacts"><AddressBookIcon style={{ fontSize: 18 }} /></IconButton></Link></span>
                                <span><Link to="/settings"><IconButton aria-label="settings"><SettingsIcon style={{ fontSize: 20 }} /></IconButton></Link></span>
                            </div>
                        </ListSubheader>
                    }>
                        {this.state.wallets.map((n: {name: string, address: string}) => (
                            <Link style={{ textDecoration: "none" }} to={"/wallet/" + n.name} >
                                <ListItem
                                    key={`item-${n}`}
                                    onTouchStart={this.handleButtonPress.bind(this, n.address)}
                                    onTouchEnd={this.handleButtonRelease.bind(this)}
                                    onMouseDown={this.handleButtonPress.bind(this, n.address)}
                                    onMouseUp={this.handleButtonRelease.bind(this)}
                                >
                                    <ListItemText primary={n.name} secondary={n.address} />
                                </ListItem>
                                <Divider />
                            </Link>
                        ))}
                    </List>
                </Grid>
                {
                    this.state.wallets.length === 0 ?
                    <Grid container direction="column" justify="space-around" style={{ flexGrow: 1 }}>
                        <Grid item xs={12}>
                            <Typography variant="h6" align="center">
                                {this.props.language["home-guide-add-wallet"]}
                            </Typography>
                            <Typography variant="caption" align="center" style={{ paddingBottom: "10%" }}>
                                {this.props.language["home-guide-tap-plus"]}
                            </Typography>
                        </Grid>
                    </Grid> : ""
                }
            </Grid>
        )
    }

    public render() {
        let component: any
        storage.getItem("onboarding") === null ? component = this.renderOnboarding() : component = this.renderList()

        return (
            <Grid container style={styles.root}>
                <Grid item xs={12}>
                    <AppBar position="static" style={{ backgroundColor: "#172349"}}>
                        <Toolbar style={styles.header}>
                            <img style={{ maxHeight: 28 }} src={logo} />
                                <TextField
                                    select
                                    id="language_select"
                                    type="text"
                                    value={this.state.languageSelect}
                                    onChange={this.handleLangChange("languageSelect")}
                                    SelectProps={{ style: { color: "#fff" } }}
                                    style={{ color: "#fff" }}
                                >
                                    <MenuItem key="en" value="en">{this.props.language["lang-en"]}</MenuItem>
                                    <MenuItem key="ko" value="ko">{this.props.language["lang-ko"]}</MenuItem>
                                </TextField>
                        </Toolbar>

                        {/* Below is only used for alpha / beta test deployments. */}
                        {/* <Grid item xs={12} style={{ padding: 5, backgroundColor: "red" }}>
                            <Typography variant="caption" align="center" style={{ color: "white" }}>
                                {this.state.language["warning-do-not-share"]}
                            </Typography>
                        </Grid> */}

                    </AppBar>
                </Grid>

                {/* Onboarding Slides or Wallet List */}
                {component}

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
                            onChange={this.handleInputChange("contactName")}
                        />
                        <Input
                            disabled
                            fullWidth
                            id="contact-address"
                            value={this.state.contactAddress}
                            inputProps={{ style: { fontSize: "12px" } }}
                        />
                        <Button
                            onClick={this.addContact.bind(this)}
                            style={{ backgroundColor: "#172349", color: "#fff", width: "100%", marginTop: "20px" }}>
                            {this.props.language["btn-add"]}
                        </Button>
                    </div>
                </Dialog>
            </Grid>
        )
    }

    private handleDialog = () => {
        this.setState({ openDialog: !this.state.openDialog })
    }

    private handleCheckbox = (name) => (event) => {
        if (name === "all" && ([this.state.secureOnDevice, this.state.recoverWithPhrase, this.state.termsOfUse].filter((v) => (v)).length < 3)) {
            this.setState({ secureOnDevice: true, recoverWithPhrase: true, termsOfUse: true })
        } else if ([this.state.secureOnDevice, this.state.recoverWithPhrase, this.state.termsOfUse].filter((v) => (v)).length === 3) {
            this.setState({ secureOnDevice: false, recoverWithPhrase: false, termsOfUse: false })
        } else {
            this.setState({ [name]: event.target.checked })
        }
    }
    private handleFinish = () => {
        storage.setItem("onboarding", "true")
        this.forceUpdate()
    }

    private handleNext = () => {
        this.setState((prevState) => ({
            activeStep: prevState.activeStep + 1,
        }))
    }

    private handleStepChange = (activeStep) => {
        this.setState({ activeStep })
    }
    private handleLangChange = (prop: any) => (event: any) => {
        this.props.languageChange(event.target.value)
    }

    private handleInputChange = (prop: any) => (event: any) => {
        this.setState({ [prop]: event.target.value })
    }

    private setWallets() {
        this.state.rest.getWalletList().then((data: any) => {
            this.setState({ wallets: data.walletList })
        })
    }

    private handleButtonPress(addressToAdd: string) {
        this.buttonPressTimer = setTimeout(() => {
            if (confirm(this.props.language["confirm-add-address-to-contact"])) {
                this.setState({ contactAddress: addressToAdd, dialogAddContact: true })
            }
        }, 1000)
    }

    private handleButtonRelease() {
        clearTimeout(this.buttonPressTimer)
    }

    private closeAddContact() {
        this.setState({ contactAddress: "", contactName: "", dialogAddContact: false })
    }

    private addContact() {
        if (!this.state.contactName) {
            alert(this.props.language["alert-enter-name"]); return
        } else if (this.checkDuplicateContact({ alias: this.state.contactName, address: this.state.contactAddress })) {
            alert(this.props.language["alert-contact-address-duplicate"])
            this.setState({ contactAddress: "", contactName: "", dialogAddContact: false })
        }

        this.state.rest.addFavorite(this.state.contactName, this.state.contactAddress).then(() => {
            this.setState({ contactAddress: "", contactName: "", dialogAddContact: false })
        })
    }

    private checkDuplicateContact(contactToInspect: { alias: string, address: string }): boolean {
        let duplicated = false
        this.state.contactList.forEach((contact: { alias: string, address: string }) => {
            if (contact.alias === contactToInspect.alias || contact.address === contactToInspect.address) {
                duplicated = true
            }
        })
        return duplicated
    }
}
