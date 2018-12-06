import { createStyles } from "@material-ui/core"
import AppBar from "@material-ui/core/AppBar"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import IconButton from "@material-ui/core/IconButton"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import ListSubheader from "@material-ui/core/ListSubheader"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
import ArrowBackIcon from "@material-ui/icons/ArrowBack"
import InfoIcon from "@material-ui/icons/Info"
import * as React from "react"
import { Link } from "react-router-dom"
import { ChangelogContent } from "./content/changelog"
import { PrivacyPolicyContent } from "./content/privacyPolicy"
import { TermsOfUseContent } from "./content/termsOfUse"
import { IText } from "./locales/m_locales"

// tslint:disable:object-literal-sort-keys
// CHECK VERSION EVERYTIME BEFORE RELEASING
const VERSION = "1.0.2"
const storage = window.localStorage

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
    listSubheader: {
        margin: "auto 0 auto 20px",
    },
})

interface ISettingsProps {
    language: IText
}

export class Settings extends React.Component<ISettingsProps, any> {
    constructor(props: ISettingsProps) {
        super(props)
        this.state = {
            dialogTermsOfUse: false,
            dialogPrivacyPolicy: false,
            dialogChangelog: false,
        }
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
                            {this.props.language["settings-title"]}
                        </Typography>
                        <div style={{ width: 48, height: 48 }} />
                    </Toolbar>
                </AppBar>
                {this.renderListSettings()}
            </div>
        )
    }

    public renderListSettings() {
        return (
            <List>
                <Grid item xs={12}>
                    <ListItem button onClick={this.handleSendInquiry} key="item-inquiry">
                        <ListItemText primary={this.props.language["settings-inquiry"]}/>
                    </ListItem>
                    <Divider />

                    <ListItem button onClick={this.handleDialogTermsOfUse} key="item-terms-of-use">
                        <ListItemText primary={this.props.language["terms-of-use"]} />
                    </ListItem>
                    <Dialog fullScreen open={this.state.dialogTermsOfUse} onClose={this.handleDialogTermsOfUse} scroll={this.state.scroll}>
                        <DialogTitle><Typography variant="h6">{this.props.language["terms-of-use"]}</Typography></DialogTitle>
                        <TermsOfUseContent language={this.props.language} />
                        <DialogActions>
                            <Button style={{ color: "#172349" }} onClick={this.handleDialogTermsOfUse}>{this.props.language["btn-close"]}</Button>
                        </DialogActions>
                    </Dialog>
                    <Divider />

                    <ListItem button onClick={this.handleDialogPrivacyPolicy} key="item-privacy-policy">
                        <ListItemText primary={this.props.language["privacy-policy"]} />
                    </ListItem>
                    <Dialog fullScreen open={this.state.dialogPrivacyPolicy} onClose={this.handleDialogPrivacyPolicy} scroll={this.state.scroll}>
                        <DialogTitle><Typography variant="h6">{this.props.language["privacy-policy"]}</Typography></DialogTitle>
                        <PrivacyPolicyContent language={this.props.language} />
                        <DialogActions>
                            <Button style={{ color: "#172349" }} onClick={this.handleDialogPrivacyPolicy}>{this.props.language["btn-close"]}</Button>
                        </DialogActions>
                    </Dialog>
                    <Divider />

                    <ListItem button onClick={this.handleDialogChangelog} key="item-app-version">
                        <ListItemText primary={this.props.language["settings-app-version"]} secondary={VERSION} />
                        {storage.getItem("seenChangelog") !== VERSION ?
                            <ListItemSecondaryAction>
                                <IconButton disableRipple onClick={this.handleDialogChangelog} aria-label="Info">
                                    <InfoIcon style={{ color: "#2195a0" }}/>
                                </IconButton>
                            </ListItemSecondaryAction> : ""
                        }
                    </ListItem>
                    <Dialog fullScreen open={this.state.dialogChangelog} onClose={this.handleDialogChangelog} scroll={this.state.scroll}>
                        <DialogTitle><Typography variant="h6">{this.props.language["changelog-whats-new"]}</Typography></DialogTitle>
                        <ChangelogContent language={this.props.language} />
                        <DialogActions>
                            <Button style={{ color: "#172349" }} onClick={this.handleDialogChangelog}>{this.props.language["btn-close"]}</Button>
                        </DialogActions>
                    </Dialog>
                    <Divider />

                    <ListItem key="item-copyright">
                        <ListItemText primary={this.props.language["settings-copyright"]} secondary={this.props.language["settings-copyright-hycon"]} />
                    </ListItem>
                    <Divider />
                </Grid>
            </List>
        )
    }

    private handleDialogTermsOfUse = () => {
        this.setState({ dialogTermsOfUse: !this.state.dialogTermsOfUse })
    }

    private handleDialogPrivacyPolicy = () => {
        this.setState({ dialogPrivacyPolicy: !this.state.dialogPrivacyPolicy })
    }

    private handleDialogChangelog = () => {
        this.setState({ dialogChangelog: !this.state.dialogChangelog })
        storage.setItem("seenChangelog", VERSION)
    }

    private handleSendInquiry = () => {
        window.plugins.socialsharing.shareViaEmail(
            "\n\n\n\n\n\n" + window.navigator.appVersion ,
            this.props.language["settings-inquiry"],
            ["support@hycon.io"],
            null,
            null,
            null,
            (result) => { },
            (msg) => { },
        )
    }
}
