import { Button, Card, CardContent, Checkbox, FormControl, FormControlLabel, Grid, Icon, Input, InputLabel, Select } from "@material-ui/core"
import { Dialog, IconButton, MenuItem, TextField } from "material-ui"
import * as React from "react"
import { Redirect } from "react-router"
import { encodingMnemonic } from "./stringUtil"

export class RecoverWallet extends React.Component<any, any> {
    public mounted: boolean = false

    constructor(props: any) {
        super(props)
        this.state = {
            advanced: false,
            dialog: false,
            errText1: "",
            language: "",
            languages: ["English", "Korean", "Chinese - Simplified", "Chinese - Traditional", "Japanese", "French", "Spanish", "Italian"],
            load: false,
            mnemonic: "",
            name: "",
            passphrase1: "",
            password1: "",
            password2: "",
            redirect: false,
            rest: props.rest,
            selectedOption: "English",
        }
        this.handleOptionChange = this.handleOptionChange.bind(this)
    }

    public componentDidMount() {
        this.setState({ load: true })
    }
    public handleOptionChange(option: any) {
        this.setState({ selectedOption: option.target.value })
        let opt = option.target.value
        if (opt === "Chinese - Traditional") {
            opt = "chinese_traditional"
        } else if (opt === "Chinese - Simplified") {
            opt = "chinese_simplified"
        }
        this.setState({ language: opt })
    }
    public handleMnemonic(data: any) {
        this.setState({ mnemonic: data.target.value })
    }
    public handleName(data: any) {
        this.setState({ name: data.target.value })
    }
    public handlePassword(data: any) {
        if (this.state.password2 !== "") {
            if (data.target.value === this.state.password2) {
                this.setState({ errText1: "" })
            } else { this.setState({ errText1: `${this.props.language["password-not-matched"]}` }) }
        }
        this.setState({ password1: data.target.value })
    }
    public handleConfirmPassword(data: any) {
        if (this.state.password1 !== "") {
            if (data.target.value === this.state.password1) {
                this.setState({ errText1: "" })
            } else { this.setState({ errText1: `${this.props.language["password-not-matched"]}` }) }
        }
        this.setState({ password2: data.target.value })
    }
    public handlePassphrase(data: any) {
        this.setState({ passphrase1: data.target.value })
    }
    public handleCheckbox(event: any) {
        if (event.target.checked === false) { this.setState({ passphrase1: "" }) }
        this.setState({ advanced: event.target.checked })
    }
    public recoverWallet() {
        const patternWalletName = /^[a-zA-Z0-9\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]{2,20}$/
        if (this.state.name === "") {
            alert(this.props.language["alert-empty-fields"])
            return
        }
        if (this.state.name.search(/\s/) !== -1 || !patternWalletName.test(this.state.name)) {
            alert(this.props.language["alert-invalid-wallet"])
            return
        }
        if (this.state.password1 !== this.state.password2) {
            alert(this.props.language["password-not-matched"])
            return
        }

        const mnemonic = encodingMnemonic(this.state.mnemonic)
        this.state.rest.recoverWallet({
            language: this.state.language,
            mnemonic,
            name: this.state.name,
            passphrase: this.state.passphrase1,
            password: this.state.password1,
        }).then((data: string | boolean) => {
            this.setState({ redirect: true })
        }).catch((err: string) => {
            switch (err) {
                case "bip39":
                    alert(this.props.language["bip39-not-matched"])
                    break
                case "mnemonic":
                    alert(this.props.language["alert-invalid-mnemonic"])
                    break
                case "name":
                    alert(this.props.language["alert-duplicate-wallet"])
                    break
                case "address":
                    alert(this.props.language["alert-duplicate-address"])
                    break
                default:
                    alert("unexpected error")
            }
        })
    }
    public cancelWallet() {
        this.setState({ redirect: true })
    }

    public render() {
        if (!this.state.load) {
            return null
        }
        if (this.state.redirect) {
            return <Redirect to="/wallet" />
        }
        return (
            <div style={{ textAlign: "center", width: "80%", margin: "auto" }}>
                <Card><CardContent>
                    <h3 style={{ color: "grey" }}>{this.props.language["recover-wallet"]}</h3><br />
                    <FormControl style={{ width: "256px", marginRight: "3%" }}>
                        <InputLabel htmlFor="language">{this.props.language["mnemonic-language"]}</InputLabel>
                        <Select value={this.state.selectedOption} onChange={this.handleOptionChange} input={<Input name="language" />}>
                            {this.state.languages.map((lang: string) => {
                                return (<MenuItem key={lang} value={lang}>{lang}</MenuItem>)
                            })}
                        </Select>
                    </FormControl>
                    <TextField floatingLabelText={this.props.language["mnemonic-phrase"]} floatingLabelFixed={true} autoComplete="off"
                        value={this.state.mnemonic}
                        onChange={(data) => { this.handleMnemonic(data) }}
                        onKeyPress={(event) => { if (event.key === "Enter") { event.preventDefault(); this.recoverWallet() } }}
                    /><br /><br /><br />
                    <TextField floatingLabelText={this.props.language["wallet-name"]} floatingLabelFixed={true} autoComplete="off"
                        value={this.state.name}
                        onChange={(data) => { this.handleName(data) }}
                        onKeyPress={(event) => { if (event.key === "Enter") { event.preventDefault(); this.recoverWallet() } }}
                    /><br />
                    <TextField style={{ marginRight: "3%" }} type="password" floatingLabelText={this.props.language.password} floatingLabelFixed={true} autoComplete="off" name="pw1"
                        value={this.state.password1}
                        onChange={(data) => { this.handlePassword(data) }}
                        onKeyPress={(event) => { if (event.key === "Enter") { event.preventDefault(); this.recoverWallet() } }}
                    />
                    <TextField type="password" floatingLabelText={this.props.language["password-confirm"]} floatingLabelFixed={true} autoComplete="off" name="pw2"
                        errorText={this.state.errText1} errorStyle={{ float: "left" }}
                        value={this.state.password2}
                        onChange={(data) => { this.handleConfirmPassword(data) }}
                        onKeyPress={(event) => { if (event.key === "Enter") { event.preventDefault(); this.recoverWallet() } }}
                    /><br /><br /><br />
                    <span style={{ display: "inline-flex" }}>
                        <FormControlLabel style={{ margin: "auto" }}
                            label={this.props.language["advanced-option"]}
                            control={<Checkbox color="primary" checked={this.state.advanced} onChange={(event) => this.handleCheckbox(event)} />}
                        />
                        <IconButton iconStyle={{ color: "grey", fontSize: "large" }} onClick={() => { this.setState({ dialog: true }) }}><Icon>help_outline</Icon></IconButton>
                    </span>
                    {(this.state.advanced)
                        ? (<div>
                            <TextField floatingLabelText={this.props.language["bip39-prompt"]} floatingLabelFixed={true} autoComplete="off" name="pp1"
                                value={this.state.passphrase1}
                                onChange={(data) => { this.handlePassphrase(data) }}
                                onKeyPress={(event) => { if (event.key === "Enter") { event.preventDefault(); this.recoverWallet() } }}
                            />
                        </div>)
                        : null
                    }
                    <br /><br />
                    <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                        <Button variant="raised" style={{ backgroundColor: "rgb(225, 0, 80)", color: "white", margin: "0 10px" }}
                            onClick={() => { this.cancelWallet() }}
                        >{this.props.language["button-cancel"]}</Button>
                        <Button variant="raised" style={{ backgroundColor: "#50aaff", color: "white", margin: "0 10px" }}
                            onClick={() => { this.recoverWallet() }}
                        >{this.props.language["button-recover"]}</Button>
                    </Grid>
                </CardContent></Card>

                {/* HELP - ADVANCED OPTIONS */}
                <Dialog className="dialog" open={this.state.dialog}>
                    <h3 style={{ color: "grey" }}>{this.props.language["advanced-option-tooltip-title"]}</h3>
                    <div className="mdl-dialog__content dialogContent">{this.props.language["advanced-option-tooltip3"]}</div><br />
                    <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                        <Button variant="raised" style={{ backgroundColor: "rgb(225, 0, 80)", color: "white", margin: "0 10px" }} onClick={() => { this.setState({ dialog: false }) }}>{this.props.language["button-close"]}</Button>
                    </Grid>
                </Dialog>
            </div >
        )
    }
}
