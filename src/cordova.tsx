import "material-design-lite"
import "material-design-lite/material.css"
import getMuiTheme from "material-ui/styles/getMuiTheme"
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { HashRouter } from "react-router-dom"
import "./desktop/blockexplorer.css"
import { LiteClient } from "./liteclient"
import "./desktop/marker.css"
import "./desktop/material.css"
import { RestChrome } from "./restChrome"
import "./desktop/transaction.css"
// tslint:disable

var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.receivedEvent('deviceready');
        const rest = new RestChrome()

        
        ReactDOM.hydrate(
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                <HashRouter>
                    <LiteClient rest={rest} />
                </HashRouter>
            </MuiThemeProvider>,
            document.getElementById("blockexplorer"),
        )

    },

    // Update DOM on a Received Event
    receivedEvent: function (id: any) {

        console.log('Received Event: ' + id);
    }
};

app.initialize();