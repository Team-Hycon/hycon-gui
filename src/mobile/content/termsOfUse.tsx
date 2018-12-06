import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import Typography from "@material-ui/core/Typography"
import * as React from "react"
import { IText } from "../locales/m_locales"

interface IProps {
    language: IText
}

export class TermsOfUseContent extends React.Component<IProps, any> {
    constructor(props: IProps) {
        super(props)
    }

    public render() {
        return (
            <DialogContent><DialogContentText>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["terms-of-use-text1"]}
                </Typography>
                <br />
                <Typography variant="button" gutterBottom>{this.props.language["terms-of-use-subtitle1"]}</Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["terms-of-use-text2"]}
                </Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["terms-of-use-text3"]}
                </Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["terms-of-use-text4"]}
                </Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["terms-of-use-text5"]}
                </Typography>
                <br />
                <Typography variant="button" gutterBottom>{this.props.language["terms-of-use-subtitle2"]}</Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["terms-of-use-text6"]}
                </Typography>
                <br />
                <Typography variant="button" gutterBottom>{this.props.language["terms-of-use-subtitle3"]}</Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["terms-of-use-text7"]}
                </Typography>
                <br />
                <Typography variant="button" gutterBottom>{this.props.language["terms-of-use-subtitle4"]}</Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["terms-of-use-text8"]}
                </Typography>
                <br />
                <Typography variant="button" gutterBottom>{this.props.language["terms-of-use-subtitle5"]}</Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["terms-of-use-text9"]}
                </Typography>
                <br />
                <Typography style={{ textAlign: "right", fontSize: 8 }} variant="caption" gutterBottom>
                    {this.props.language["terms-of-use-revision-date"]}
                </Typography>
            </DialogContentText></DialogContent>
        )
    }
}
