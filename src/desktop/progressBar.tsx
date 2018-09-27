import CircularProgress from "material-ui/CircularProgress"
import LinearProgress from "material-ui/LinearProgress"
import * as React from "react"

export class ProgressBar extends React.Component<any, any> {
  public static WALLET_LIST = 1
  public static PAGE = 2

  constructor(props: any) {
    super(props)
  }

  public render() {
    switch (this.props.type) {
      case ProgressBar.WALLET_LIST:
        return (
          <div>
            <h5>Getting wallet list...</h5>
            <LinearProgress mode="indeterminate" color="blue" />
          </div>
        )
      case ProgressBar.PAGE:
        return (
          <div style={{ height: 400, width: 50, margin: "auto" }}>
            <CircularProgress
              style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
              size={50}
            />
          </div>
        )
      default:
        throw new Error("Need progress type")
    }
  }
}
