"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var ReactDOM = tslib_1.__importStar(require("react-dom"));
var styles_1 = require("@material-ui/core/styles");
var App_1 = tslib_1.__importDefault(require("./App"));
var registerServiceWorker_1 = tslib_1.__importDefault(require("./registerServiceWorker"));
require("./App.scss");
var theme = styles_1.createMuiTheme({
    palette: {
        primary: {
            main: '#009688',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#ffffff',
            contrastText: '#000000',
        },
        error: {
            main: '#ef5350',
            contrastText: '#000000',
        }
    },
});
ReactDOM.render(React.createElement(styles_1.MuiThemeProvider, { theme: theme },
    React.createElement(App_1.default, null)), document.body.appendChild(document.createElement('div')));
registerServiceWorker_1.default();
//# sourceMappingURL=index.js.map