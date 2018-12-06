import { TextField } from "material-ui"
import * as tfa from "node-2fa"
import * as React from "react"
import { RouteComponentProps } from "react-router"
import { RouteConfig } from "react-router-config"
import { Link, Route, Switch } from "react-router-dom"
import { Button, Dialog, DialogTitle, Drawer, FormControl, FormControlLabel, FormLabel, Grid, Icon, IconButton, ListItemIcon, ListItemText, MenuItem, Radio, RadioGroup, Select } from "../node_modules/@material-ui/core"
import { AddressBook } from "./desktop/addressBook"
import { AddressInfo } from "./desktop/addressInfo"
import { AddWallet } from "./desktop/addWallet"
import { HardwareWalletView } from "./desktop/hardwareWalletView"
import { Home } from "./desktop/home"
import { MakeTransaction } from "./desktop/makeTransaction"
import { RecoverWallet } from "./desktop/recoverWallet"
import { Transaction } from "./desktop/transaction"
import { TxView } from "./desktop/txView"
import { WalletDetail } from "./desktop/walletDetail"
import { WalletView } from "./desktop/walletView"
import { getLocale, IText } from "./locales/locales"
import { IRest } from "./rest"

export const routes: RouteConfig[] = [
    { exact: true, path: "/" },
    { exact: true, path: "/tx/:hash" },
    { exact: true, path: "/address/:hash" },
    { exact: true, path: "/wallet" },
    { exact: true, path: "/wallet/addWallet" },
    { exact: true, path: "/wallet/recoverWallet" },
    { exact: true, path: "/wallet/detail/:name" },
    { exact: true, path: "/transaction/:name" },
    { exact: true, path: "/transaction/:name/:nonce" },
    { exact: true, path: "/maketransaction/:walletType" },
    { exact: true, path: "/maketransactionIndex/:walletType/:selectedAccount" },
    { exact: true, path: "/maketransactionIndex/:walletType/:selectedAccount/:nonce" },
    { exact: true, path: "/maketransactionAddress/:walletType/:address/:selectedAccount" },
    { exact: true, path: "/maketransactionAddress/:walletType/:address/:selectedAccount/:nonce" },
    { exact: true, path: "/maketransactionHDWallet/:walletType/:name/:address/:selectedAccount" },
    { exact: true, path: "/maketransactionHDWallet/:walletType/:name/:address/:selectedAccount/:nonce" },
    { exact: true, path: "/hardwareWallet/:walletType" },
    { exact: true, path: "/address/:hash/:walletType/:selectedAccount" },
    { exact: true, path: "/address/:hash/:walletType/:name/:selectedAccount" },
]

// tslint:disable:no-shadowed-variable
export class LiteClient extends React.Component<any, any> {
    public mounted: boolean = false
    public rest: IRest
    public language: IText
    public home: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public addressInfo: (
        { match }: RouteComponentProps<{ hash: string }>,
    ) => JSX.Element
    public txView: ({ match }: RouteComponentProps<{ hash: string }>) => JSX.Element
    public transaction: ({ match }: RouteComponentProps<{ name: string, nonce: number }>) => JSX.Element
    public maketransaction: ({ match }: RouteComponentProps<{ walletType: string, nonce: number }>) => JSX.Element
    public maketransactionIndex: ({ match }: RouteComponentProps<{ walletType: string, address: string, selectedAccount: string, nonce: number }>) => JSX.Element
    public maketransactionHDWallet: ({ match }: RouteComponentProps<{ walletType: string, name: string, address: string, selectedAccount: string, nonce: number }>) => JSX.Element
    public wallet: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public addWallet: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public recoverWallet: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public walletDetail: ({ match }: RouteComponentProps<{ name: string }>) => JSX.Element
    public hardwareWalletView: ({ match }: RouteComponentProps<{ walletType: string }>) => JSX.Element
    public hardwareAddressView: ({ match }: RouteComponentProps<{ walletType: string, hash: string, selectedAccount: string }>) => JSX.Element
    public hdwalletAddressView: ({ match }: RouteComponentProps<{ walletType: string, hash: string, name: string, selectedAccount: string }>) => JSX.Element
    public notFound: boolean

    constructor(props: any) {
        super(props)
        this.state = {
            address: "",
            alias: "",
            dialogAddrBook: false,
            dialogLedger: false,
            dialogTOTP: false,
            errorText: "",
            errorText2: "",
            favorites: [],
            hardwareDialog: false,
            hardwareWalletType: "",
            languageSelect: navigator.language.split("-")[0],
            ledgerAddress: "",
            load: false,
            loading: false,
            possibilityLedger: false,
            price: "",
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
        this.rest = props.rest
        this.language = getLocale(navigator.language)
        this.rest.loadingListener((loading: boolean) => {
            this.state = ({ loading })
        })
        this.home = ({ match }: RouteComponentProps<{}>) => (
            <Home rest={props.rest} />
        )
        this.addressInfo = ({ match }: RouteComponentProps<{ hash: string }>) => (
            <AddressInfo hash={match.params.hash} rest={this.rest} language={this.language} />
        )
        this.txView = ({ match }: RouteComponentProps<{ hash: string }>) => (
            <TxView hash={match.params.hash} rest={this.rest} />
        )
        this.transaction = ({ match }: RouteComponentProps<{ name: string, nonce: number }>) => (
            <Transaction name={match.params.name} rest={this.rest} language={this.language} nonce={match.params.nonce} />
        )
        this.maketransaction = ({ match }: RouteComponentProps<{ walletType: string, nonce: number }>) => (
            <MakeTransaction walletType={match.params.walletType} rest={this.rest} nonce={match.params.nonce} language={this.language} />
        )
        this.maketransactionIndex = ({ match }: RouteComponentProps<{ walletType: string, address: string, selectedAccount: string, nonce: number }>) => (
            <MakeTransaction walletType={match.params.walletType} rest={this.rest} address={match.params.address} selectedAccount={match.params.selectedAccount} nonce={match.params.nonce} language={this.language} />
        )
        this.maketransactionHDWallet = ({ match }: RouteComponentProps<{ walletType: string, name: string, address: string, selectedAccount: string, nonce: number }>) => (
            <MakeTransaction rest={this.rest} walletType={match.params.walletType} name={match.params.name} address={match.params.address} selectedAccount={match.params.selectedAccount} nonce={match.params.nonce} language={this.language} />
        )
        this.wallet = ({ match }: RouteComponentProps<{}>) => (
            <WalletView rest={props.rest} language={this.language} />
        )
        this.addWallet = ({ match }: RouteComponentProps<{}>) => (
            <AddWallet rest={props.rest} language={this.language} />
        )
        this.recoverWallet = ({ match }: RouteComponentProps<{}>) => (
            <RecoverWallet rest={props.rest} language={this.language} />
        )
        this.walletDetail = ({ match }: RouteComponentProps<{ name: string }>) => (
            <WalletDetail name={match.params.name} rest={this.rest} language={this.language} notFound={this.notFound} price={this.state.price} />
        )
        this.hardwareWalletView = ({ match }: RouteComponentProps<{ walletType: string }>) => (
            <HardwareWalletView rest={this.rest} walletType={match.params.walletType} />
        )
        this.hardwareAddressView = ({ match }: RouteComponentProps<{ walletType: string, hash: string, selectedAccount: string }>) => (
            <AddressInfo hash={match.params.hash} walletType={match.params.walletType} rest={this.rest} selectedAccount={match.params.selectedAccount} language={this.language} price={this.state.price} />
        )

        this.hdwalletAddressView = ({ match }: RouteComponentProps<{ walletType: string, hash: string, name: string, selectedAccount: string }>) => (
            <AddressInfo hash={match.params.hash} walletType={match.params.walletType} rest={this.rest} name={match.params.name} selectedAccount={match.params.selectedAccount} language={this.language} price={this.state.price} />
        )
    }

    public componentDidMount() {
        this.mounted = true
        this.rest.possibilityLedger().then((result: boolean) => {
            this.setState({ possibilityLedger: result })
            this.getFavorite()
        })
        this.rest.getTOTP().then((result: boolean) => {
            if (result) {
                this.setState({ totp: true })
            } else {
                this.setState({ totp: false })
            }
        })

        this.rest.getPrice(this.language.currency).then((price: number) => {
            this.setState({ price })
        })
    }
    public languageChange = (event: any) => {
        this.language = getLocale(event.target.value)
        this.setState({ [event.target.name]: event.target.value })
        this.rest.getPrice(this.language.currency).then((price: number) => {
            this.setState({ price })
        })
    }

    public toggleDrawer(open: boolean) {
        this.setState({ menu: open })
    }

    public handleInputChange(event: any) {
        const name = event.target.name
        const value = event.target.value
        if (name === "alias") {
            this.setState({ alias: value })
        } else if (name === "addr") {
            this.setState({ address: value })
        } else {
            this.setState({ [name]: value })
        }
    }

    public render() {
        if (!this.state.load) {
            return null
        }
        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header">
                <header className="mdl-layout__header" >
                    <div className="mdl-layout__header-row" style={{ padding: "0 16px 0 10px" }}>
                        <div>
                            {this.state.homeUrl === location.href || this.state.homeUrl + "/" === location.href
                                ? (<div style={{ marginLeft: "4.35em" }} />)
                                : (<Icon onClick={() => { history.back() }} style={{ color: "white", float: "left", margin: "0 1em 0 0.5em", cursor: "pointer" }}>chevron_left</Icon>)}
                        </div>
                        <Link to="/wallet">
                            <img style={{ maxHeight: 40, paddingRight: 10 }} src="./hycon_logo1.png" />
                        </Link>
                        <Link to="/wallet">
                            <span className="mdl-layout-title" style={{ color: "white", fontFamily: "Source Sans Pro", fontWeight: 300 }}>Lite Wallet</span>
                        </Link>
                        <div className="mdl-layout-spacer" />
                        <nav className="mdl-navigation">
                            <FormControl>
                                <Select
                                    value={this.state.languageSelect}
                                    onChange={this.languageChange.bind(event)}
                                    inputProps={{
                                        id: "lang_select",
                                        name: "languageSelect",
                                    }}
                                    style={{ color: "#FFF", cursor: "pointer" }}
                                    autoWidth
                                >
                                    <MenuItem value={"en"}>English</MenuItem>
                                    <MenuItem value={"ko"}>한국어</MenuItem>
                                    <MenuItem value={"zh-cn"}>中文 (简体)</MenuItem>
                                    <MenuItem value={"zh-hk"}>中文 (正體)</MenuItem>
                                    <MenuItem value={"vi"}>Tiếng Việt</MenuItem>
                                    <MenuItem value={"ru"}>ру́сский язы́к</MenuItem>
                                    <MenuItem value={"mn"}>Монгол</MenuItem>
                                    <MenuItem value={"ja"}>日本語</MenuItem>
                                </Select>
                            </FormControl>
                            <IconButton onClick={() => { this.toggleDrawer(true) }}><Icon style={{ color: "white" }}>menu</Icon></IconButton>
                            <Drawer anchor="right" open={this.state.menu} onClose={() => { this.toggleDrawer(false) }}>
                                <div
                                    tabIndex={0}
                                    role="button"
                                    onClick={() => { this.toggleDrawer(false) }}
                                    onKeyDown={() => { this.toggleDrawer(false) }}
                                >
                                    <div style={{ width: "22em" }} >
                                        <Link style={{ width: "22em" }} to="/wallet/addWallet"><MenuItem>
                                            <ListItemIcon><Icon>note_add</Icon></ListItemIcon>
                                            <ListItemText primary={this.language["add-wallet"]} /></MenuItem></Link>
                                        <Link style={{ width: "22em" }} to="/wallet/recoverWallet"><MenuItem>
                                            <ListItemIcon><Icon>input</Icon></ListItemIcon>
                                            <ListItemText primary={this.language["recover-wallet"]} /></MenuItem></Link>
                                        <MenuItem onClick={() => { this.setState({ dialogAddrBook: true }) }}>
                                            <ListItemIcon><Icon>bookmark</Icon></ListItemIcon>
                                            <ListItemText primary={this.language["address-book"]} /></MenuItem>
                                        <MenuItem onClick={() => { this.generateTOTP() }}>
                                            <ListItemIcon><Icon>vpn_key</Icon></ListItemIcon>
                                            <ListItemText primary={this.language.totp} /></MenuItem>
                                        {(this.state.possibilityLedger ? (
                                            <MenuItem onClick={() => { this.setState({ dialogLedger: true }) }}>
                                                <ListItemIcon><Icon>send</Icon></ListItemIcon>
                                                <ListItemText primary={this.language["button-transfer"]} /></MenuItem>
                                        ) : null)}
                                        {(this.state.possibilityLedger ? (
                                            <MenuItem onClick={() => { this.setState({ hardwareDialog: true }) }}>
                                                <ListItemIcon><Icon>account_balance_wallet</Icon></ListItemIcon>
                                                <ListItemText primary={this.language["hardwarewallet-view"]} /></MenuItem>
                                        ) : null)}
                                    </div>
                                </div>
                            </Drawer>
                        </nav>
                    </div>
                    <div className={`mdl-progress mdl-js-progress mdl-progress__indeterminate progressBar ${this.state.loading ? "" : "hide"}`} />
                </header>
                <main className="mdl-layout__content main">
                    <div className="page-content">
                        <Switch>
                            <Route exact path="/" component={this.wallet} />
                            <Route exact path="/tx/:hash" component={this.txView} />
                            <Route exact path="/address/:hash" component={this.addressInfo} />
                            <Route exact path="/transaction/:name" component={this.transaction} /> {/* send tx */}
                            <Route exact path="/transaction/:name/:nonce" component={this.transaction} /> {/* send tx */}
                            <Route exact path="/maketransaction/:walletType" component={this.maketransaction} />
                            <Route exact path="/maketransactionIndex/:walletType/:selectedAccount" component={this.maketransactionIndex} />
                            <Route exact path="/maketransactionIndex/:walletType/:selectedAccount/:nonce" component={this.maketransactionIndex} />
                            <Route exact path="/maketransactionAddress/:walletType/:address/:selectedAccount" component={this.maketransactionIndex} />
                            <Route exact path="/maketransactionAddress/:walletType/:address/:selectedAccount/:nonce" component={this.maketransactionIndex} />
                            <Route exact path="/maketransactionHDwallet/:walletType/:name/:address/:selectedAccount" component={this.maketransactionHDWallet} />
                            <Route exact path="/maketransactionHDwallet/:walletType/:name/:address/:selectedAccount/:nonce" component={this.maketransactionHDWallet} />
                            <Route exact path="/wallet/addWallet" component={this.addWallet} />
                            <Route exact path="/wallet" component={this.wallet} />
                            <Route exact path="/wallet/recoverWallet" component={this.recoverWallet} />
                            <Route exact path="/wallet/detail/:name" component={this.walletDetail} />
                            <Route exact path="/hardwareWallet/:walletType" component={this.hardwareWalletView} />
                            <Route exact path="/address/:hash/:walletType/:selectedAccount" component={this.hardwareAddressView} />
                            <Route exact path="/address/:hash/:walletType/:name/:selectedAccount" component={this.hdwalletAddressView} />
                        </Switch>
                    </div>
                </main>

                {/* ADDRESS BOOK */}
                <Dialog open={this.state.dialogAddrBook} onClose={() => { this.closeAddressBook() }}>
                    <AddressBook rest={this.rest} favorites={this.state.favorites} isWalletView={true} language={this.language} />
                </Dialog>

                {/* ENABLE TRANSACTION OTP */}
                <Dialog style={{ textAlign: "center" }} open={!this.state.totp && this.state.dialogTOTP} onClose={() => { this.setState({ dialogTOTP: false }) }}>
                    <DialogTitle id="simple-dialog-title">{this.language["enable-totp"]}</DialogTitle>
                    <div style={{ margin: "2em" }}>
                        <p>{this.language["enable-totp-tip1"]}<p></p><strong>{this.language["enable-totp-tip2"]}</strong></p>
                        <img src={this.state.totpQr} height="200" width="200" color="#084b8a" /><br /><br />
                        <p>{this.language["enable-totp-tip3"]}</p>
                        <span style={{ backgroundColor: "#f2d260" }}>{this.state.totpSecret}</span><br /><br />
                        <TextField floatingLabelText={this.language["totp-google-code"]} autoComplete="off"
                            errorText={this.state.errorText} errorStyle={{ float: "left" }}
                            value={this.state.totpToken}
                            onChange={(data) => { this.handleTOTP(data) }} /><br /><br />
                        <span style={{ display: "inline-flex" }}>
                            <TextField style={{ marginRight: "3%" }} floatingLabelText={this.language["totp-otp-password"]} floatingLabelFixed={true} type="password" autoComplete="off"
                                value={this.state.totpPw1}
                                onChange={(data) => { this.handleTOTPpassword(data) }} />
                            <TextField floatingLabelText={this.language["totp-confirm-otp-password"]} floatingLabelFixed={true} type="password" autoComplete="off"
                                errorText={this.state.errorText2} errorStyle={{ float: "left" }}
                                value={this.state.totpPw2}
                                onChange={(data) => { this.handleConfirmTOTPpassword(data) }} />
                        </span><br /><br />
                        <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                            <Button variant="raised" onClick={() => { this.setState({ dialogTOTP: false }) }} style={{ backgroundColor: "rgb(225, 0, 80)", color: "white" }}>{this.language["button-cancel"]}</Button>
                            <Button variant="raised" onClick={() => { this.enableTOTP() }} style={{ backgroundColor: "#50aaff", color: "white", margin: "0 10px" }}>{this.language["button-submit"]}</Button>
                        </Grid>
                    </div>
                </Dialog>

                {/* DISABLE TRANSACTION OTP */}
                <Dialog style={{ textAlign: "center" }} open={this.state.totp && this.state.dialogTOTP} onClose={() => { this.setState({ dialogTOTP: false }) }}>
                    <DialogTitle id="simple-dialog-title" >{this.language["disable-totp"]}</DialogTitle>
                    <div style={{ margin: "2em" }}>
                        <p>{this.language["disable-totp-tip1"]}</p>
                        <p style={{ fontSize: "0.8em", color: "#bc3309" }}>{this.language["disable-totp-tip2"]}<br />{this.language["disable-totp-tip3"]}</p>
                        <TextField floatingLabelText={this.language["totp-otp-password"]} type="password" autoComplete="off"
                            value={this.state.totpPw1}
                            onChange={(data) => { this.handleTOTPpassword(data) }} /><br /><br />
                        <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                            <Button variant="raised" onClick={() => { this.setState({ dialogTOTP: false }) }} style={{ backgroundColor: "rgb(225, 0, 80)", color: "white" }}>{this.language["button-cancel"]}</Button>
                            <Button variant="raised" onClick={() => { this.disableTOTP() }} style={{ backgroundColor: "#50aaff", color: "white", margin: "0 10px" }}>{this.language["button-submit"]}</Button>
                        </Grid>
                    </div>
                </Dialog>

                {/* LEDGER - Transfer type select view */}
                <Dialog open={this.state.dialogLedger} style={{ textAlign: "center" }} onClose={() => { this.setState({ dialogLedger: false }) }}>
                    <h4 style={{ color: "grey" }}><Icon style={{ color: "grey", marginRight: "10px" }}>send</Icon>{this.language["send-transaction"]}</h4>
                    <div style={{ width: "32em" }}>
                        <FormLabel component="legend">>{this.language["wallet-type-select"]}</FormLabel>
                        <RadioGroup style={{ width: "70%", margin: "auto" }} aria-label="walletType" name="walletType" value={this.state.walletType} onChange={(data) => { this.handleInputChange(data) }}>
                            <FormControlLabel value="local" control={<Radio />} label={this.language["local-wallet"]} />
                            <FormControlLabel value="ledger" control={<Radio />} label={this.language["Hardware-wallet"]} />
                            <FormControlLabel value="bitbox" control={<Radio />} label="Digital Bitbox" />
                        </RadioGroup>
                    </div>
                    <Link to={`/maketransaction/${this.state.walletType}`}><Button onClick={() => { this.setState({ dialogLedger: false }) }}>{this.language["button-next"]}</Button></Link>
                </Dialog>

                {/* SELECT HARDWARE WALLET */}
                <Dialog open={this.state.hardwareDialog} onClose={() => { this.setState({ hardwareDialog: false }) }}>
                    <DialogTitle id="simple-dialog-title" style={{ textAlign: "center" }}><Icon style={{ marginRight: "10px", color: "grey" }}>account_balance_wallet</Icon>HARDWARE WALLET</DialogTitle>
                    <div style={{ textAlign: "center" }}>
                        <FormLabel component="legend">Select wallet to use.</FormLabel>
                        <RadioGroup style={{ width: "70%", margin: "auto" }} aria-label="hardwareWalletType" name="hardwareWalletType" value={this.state.hardwareWalletType} onChange={(data) => { this.handleInputChange(data) }}>
                            <FormControlLabel value="ledger" control={<Radio />} label="Ledger" />
                            <FormControlLabel value="bitbox" control={<Radio />} label="Digital Bitbox" />
                        </RadioGroup>
                    </div><br />
                    <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                        <Link to={`/hardwareWallet/${this.state.hardwareWalletType}`}>
                            <Button variant="outlined" onClick={() => { this.setState({ hardwareDialog: false }) }} style={{ margin: "0 10px" }}>Select</Button>
                        </Link>
                    </Grid><br />
                </Dialog>
            </div >
        )
    }
    private closeAddressBook() {
        this.getFavorite()
        this.setState({ dialogAddrBook: false })
    }

    private getFavorite() {
        this.rest.setLoading(true)
        this.rest.getFavoriteList().then((data: Array<{ alias: string, address: string }>) => {
            this.rest.setLoading(false)
            if (this.mounted) {
                this.setState({ favorites: data, load: true })
            }
        })
    }
    private handleTOTP(data: any) {
        const patternSixDigits = /^[0-9]{6}$/
        this.setState({ totpToken: data.target.value })
        if (!patternSixDigits.test(data.target.value)) {
            this.setState({ errorText: this.language["alert-six-digit"] })
        } else {
            this.setState({ errorText: "" })
        }
    }
    private handleTOTPpassword(data: any) {
        if (this.state.totpPw2 !== "") {
            if (data.target.value === this.state.totpPw2) {
                this.setState({ errorText2: "" })
            } else {
                this.setState({ errorText2: this.language["password-not-matched"] })
            }
        } else if (data.target.value === "") {
            if (data.target.value === this.state.totpPw2) { this.setState({ errorText2: "" }) }
        }
        this.setState({ totpPw1: data.target.value })
    }
    private handleConfirmTOTPpassword(data: any) {
        if (this.state.totpPw1 !== "") {
            if (data.target.value === this.state.totpPw1) {
                this.setState({ errorText2: "" })
            } else {
                this.setState({ errorText2: this.language["password-not-matched"] })
            }
        } else if (data.target.value === "") {
            if (data.target.value === this.state.totpPw1) { this.setState({ errorText2: "" }) }
        }
        this.setState({ totpPw2: data.target.value })
    }
    private async enableTOTP() {
        const res = await this.rest.verifyTOTP(this.state.totpToken, this.state.totpPw1, this.state.totpSecret)
        if (!res) {
            alert(this.language["alert-invalid-google-code"])
        } else if (this.state.totpPw1 !== this.state.totpPw2) {
            alert(this.language["password-not-matched"])
        } else {
            const result = await this.rest.saveTOTP(this.state.totpSecret, this.state.totpPw1)
            if (!result) {
                alert(this.language["alert-enable-totp-fail"])
            } else {
                this.setState({ totp: true, dialogTOTP: false })
                alert(this.language["alert-enable-totp-success"])
                location.reload()
            }
        }
    }
    private disableTOTP() {
        this.rest.deleteTOTP(this.state.totpPw1).then((result: { res: boolean, case?: number }) => {
            if (!result.res) {
                if (result.case === 1) {
                    alert(this.language["password-not-matched"])
                } else if (result.case === 2) {
                    alert(this.language["alert-disable-totp-delete-fail"])
                } else if (result.case === 3) {
                    alert(this.language["alert-disable-totp-fail"])
                }
            } else {
                this.setState({ totp: false, dialogTOTP: false })
                alert(this.language["alert-delete-success"])
                location.reload()
            }
        })
    }
    private generateTOTP() {
        this.setState({ dialogTOTP: true })
        const s = tfa.generateSecret({ name: "HYCON-LiteWallet", account: "TransactionOTP" })
        this.setState({ totpSecret: s.secret, totpQr: s.qr })
    }
}
