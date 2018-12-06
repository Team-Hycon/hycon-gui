import { createStyles } from "@material-ui/core"
import AppBar from "@material-ui/core/AppBar"
import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Checkbox from "@material-ui/core/Checkbox"
import ClickAwayListener from "@material-ui/core/ClickAwayListener"
import Collapse from "@material-ui/core/Collapse"
import Divider from "@material-ui/core/Divider"
import Fade from "@material-ui/core/Fade"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Grid from "@material-ui/core/Grid"
import IconButton from "@material-ui/core/IconButton"
import Input from "@material-ui/core/Input"
import InputAdornment from "@material-ui/core/InputAdornment"
import MenuItem from "@material-ui/core/MenuItem"
import Snackbar from "@material-ui/core/Snackbar"
import TextField from "@material-ui/core/TextField"
import Toolbar from "@material-ui/core/Toolbar"
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
import ArrowBackIcon from "@material-ui/icons/ArrowBack"
import TooltipIcon from "@material-ui/icons/Help"
import Visibility from "@material-ui/icons/Visibility"
import VisibilityOff from "@material-ui/icons/VisibilityOff"
import * as React from "react"
import { Redirect } from "react-router"
import { Link } from "react-router-dom"
import { encodingMnemonic } from "../desktop/stringUtil"
import { IHyconWallet, IResponseError, IRest } from "../rest"
import { IText } from "./locales/m_locales"

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
    disableTextSelect: {
        userSelect: "none",
        MozUserSelect: "none",
        msTouchSelect: "none",
        msUserSelect: "none",
        WebkitUserSelect: "none",
    },
})

interface IProps {
    rest: IRest
    language: IText
}

export class AddWallet extends React.Component<IProps, any> {

    constructor(props: IProps) {
        super(props)
        this.state = {
            alertDialogShown: false,
            tooltipOpen: false,
            language: this.props.language,
            walletName: "",
            password: "",
            confirmPassword: "",
            checked: false,
            passphrase: "",
            step: 0,
            generatedMnemonic: "",
            confirmMnemonic: "",
            reconfirmMnemonic: "",
            walletViewRedirect: false,
            mnemonicLanguage: "english",
        }
    }

    public shouldComponentUpdate(nextProps: IProps, nextState: any): boolean {
        return true
    }

    public renderWalletInfo() {
        if (this.state.isDeleted === true) {
            return (<Redirect to="/your/redirect/page" />)
        }
        return (
            <Grid container spacing={16}>
                <Grid item xs={12} sm={8}>
                    <TextField
                        fullWidth
                        id="wallet_name"
                        type="text"
                        label={this.props.language["ph-wallet-name"]}
                        value={this.state.email}
                        onChange={this.handleChange("walletName")}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        select
                        fullWidth
                        id="mnemonic_language"
                        type="text"
                        label={this.props.language["ph-mnemonic-language"]}
                        value={this.state.mnemonicLanguage}
                        onChange={this.handleChange("mnemonicLanguage")}
                    >
                        <MenuItem key="english" value="english">{this.props.language["lang-en"]}</MenuItem>
                        <MenuItem key="french" value="french">{this.props.language["lang-fr"]}</MenuItem>
                        <MenuItem key="spanish" value="spanish">{this.props.language["lang-sp"]}</MenuItem>
                        <MenuItem key="korean" value="korean">{this.props.language["lang-ko"]}</MenuItem>
                        <MenuItem key="chinese_simplified" value="chinese_simplified">{this.props.language["lang-cs"]}</MenuItem>
                        <MenuItem key="chinese_traditional" value="chinese_traditional">{this.props.language["lang-ct"]}</MenuItem>
                        <MenuItem key="japanese" value="japanese">{this.props.language["lang-ja"]}</MenuItem>
                        <MenuItem key="italian" value="italian">{this.props.language["lang-it"]}</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        id="adornment-password"
                        label={this.props.language["ph-password"]}
                        type={this.state.showPassword ? "text" : "password"}
                        value={this.state.password}
                        style={{ fontSize: "1em" }}
                        onChange={this.handleChange("password")}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="Toggle password visibility"
                                        onClick={this.handleClickShowPassword}
                                        onMouseDown={this.handleMouseDownPassword}
                                    >
                                        {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        id="confirm-password"
                        label={this.props.language["ph-confirm-password"]}
                        type={this.state.showPassword ? "text" : "password"}
                        value={this.state.confirmPassword}
                        style={{ fontSize: "1em" }}
                        onChange={this.handleChange("confirmPassword")}
                    />
                </Grid>
                <Grid item xs={12} style={{ display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                color="primary"
                                checked={this.state.checked}
                                onChange={this.handleAdvancedOption("checked")}
                                value="checked"
                            />
                        }
                        style={{ fontSize: "1em" }}
                        label={this.props.language["ph-advanced-options"]}
                    />
                    <ClickAwayListener onClickAway={this.hideAlertDialog}>
                        <Tooltip
                            disableTouchListener
                            interactive
                            open={this.state.alertDialogShown}
                            onClose={this.hideAlertDialog}
                            placement="bottom-end"
                            title={this.props.language["common-advanced-options-hint1"]}>
                            <IconButton>
                                <TooltipIcon onClick={this.showAlertDialog} />
                            </IconButton>
                        </Tooltip>
                    </ClickAwayListener>
                </Grid>
                <Grid item xs={12} style={{ display: "flex" }}>
                    <Collapse in={this.state.checked} style={{ width: "100%" }}>
                        <Input
                            fullWidth
                            id="bip39-passphrase"
                            type="text"
                            placeholder={this.props.language["ph-bip39"]}
                            value={this.state.passphrase}
                            style={{ fontSize: "0.7em" }}
                            onChange={this.handleChange("passphrase")}
                        />
                    </Collapse>
                </Grid>
            </Grid>
        )
    }

    public renderChoice() {
        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <Typography variant="body1" align="left" gutterBottom>
                        {this.props.language["common-select-create-or-recover"]}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Button
                        fullWidth
                        style={{ backgroundColor: "#172349", color: "#fff" }}
                        variant="contained"
                        size="large"
                        onClick={this.newWallet.bind(this)}>
                        {this.props.language["btn-create-wallet"]}
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Button
                        fullWidth
                        style={{ backgroundColor: "#172349", color: "#fff" }}
                        variant="contained"
                        size="large"
                        onClick={this.recoverWallet.bind(this)}>
                        {this.props.language["btn-recover-wallet"]}
                    </Button>
                </Grid>
            </Grid>
        )
    }

    public renderMnemonic() {
        return (
            <Grid container spacing={16}>
                <Grid item xs={12}>
                    <Typography variant="body1" align="left" gutterBottom>
                        {this.props.language["create-type-mnemonic"]}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="generated-mnemonic"
                        label={this.props.language["ph-generated-mnemonic"]}
                        variant="outlined"
                        fullWidth
                        multiline
                        disabled
                        rowsMax="4"
                        value={this.state.generatedMnemonic}
                        style={styles.disableTextSelect}
                    />
                </Grid>
                <Grid container direction="row" alignItems="center" alignContent="flex-end">
                    <Grid item xs />
                    <Grid item xs>
                        <Typography align="right" style={{ padding: "0 auto" }}>
                            {this.props.language["create-what-is-this"]}
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
                                title={this.props.language["create-answer-what-is-this"]}>
                                <IconButton>
                                    <TooltipIcon onClick={this.handleTooltipOpen} />
                                </IconButton>
                            </Tooltip>
                        </ClickAwayListener>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="confirm-mnemonic"
                        label={this.props.language["ph-enter-mnemonic"]}
                        variant="outlined"
                        fullWidth
                        multiline
                        rowsMax="4"
                        value={this.state.confirmMnemonic}
                        onChange={this.handleChange("confirmMnemonic")}
                        style={styles.disableTextSelect}
                    />
                </Grid>
            </Grid>
        )
    }

    public renderConfirm() {
        return (
            <Grid container spacing={16}>
                <Grid item xs={12}>
                    {
                        this.state.step === 3 ?
                            <Typography variant="body1" align="left" gutterBottom>
                                {this.props.language["create-retype-mnemonic"]}
                            </Typography> :
                            <Typography variant="body1" align="left" gutterBottom>
                                {this.props.language["recover-type-mnemonic"]}
                            </Typography>
                    }
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="reconfirm-mnemonic"
                        label={this.state.step === 3 ? this.props.language["ph-confirm-mnemonic"] : this.props.language["ph-enter-mnemonic"]}
                        variant="outlined"
                        fullWidth
                        multiline
                        rowsMax="4"
                        value={this.state.reconfirmMnemonic}
                        onChange={this.handleChange("reconfirmMnemonic")}
                    />
                </Grid>

                <Snackbar
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    open={this.state.walletViewRedirect}
                    TransitionComponent={Fade}
                    ContentProps={{ "aria-describedby": "message-id" }}
                    message={<span id="message-id">{this.state.step === 3 ? this.props.language["create-success"] : this.props.language["recover-success"]}</span>}
                    action={
                        <Link to="/" style={{ textDecoration: "none" }}><Button color="primary" size="small">{this.props.language["btn-confirm"]}</Button></Link>
                    }
                />
            </Grid>
        )
    }

    public render() {
        let component: any
        switch (this.state.step) {
            case 0:
                component = this.renderWalletInfo()
                break
            case 1:
                component = this.renderChoice()
                break
            case 2:
                if (this.state.generatedMnemonic === "") {
                    this.generateMnemonic()
                } else {
                    component = this.renderMnemonic()
                }
                break
            case 3:
                component = this.renderConfirm()
                break
            case 4:
                component = this.renderConfirm()
                break
        }
        return (
            <Grid container justify="space-between" style={styles.root}>
                <Grid item>
                    <AppBar style={{ background: "transparent", boxShadow: "none", zIndex: 0 }} position="static">
                        <Toolbar style={styles.header}>
                            {
                                this.state.step === 0 ?
                                    <Link to="/">
                                        <IconButton><ArrowBackIcon /></IconButton>
                                    </Link> :
                                    <IconButton onClick={this.decrementStep.bind(this)}><ArrowBackIcon /></IconButton>
                            }
                            <Typography variant="button" align="center">
                                {this.props.language["common-title"]}
                            </Typography>
                            <div style={{ width: 48, height: 48 }} />
                        </Toolbar>
                    </AppBar>
                    <Divider />
                </Grid>
                <Grid item alignContent="center">
                    <Card elevation={0} square>
                        <CardContent>
                            {component}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item alignContent="center">
                    {this.state.step === 1 ?
                        <p></p> :
                        this.state.step < 3 ?
                            <Button
                                onClick={this.incrementStep.bind(this)}
                                style={{ backgroundColor: "#172349", color: "#fff", width: "100%", padding: "16px 24px" }}>
                                {this.props.language["btn-continue"]}
                            </Button> :
                            <Button
                                onClick={this.generateWallet.bind(this)}
                                style={{ backgroundColor: "#172349", color: "#fff", width: "100%", padding: "16px 24px" }}>
                                {this.props.language["btn-finish"]}
                            </Button>
                    }
                </Grid>
            </Grid>
        )
    }

    private incrementStep() {
        if (this.state.step === 0) {
            this.props.rest.checkDupleName(this.state.walletName).then((rep) => {
                if (rep) {
                    alert(this.props.language["alert-wallet-name-duplicate"])
                    return
                } else {
                    if (!this.state.walletName || this.state.walletName.includes(" ")) {
                        alert(this.props.language["alert-wallet-name-no-space"])
                        return
                    } else if (this.state.password !== this.state.confirmPassword) {
                        alert(this.props.language["alert-password-not-match"])
                        return
                    } else if (!this.state.password) {
                        if (confirm(this.props.language["confirm-password-null"])) {
                            this.setState({ step: 1 })
                        } else {
                            return
                        }
                    }
                    this.setState({ step: 1 })
                }
            }).catch((e) => {
                alert(e)
                return
            })
        } else if (this.state.step === 2) {
            if (this.state.generatedMnemonic !== encodingMnemonic(this.state.confirmMnemonic)) {
                alert(this.props.language["alert-mnemonic-not-match"])
                return
            }
            this.setState({ step: 3 })
        }
    }

    private decrementStep() {
        if (this.state.step === 1) {
            this.setState({
                step: 0,
                walletName: "",
                password: "",
                confirmPassword: "",
                checked: false,
                passphrase: "",
            })
        } else if (this.state.step === 2) {
            this.setState({
                step: 1,
                generatedMnemonic: "",
                confirmMnemonic: "",
                reconfirmMnemonic: "",
                walletViewRedirect: false,
            })
        } else if (this.state.step === 3) {
            this.setState({
                step: 2,
                confirmMnemonic: "",
                reconfirmMnemonic: "",
                walletViewRedirect: false,
            })
        } else if (this.state.step === 4) {
            this.setState({
                step: 1,
                generatedMnemonic: "",
                confirmMnemonic: "",
                reconfirmMnemonic: "",
                walletViewRedirect: false,
            })
        }
    }

    private newWallet() {
        this.setState({ step: 2 })
    }

    private recoverWallet() {
        this.setState({ step: 4 })
    }

    private handleTooltipClose = () => {
        this.setState({ tooltipOpen: false })
    }

    private handleTooltipOpen = () => {
        this.setState({ tooltipOpen: true })
    }

    private hideAlertDialog = () => {
        this.setState({ alertDialogShown: false })
    }

    private showAlertDialog = () => {
        this.setState({ alertDialogShown: true })
    }

    private handleChange = (prop: any) => (event: any) => {
        this.setState({ [prop]: event.target.value })
    }

    private handleAdvancedOption = (name: any) => (event: any) => {
        this.setState({ [name]: event.target.checked })
    }
    private handleMouseDownPassword = (event: any) => {
        event.preventDefault()
    }

    private handleClickShowPassword = () => {
        this.setState((state: any) => ({ showPassword: !this.state.showPassword }))
    }

    private generateMnemonic() {
        this.props.rest.getMnemonic(this.state.mnemonicLanguage).then((data: string) => {
            this.setState({ generatedMnemonic: data, isMnemonic: true })
        })

    }

    private generateWallet() {
        this.setState({ isMnemonic: true })
        const encodedMnemonic = encodingMnemonic(this.state.reconfirmMnemonic)

        if (this.state.step === 3 && (this.state.generatedMnemonic !== encodedMnemonic)) {
            alert(this.props.language["alert-mnemonic-not-match"])
            return
        }

        this.props.rest.recoverWallet({
            language: this.state.mnemonicLanguage,
            mnemonic: encodedMnemonic,
            name: this.state.walletName,
            passphrase: this.state.passphrase,
            password: this.state.password,
        }).then((res: string) => {
            this.setState({ walletViewRedirect: true, address: res })
            this.props.rest.getWalletDetail(this.state.walletName).then((data: IHyconWallet | IResponseError) => {
                if (data != null && data !== undefined) {
                    console.log(data)
                }
            })
        }).catch((e: string) => {
            switch (e.toString()) {
                case "Error: mnemonic":
                    alert(this.props.language["alert-mnemonic-lang-not-match"])
                    break
                case "address":
                    alert(this.props.language["alert-wallet-address-duplicate"])
                    break
                default:
                    alert(this.props.language["alert-recover-fail"])
            }
        })
    }
}
