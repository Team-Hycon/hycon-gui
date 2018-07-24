import { DialogTitle, Grid, Input } from "@material-ui/core"
import Icon from "@material-ui/core/Icon"
import { Avatar, IconButton, List, ListItem } from "material-ui"
import * as React from "react"
import update = require("react-addons-update")

export class AddressBook extends React.Component<any, any> {
    public mounted = false

    constructor(props: any) {
        super(props)

        this.state = {
            address: "",
            alias: "",
            clickCallback: props.callback,
            favorites: props.favorites,
            isWalletView: props.isWalletView,
            rest: props.rest,
        }
        this.handleInputChange = this.handleInputChange.bind(this)
    }
    public componentWillUnmount() {
        this.mounted = false
    }
    public componentDidMount() {
        this.mounted = true
    }

    public handleInputChange(event: any) {
        const name = event.target.name
        const value = event.target.value
        this.setState({ [name]: value })
    }
    public render() {
        return (
            <div style={{ textAlign: "center" }}>
                <DialogTitle id="simple-dialog-title" style={{ textAlign: "center" }}><span style={{ display: "inline-flex" }}><Icon style={{ color: "grey", fontSize: "larger", marginRight: "5px" }}>bookmark</Icon>{this.props.language["address-book"]}</span></DialogTitle>
                {(this.state.favorites.length === 0) ? (<h5 style={{ color: "grey" }}> {this.props.language["address-empty"]} </h5>) : null}
                <List style={{ width: "32em" }}>
                    {(this.state.isWalletView) ?
                        (<div>
                            {this.state.favorites.map((favorite: { alias: string, address: string }, idx: number) => (
                                <ListItem
                                    style={{ textAlign: "left", width: "26em", backgroundColor: "white", margin: "auto" }}
                                    leftAvatar={<Avatar icon={<Icon>account_balance_wallet</Icon>} />}
                                    primaryText={favorite.alias}
                                    secondaryText={favorite.address}
                                    key={idx}
                                    rightIconButton={<IconButton iconStyle={{ color: "grey" }} onClick={() => { this.handleListItemClick(favorite, idx) }}><Icon>clear</Icon></IconButton>}
                                />
                            ))}
                            {(this.state.isAdd ?
                                (<div>
                                    <div style={{ display: "flex", textAlign: "left", paddingLeft: "7.4%", paddingTop: "3%" }}>
                                        <Avatar icon={<Icon style={{ color: "white" }}>fiber_new</Icon>} />
                                        <span style={{ display: "-webkit-inline-box", paddingLeft: "3.5%", width: "25em" }}>
                                            <Input style={{ width: "20em", height: "1.3em" }} name="alias" placeholder={this.props.language["wallet-name"]} inputProps={{ "aria-label": "Description" }} value={this.state.alias} onChange={this.handleInputChange} /><br />
                                            <Input style={{ width: "20em", height: "1.3em" }} name="address" placeholder={this.props.language["address-placeholder"]} inputProps={{ "aria-label": "Description" }} value={this.state.address} onChange={this.handleInputChange} />
                                        </span>
                                    </div><br />
                                    <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                                        <IconButton iconStyle={{ textAlign: "center", color: "grey", borderRadius: "50%", backgroundColor: "lightgrey" }} onClick={() => { this.addFavorite() }}><Icon>check</Icon></IconButton><br />
                                    </Grid>
                                </div>) :
                                (<div>
                                    <Grid container direction={"row"} justify={"center"} alignItems={"center"}>
                                        <IconButton iconStyle={{ textAlign: "center", color: "grey", borderRadius: "50%", backgroundColor: "lightgrey" }} onClick={() => { this.addAddress() }}><Icon>add</Icon></IconButton><br />
                                    </Grid>
                                </div>))}

                        </div>) :
                        (<div>
                            {this.state.favorites.map((favorite: { alias: string, address: string }) => (
                                <ListItem
                                    style={{ textAlign: "left", width: "23em", margin: "auto" }}
                                    leftAvatar={<Avatar icon={<Icon>account_balance_wallet</Icon>} />}
                                    primaryText={favorite.alias}
                                    secondaryText={favorite.address}
                                    key={favorite.alias}
                                    onClick={() => { this.state.clickCallback(favorite.address) }}
                                />
                            ))}<br />
                        </div>)}
                </List>
            </div>
        )
    }

    private addAddress() {
        this.setState({ isAdd: true, alias: "", address: "" })
    }

    private addFavorite() {
        if (this.state.alias === "" || this.state.address === "") {
            alert(`${this.props.language["alert-address-field-empty"]}`)
            return
        }
        this.state.rest.addFavorite(this.state.alias, this.state.address).then((data: boolean) => {
            const alias = this.state.alias
            const address = this.state.address
            if (data) {
                alert(`${this.props.language["alert-add-sucess"]}`)
                this.setState({
                    address: "",
                    alias: "",
                    favorites: update(this.state.favorites, { $push: [{ alias, address }] }),
                    isAdd: false,
                })
            } else {
                alert(`${this.props.language["alert-add-failed"]}`)
            }
        })
    }

    private handleListItemClick(element: { alias: string, address: string }, idx: number) {
        if (confirm(`${this.props.language["alert-delete-address"]}`)) {
            this.state.rest.deleteFavorite(element.alias).then((res: boolean) => {
                res ? alert(`${this.props.language["alert-delete-success"]}`) : alert(`${this.props.language["alert-delete-failed"]}`)
                this.setState({
                    favorites: update(this.state.favorites, { $splice: [[idx, 1]] }),
                    isAdd: false,
                })
            })
        }
    }
}
