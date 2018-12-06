import { createStyles, DialogTitle, FormControl } from "@material-ui/core"
import AppBar from "@material-ui/core/AppBar"
import Button from "@material-ui/core/Button"
import Checkbox from "@material-ui/core/Checkbox"
import Collapse from "@material-ui/core/Collapse"
import Dialog from "@material-ui/core/Dialog"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Grid from "@material-ui/core/Grid"
import IconButton from "@material-ui/core/IconButton"
import Input from "@material-ui/core/Input"
import InputAdornment from "@material-ui/core/InputAdornment"
import Modal from "@material-ui/core/Modal"
import NativeSelect from "@material-ui/core/NativeSelect"
import Paper from "@material-ui/core/Paper"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
import ArrowBackIcon from "@material-ui/icons/ArrowBack"
import HelpIcon from "@material-ui/icons/Help"
import Visibility from "@material-ui/icons/Visibility"
import VisibilityOff from "@material-ui/icons/VisibilityOff"
import * as React from "react"
import { Link } from "react-router-dom"
import { IRest } from "../rest"
import { IHyconWallet } from "../rest"
import { IText } from "./locales/m_locales"

export interface ILogin {
    email: string
    password: string
    tfa_token?: string
    tfa_pin?: number
}
// tslint:disable:object-literal-sort-keys
const styles = createStyles({
    root: {
        display: "flex",
        height: "-webkit-fill-available",
    },
    header: {
        display: "flex",
        justifyContent: "flex-start",
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

export class ClaimWallet extends React.Component<IProps, any> {
    public static getDerivedStateFromProps(nextProps: IProps, previousState: any): IProps {
        return Object.assign(nextProps, {})
    }

    constructor(props: IProps) {
        super(props)
        this.state = {
            email: "",
            password: "",
            pin: "",
            showPassword: false,
            showTFA: false,
            loggedIn: false,
            checked: false,
            alertDialogShown: false,
            mnemonicLanguage: "english",
            reconfirmMnemonic: "",
            passphrase: "",
            successDialog: false,
        }
    }

    public shouldComponentUpdate(nextProps: IProps, nextState: any): boolean {
        return true
    }

    public render() {
        return (
            <div style={styles.root}>
                {!this.state.loggedIn ?
                    <Grid container direction="column" justify="space-between">
                        <Grid item>
                            <AppBar style={{ background: "transparent", boxShadow: "none", zIndex: 0 }} position="static">
                                <Toolbar style={styles.header}>
                                    <Link to={"/wallet/" + this.props.wallet.name}>
                                        <IconButton><ArrowBackIcon /></IconButton>
                                    </Link>
                                    <Typography variant="button" align="center">
                                        {this.props.language["claim-title"]}
                                    </Typography>
                                </Toolbar>
                            </AppBar>
                        </Grid>
                        <Grid item alignContent="center">
                            <Grid item style={{ width: "60%", margin: "0 auto" }}>
                                <div style={{ paddingBottom: "10%" }}>
                                    <Input
                                        fullWidth
                                        id="email"
                                        type="text"
                                        placeholder={this.props.language["ph-email"]}
                                        value={this.state.email}
                                        style={{ fontSize: "1em" }}
                                        onChange={this.handleChange("email")}
                                    />
                                </div>
                                <div>
                                    <Input
                                        fullWidth
                                        id="adornment-password"
                                        type={this.state.showPassword ? "text" : "password"}
                                        placeholder={this.props.language["ph-password"]}
                                        value={this.state.password}
                                        style={{ fontSize: "1em" }}
                                        onChange={this.handleChange("password")}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="Toggle password visibility"
                                                    onClick={this.handleClickShowPassword}
                                                    onMouseDown={this.handleMouseDownPassword}
                                                >
                                                    {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </div>
                                <div style={{ display: "flex" }}>
                                    <Collapse in={this.state.showTFA} style={{ width: "100%" }}>
                                        <Paper elevation={4}>
                                            <Input
                                                fullWidth
                                                disableUnderline
                                                id="pin"
                                                type="number"
                                                placeholder={this.props.language["ph-2fa"]}
                                                value={this.state.pin}
                                                inputProps={{
                                                    style: { textAlign: "center" },
                                                    maxLength: 6,
                                                }}
                                                style={{ padding: "15px 0", fontSize: "1em" }}
                                                onChange={this.handleChange("pin")}
                                            />
                                        </Paper>
                                    </Collapse>
                                </div>
                            </Grid>
                        </Grid>
                        <Grid item alignContent="center">
                            <Button
                                onClick={this.handleLogin.bind(this)}
                                style={{ backgroundColor: "#172349", color: "#fff", width: "100%", padding: "16px 24px" }}>
                                {this.props.language["btn-login"]}
                            </Button>
                        </Grid>
                    </Grid> :
                    <Grid container direction="column" justify="space-between">
                        <Grid item>
                            <AppBar style={{ background: "transparent", boxShadow: "none", zIndex: 0 }} position="static">
                                <Toolbar style={styles.header}>
                                    <Link to="/">
                                        <IconButton style={styles.menuButton}><ArrowBackIcon /></IconButton>
                                    </Link>
                                    <Typography variant="button" align="center">
                                        {this.props.language["claim-title"]}
                                    </Typography>
                                </Toolbar>
                            </AppBar>
                        </Grid>
                        <Grid item alignContent="center" style={{ width: "90%", margin: "50% auto" }}>
                            <Input
                                id="reconfirm-mnemonic"
                                fullWidth
                                multiline
                                rowsMax="2"
                                placeholder={this.props.language["ph-enter-mnemonic"]}
                                value={this.state.reconfirmMnemonic}
                                onChange={this.handleChange("reconfirmMnemonic")}
                            />
                            <Grid item xs={12} style={{ paddingBottom: "5%" }}>
                                <FormControl >
                                    <NativeSelect
                                        value={this.state.mnemonicLanguage}
                                        onChange={this.handleChange("mnemonicLanguage")}
                                        name="mnemonicLanguage">
                                        <option value="english">{this.props.language["lang-en"]}</option>
                                        <option value="french">{this.props.language["lang-fr"]}</option>
                                        <option value="spanish">{this.props.language["lang-sp"]}</option>
                                        <option value="korean">{this.props.language["lang-ko"]}</option>
                                        <option value="chinese_simplified">{this.props.language["lang-cs"]}</option>
                                        <option value="chinese_traditional">{this.props.language["lang-ct"]}</option>
                                        <option value="japanese">{this.props.language["lang-ja"]}</option>
                                        <option value="italian">{this.props.language["lang-it"]}</option>
                                    </NativeSelect>
                                </FormControl>
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
                                <IconButton onClick={this.onClickHint.bind(this)}>
                                    <HelpIcon style={{ fontSize: "18px" }} />
                                </IconButton>
                            </Grid>
                            <Grid item xs={12} style={{ display: "flex" }}>
                                <Collapse in={this.state.checked} style={{ width: "100%", marginBottom: "10px" }}>
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
                            <Grid item alignContent="center">
                                <Button
                                    onClick={this.handleUpdateAddress.bind(this)}
                                    style={{ backgroundColor: "#172349", color: "#fff", width: "100%", padding: "16px 24px" }}>
                                    {this.props.language["btn-submit"]}
                                </Button>
                            </Grid>
                            <Modal aria-labelledby="passphrase-hint" open={this.state.alertDialogShown} onClose={this.hideAlertDialog.bind(this)}>
                                <div style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", position: "absolute" }}>
                                    <Paper style={{ padding: 10 }}>
                                        <Typography gutterBottom align="center">
                                            {this.props.language["common-advanced-options-hint1"]}
                                        </Typography>
                                        <Typography align="center">
                                            {this.props.language["common-advanced-options-hint2"]}
                                        </Typography>
                                    </Paper>
                                </div>
                            </Modal>

                            <Dialog aria-labelledby="simple_dialog_title" open={this.state.successDialog}>
                                <DialogTitle>{this.props.language["help-notification"]}</DialogTitle>
                                <div >
                                    <Paper style={{ padding: 10 }}>
                                        <Typography gutterBottom align="center">
                                            {this.props.language["claim-success"]}
                                        </Typography>
                                        <Link to={"/wallet/" + this.props.wallet.name}>
                                            <Button
                                                style={{ backgroundColor: "#172349", color: "#fff", width: "100%", padding: "16px 24px" }}>
                                                {this.props.language["btn-finish"]}
                                            </Button>
                                        </Link>
                                    </Paper>
                                </div>
                            </Dialog>
                        </Grid>
                    </Grid>
                }

            </div >
        )
    }

    public async handleLogin(event: any) {
        let data: any
        if (this.state.email === "" || this.validateEmail(this.state.email) === false) {
            alert(this.props.language["alert-invalid-email"])
            return
        } else if (this.state.password === "") {
            alert(this.props.language["alert-enter-password"])
            return
        } else if (this.state.pin === "") {
            data = {
                email: this.state.email,
                password: this.state.password,
            }
        } else {
            data = {
                email: this.state.email,
                password: this.state.password,
                tfa_token: this.state.pin,
            }
        }
        const response = await this.props.rest.login(data)

        if (response === undefined) {
            console.log("response undefined")
        } else {
            console.log(response)
            switch (response.status) {
                case 305:
                    alert(this.props.language["alert-claim-fail"]) // this.setState({ claimErr: true })
                    break
                case 302:
                    alert(this.props.language["alert-invalid-2fa"]) // this.setState({ tfaError: true })
                    break
                case 201:
                    console.log("Need 2FA") // this.setState({ tfaShow: true }) this.setState({ errorMsg: false })
                    break
                case 200:
                    this.setState({ loggedIn: true })
                    this.setState({ token: response.token }) // this.setState({ errorMsg: false })
                    break
                default:
                    alert(this.props.language["alert-cannot-find-account"])
                // this.setState({ errorMsg: true })
            }
        }

    }

    public async handleUpdateAddress(event: any) {
        if (!(await this.handleMnemonic())) {
            console.log("error handleMnemonic")
            return
        }

        const response = await this.updateAddress()
        switch (response.status) {
            case 301:
                console.log("error 301")
                break
            case 300:
                console.log("error 301")
                break
            case 200:
                console.log("success")
                this.setState({ success: true, successDialog: true})
                break
        }
    }

    public async handleMnemonic(): Promise<boolean> {
        const meta: IHyconWallet = {
            mnemonic: this.state.reconfirmMnemonic,
            language: this.state.mnemonicLanguage,
            passphrase: this.state.passphrase,
        }
        const wallet = await this.state.rest.createNewWallet(meta)

        return (wallet.address === this.props.wallet.address)
    }
    private handleAdvancedOption = (name: any) => (event: any) => {
        this.setState({ [name]: event.target.checked })
    }
    private handleChange = (prop: any) => (event: any) => {
        this.setState({ [prop]: event.target.value })
    }
    private onClickHint() {
        this.setState({ alertDialogShown: true })
    }
    private hideAlertDialog() {
        this.setState({ alertDialogShown: false })
    }

    private handleMouseDownPassword = (event: any) => {
        event.preventDefault()
    }

    private handleClickShowPassword = () => {
        this.setState((state: any) => ({ showPassword: !this.state.showPassword }))
    }

    private showTFA = () => {
        this.setState((state: any) => ({ showTFA: !state.checked }))
    }

    private async updateAddress(): Promise<any> {
        try {
            const formData = new FormData()
            formData.append("action", "hycAddrUpdate")
            formData.append("addr", this.props.wallet.address)
            formData.append("token", this.state.token)

            const headers = new Headers()
            headers.append("Accept", "application/json")
            const res = await fetch(`https://wallet.hycon.io/ajax.php`, {
                body: formData,
                headers,
                method: "POST",
            })
            return res.json()
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.log(e)
        }
    }

    private validateEmail(email: string) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        console.log("email matched requirements : " + re.test(email))
        return re.test(email)
    }
}
