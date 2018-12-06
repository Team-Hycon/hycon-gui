import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import Typography from "@material-ui/core/Typography"
import * as React from "react"
import { IText } from "../locales/m_locales"

// tslint:disable:no-var-requires
import Linkify from "react-linkify"

interface IProps {
    language: IText
}

export class PrivacyPolicyContent extends React.Component<IProps, any> {
    constructor(props: IProps) {
        super(props)
    }

    public render() {
        return (
            <DialogContent><DialogContentText>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    <Linkify>{this.props.language["privacy-policy-intro"]}</Linkify>
                </Typography>
                <br />
                <Typography variant="button" gutterBottom>{this.props.language["privacy-policy-log-data"]}</Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["privacy-policy-log-data-content"]}
                </Typography>
                <br />
                <Typography variant="button" gutterBottom>{this.props.language["privacy-policy-cookies"]}</Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["privacy-policy-cookies-content1"]}
                </Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["privacy-policy-cookies-content2"]}
                </Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    <Linkify>{this.props.language["privacy-policy-cookies-purpose1"]}</Linkify>
                </Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["privacy-policy-cookies-purpose2"]}
                </Typography>
                <br />
                <Typography variant="button" gutterBottom>{this.props.language["privacy-policy-ga"]}</Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["privacy-policy-ga-content1"]}
                </Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["privacy-policy-ga-content2"]}
                </Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    <Linkify>{this.props.language["privacy-policy-ga-content3"]}</Linkify>
                </Typography>
                <br />
                <Typography variant="button" gutterBottom>{this.props.language["privacy-policy-changes"]}</Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["privacy-policy-changes-content"]}
                </Typography>
                <br />
                <Typography style={{ textAlign: "right", fontSize: 8 }} variant="caption" gutterBottom>
                    {this.props.language["privacy-policy-revision-date"]}
                </Typography>
            </DialogContentText></DialogContent>
        )
    }
}
