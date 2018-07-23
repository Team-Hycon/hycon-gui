import { Button, Dialog, DialogTitle, Grid, Icon } from "@material-ui/core"
import { Avatar, List, ListItem, TextField } from "material-ui"
import * as React from "react"
import { Redirect } from "react-router-dom"
import { WalletList } from "./walletList"

export class WalletView extends React.Component<any, any> {
    public mounted: boolean = false

    constructor(props: any) {
        super(props)
        this.state = {
            dialog: false,
            privateKey: undefined,
            redirect: false,
            rest: props.rest,
        }
    }

    public handleInputChange(event: any) {
        const name = event.target.name
        const value = event.target.value
        if (name === "walletName") {
            this.setState({ walletName: value })
        } else if (name === "walletPass") {
            this.setState({ walletPass: value })
        }
    }

    public addWalletPrivateKey() {
        const patternWalletName = /^[a-zA-Z0-9\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]{2,20}$/

        if (this.state.walletName === "") {
            alert(this.props.language["alert-empty-fields"])
            return
        }
        if (this.state.walletName.search(/\s/) !== -1 || !patternWalletName.test(this.state.walletName)) {
            alert(this.props.language["alert-invalid-wallet"])
            return
        }

        this.state.rest.addWalletFile(this.state.walletName, this.state.walletPass, this.state.privateKey)
            .then((result: boolean) => {
                if (result) {
                    this.setState({ dialog: false, redirect: true })
                } else {
                    alert(`${this.props.language["alert-load-address-failed"]}`)
                }
            })
            .catch((err: string) => {
                switch (err) {
                    case "name":
                        alert(this.props.language["alert-duplicate-wallet"])
                        break
                    case "address":
                        alert(this.props.language["alert-duplicate-address"])
                        break
                    case "key":
                    case "db":
                    default:
                        alert(this.props.language["alert-load-address-failed"])
                }
            })
    }

    public render() {
        if (this.state.redirect) {
            return <Redirect to={`/wallet/detail/${this.state.walletName}`} />
        }
        return (
            <div>
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

                {/* ADD PRIVATE KEY */}
                <Dialog style={{ textAlign: "center" }} open={this.state.dialog} onClose={() => { this.setState({ dialog: false }) }}>
                    <DialogTitle id="simple-dialog-title" ><span style={{ display: "inline-flex" }}><Icon style={{ marginRight: "10px", color: "grey" }}>account_balance_wallet</Icon>{this.props.language["title-add-wallet"]}</span></DialogTitle>
                    <div style={{ margin: "2em" }}>
                        <p>{this.props.language["subtitle-add-wallet"]}</p>
                        <TextField name="walletName" floatingLabelText="Name" floatingLabelFixed={true}
                            value={this.state.walletName}
                            onChange={(data) => { this.handleInputChange(data) }} /><br />
                        <TextField name="walletPass" floatingLabelText="Password" floatingLabelFixed={true} type="password" autoComplete="off"
                            value={this.state.walletPass}
                            onChange={(data) => { this.handleInputChange(data) }} /><br /><br />
                        <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                            <Button variant="raised" onClick={() => { this.setState({ dialog: false }) }} style={{ backgroundColor: "rgb(225, 0, 80)", color: "white" }}>Cancel</Button>
                            <Button variant="raised" onClick={() => { this.addWalletPrivateKey() }} style={{ backgroundColor: "#50aaff", color: "white", margin: "0 10px" }}>Save</Button>
                        </Grid>
                    </div>
                </Dialog>
            </div >
        )
    }

    private onDrop(files: any) {
        const reader = new FileReader()
        reader.onload = () => {
            this.setState({ dialog: true, privateKey: reader.result })
        }
        reader.readAsText(files[0])
    }
}
