import * as React from "react"
import { RouteComponentProps } from "react-router"
import { RouteConfig } from "react-router-config"
import { Link, Route, Switch } from "react-router-dom"

import Icon from "@material-ui/core/Icon"
import { AddressInfo } from "./addressInfo"
import { AddWallet } from "./addWallet"
import { BlockView } from "./blockView"
import { Home } from "./home"
import { LedgerView } from "./ledgerView"
import { MakeTransaction } from "./makeTransaction"
import { MinerView } from "./minerView"
// import { PeersList } from "./peersList"
import { PeersView } from "./peersView"
import { RecoverWallet } from "./recoverWallet"
import { IRest } from "./rest"
import { Transaction } from "./transaction"
import { TxPoolList } from "./txPoolList"
import { TxView } from "./txView"
import { WalletDetail } from "./walletDetail"
import { WalletView } from "./walletView"

import FormControl from "@material-ui/core/FormControl"
import MenuItem from "@material-ui/core/MenuItem"
import Select from "@material-ui/core/Select"
// tslint:disable:no-var-requires

import { getLocale, IText } from "./locales/locales"

export const routes: RouteConfig[] = [
    { exact: true, path: "/" },
    { exact: true, path: "/tx/:hash" },
    { exact: true, path: "/block/:hash" },
    { exact: true, path: "/txPool" },
    { exact: true, path: "/address/:hash" },
    { exact: true, path: "/wallet" },
    { exact: true, path: "/wallet/addWallet" },
    { exact: true, path: "/wallet/recoverWallet" },
    { exact: true, path: "/wallet/detail/:name" },
    { exact: true, path: "/transaction/:name" },
    { exact: true, path: "/maketransaction/:isLedger" },
    { exact: true, path: "/maketransaction/:isLedger/:selectedLedger" },
    { exact: true, path: "/peersView" },
    { exact: true, path: "/minerView" },
    { exact: true, path: "/ledgerView" },
    { exact: true, path: "/address/:hash/:selectedLedger" },
    // { exact: true, path: "/peer/:hash" },
]

// tslint:disable:no-shadowed-variable
export class LiteClient extends React.Component<{ rest: IRest }, any> {
    public errMsg1: string = "Please enter a valid Hash value consisting of numbers and English"
    public rest: IRest
    public language: IText
    public blockView: ({ match }: RouteComponentProps<{ hash: string }>) => JSX.Element
    public home: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public addressInfo: (
        { match }: RouteComponentProps<{ hash: string }>,
    ) => JSX.Element
    public txView: ({ match }: RouteComponentProps<{ hash: string }>) => JSX.Element
    public txPool: ({ match }: RouteComponentProps<{}>) => JSX.Element

    public transaction: ({ match }: RouteComponentProps<{ name: string }>) => JSX.Element
    public maketransaction: ({ match }: RouteComponentProps<{ isLedger: boolean }>) => JSX.Element
    public maketransactionWithIndex: ({ match }: RouteComponentProps<{ isLedger: boolean, selectedLedger: number }>) => JSX.Element
    public peersView: ({ match }: RouteComponentProps<{}>) => JSX.Element
    // public peerDetails: (
    //     { match }: RouteComponentProps<{ hash: string }>,
    // ) => JSX.Element

    public wallet: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public addWallet: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public recoverWallet: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public walletDetail: ({ match }: RouteComponentProps<{ name: string }>) => JSX.Element
    public minerView: ({ match }: RouteComponentProps<{ name: string }>) => JSX.Element
    public ledgerView: ({ match }: RouteComponentProps<{}>) => JSX.Element
    public ledgerAddressView: ({ match }: RouteComponentProps<{ hash: string, selectedLedger: number }>) => JSX.Element
    public notFound: boolean

    constructor(props: any) {
        super(props)
        this.state = {
            block: "block",
            isParity: false,
            languageSelect: navigator.language.split("-")[0],
            loading: false,
            name: "BlockExplorer",
            tx: "Tx 1",
        }
        this.rest = props.rest
        this.language = getLocale(navigator.language)
        this.rest.loadingListener((loading: boolean) => {
            this.state = ({ loading })
        })
        this.blockView = ({ match }: RouteComponentProps<{ hash: string }>) => (
            <BlockView hash={match.params.hash} rest={this.rest} notFound={this.notFound} />
        )
        this.home = ({ match }: RouteComponentProps<{}>) => (
            <Home rest={props.rest} />
        )
        this.addressInfo = ({ match }: RouteComponentProps<{ hash: string }>) => (
            <AddressInfo hash={match.params.hash} rest={this.rest} language={this.language} />
        )
        this.txView = ({ match }: RouteComponentProps<{ hash: string }>) => (
            <TxView hash={match.params.hash} rest={this.rest} />
        )
        this.txPool = ({ match }: RouteComponentProps<{}>) => (
            <TxPoolList rest={this.rest} />
        )
        this.transaction = ({ match }: RouteComponentProps<{ name: string }>) => (
            <Transaction name={match.params.name} rest={this.rest} language={this.language} />
        )
        this.maketransaction = ({ match }: RouteComponentProps<{ isLedger: boolean }>) => (
            <MakeTransaction isLedger={match.params.isLedger} rest={this.rest} language={this.language} />
        )
        this.maketransactionWithIndex = ({ match }: RouteComponentProps<{ isLedger: boolean, selectedLedger: number }>) => (
            <MakeTransaction isLedger={match.params.isLedger} rest={this.rest} selectedLedger={match.params.selectedLedger} language={this.language} />
        )
        this.peersView = ({ match }: RouteComponentProps<{}>) => (
            <PeersView rest={props.rest} />
        )
        // this.peerDetails = ({ match }: RouteComponentProps<{ hash: string }>) => (
        //     <PeerDetailsView hash={match.params.hash} rest={this.rest} />
        // )
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
            <WalletDetail name={match.params.name} rest={this.rest} language={this.language} notFound={this.notFound} />
        )

        this.minerView = ({ match }: RouteComponentProps<{}>) => (
            <MinerView rest={this.rest} />
        )
        this.ledgerView = ({ match }: RouteComponentProps<{}>) => (
            <LedgerView rest={this.rest} language={this.language} />
        )
        this.ledgerAddressView = ({ match }: RouteComponentProps<{ hash: string, selectedLedger: number }>) => (
            <AddressInfo hash={match.params.hash} rest={this.rest} selectedLedger={match.params.selectedLedger} language={this.language} />
        )
    }
    public languageChange = (event: any) => {
        this.language = getLocale(event.target.value)
        this.setState({ [event.target.name]: event.target.value })
    }
    public render() {
        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header">
                <header className="mdl-layout__header" >
                    <div className="mdl-layout__header-row" style={{ padding: "0 16px 0 10px" }}>
                        <Icon onClick={() => { history.back() }} style={{ color: "white", float: "left", margin: "0 1em 0 0.5em", cursor: "pointer" }}>chevron_left</Icon>
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
                        </nav>
                    </div>
                    <div className={`mdl-progress mdl-js-progress mdl-progress__indeterminate progressBar ${this.state.loading ? "" : "hide"}`} />
                </header>
                <main className="mdl-layout__content main">
                    <div className="page-content">
                        <Switch>
                            {/* <Route exact path='/' component={() => { return <Home name={this.state.name} /> }} /> */}
                            <Route exact path="/" component={this.wallet} />
                            <Route exact path="/tx/:hash" component={this.txView} />
                            <Route exact path="/block/:hash" component={this.blockView} />
                            <Route exact path="/address/:hash" component={this.addressInfo} />
                            <Route exact path="/transaction/:name" component={this.transaction} /> {/* send tx */}
                            <Route exact path="/maketransaction/:isLedger" component={this.maketransaction} />
                            <Route exact path="/maketransaction/:isLedger/:selectedLedger" component={this.maketransactionWithIndex} />
                            <Route exact path="/wallet/addWallet" component={this.addWallet} />
                            <Route exact path="/wallet" component={this.wallet} />
                            <Route exact path="/wallet/recoverWallet" component={this.recoverWallet} />
                            <Route exact path="/wallet/detail/:name" component={this.walletDetail} />
                            <Route exact path="/ledgerView" component={this.ledgerView} />
                            <Route exact path="/address/:hash/:selectedLedger" component={this.ledgerAddressView} />
                        </Switch>
                    </div>
                </main>
            </div>
        )
    }
}
