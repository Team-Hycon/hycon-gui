import * as React from "react"
import { Link } from "react-router-dom"
import { IMinedInfo } from "./rest"

interface IMinedBlockLineProps {
    minedInfo: IMinedInfo
}
interface IMinedBlockLineView {
    minedInfo: IMinedInfo
}
export class MinedBlockLine extends React.Component<IMinedBlockLineProps, IMinedBlockLineView> {
    public mounted: boolean = false
    constructor(props: IMinedBlockLineProps) {
        super(props)
        this.state = { minedInfo: props.minedInfo }
    }
    public componentWillUnmount() {
        this.mounted = false
    }

    public render() {
        const date = new Date(this.state.minedInfo.timestamp)
        if (this.state.minedInfo === undefined) {
            return null
        }
        return (
            <tr>
                <td className="mdl-data-table__cell--non-numeric table_content">
                    {this.state.minedInfo.blockhash}
                </td>
                <td className="mdl-data-table__cell--non-numeric table_content">
                    <Link to={`/address/${this.state.minedInfo.miner}`}>
                        {this.state.minedInfo.miner}
                    </Link>
                </td>
                <td className="mdl-data-table__cell--numeric table_content" style={{ paddingRight: "10%" }}>
                    {this.state.minedInfo.feeReward} HYCON
                </td>
                <td className="mdl-data-table__cell--non-numeric table_content">
                    {date.toString()}
                </td>
            </tr>
        )
    }
}
