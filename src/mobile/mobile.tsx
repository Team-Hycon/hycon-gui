import * as React from "react"
import * as ReactDOM from "react-dom"
import { HashRouter } from "react-router-dom"
import { RestChrome } from "../restChrome"
import { MobileApp } from "./mobileClient"

document.addEventListener("deviceready", () => {
    const rest = new RestChrome()

    ReactDOM.hydrate(
        <HashRouter>
            <MobileApp rest={rest} />
        </HashRouter>,
        document.getElementById("blockexplorer"),
    )

    document.addEventListener("backbutton", (event) => {
        event.preventDefault()
        history.back()
        return
    }, false)
}, false)
