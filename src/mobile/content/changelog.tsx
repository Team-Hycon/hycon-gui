import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import Typography from "@material-ui/core/Typography"
import * as React from "react"
import { IText } from "../locales/m_locales"

interface IProps {
    language: IText
}

export class ChangelogContent extends React.Component<IProps, any> {
    constructor(props: IProps) {
        super(props)
    }

    public render() {
        return (
            <DialogContent><DialogContentText>
                <Typography style={{ textAlign: "justify", paddingBottom: 20 }} variant="caption" gutterBottom>
                    {this.props.language["changelog-102-content1"]}<br />
                    {this.props.language["changelog-102-content2"]}<br />
                    {this.props.language["changelog-102-content3"]}<br />
                    {this.props.language["changelog-102-content4"]}<br />
                    {this.props.language["changelog-102-content5"]}<br />
                    {this.props.language["changelog-102-content6"]}<br />
                    {this.props.language["changelog-102-content7"]}<br />
                    {this.props.language["changelog-102-content8"]}
                </Typography>
                <br />
                <Typography variant="overline" style={{ fontWeight: 600 }} gutterBottom>{this.props.language["changelog-101"]}</Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["changelog-101-content1"]}<br />
                    {this.props.language["changelog-101-content2"]}<br />
                    {this.props.language["changelog-101-content3"]}
                </Typography>
                <br />
                <Typography variant="overline" style={{ fontWeight: 600 }} gutterBottom>{this.props.language["changelog-100"]}</Typography>
                <Typography style={{ textAlign: "justify" }} variant="caption" gutterBottom>
                    {this.props.language["changelog-100-content"]}
                </Typography>
            </DialogContentText></DialogContent>
        )
    }
}
