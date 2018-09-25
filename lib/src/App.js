"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const react_blockies_1 = require("react-blockies");
const Profile_1 = require("./Profile");
const EthContext_1 = require("./EthContext");
const ForumService_1 = require("./services/ForumService");
const web3_override_1 = require("./web3_override");
const ReputationService_1 = require("./services/ReputationService");
class App extends react_1.default.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            ethContext: {
                forumService: new ForumService_1.default(),
                repService: new ReputationService_1.default(),
                account: null,
                balance: '-',
                status: 'starting',
                ready: new Promise((resolve) => { this.resolveReady = resolve; })
            }
        };
        this.refreshAccount = this.refreshAccount.bind(this);
    }
    componentWillMount() {
        if (!web3_override_1.default) {
            const ethContext = Object.assign(this.state.ethContext, { status: 'uninstalled' });
            this.setState({ ethContext });
            return;
        }
        web3_override_1.default.currentProvider.publicConfigStore.on('update', this.checkMetamaskStatus.bind(this));
        this.checkMetamaskStatus();
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    checkMetamaskStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            web3_override_1.default.eth.getAccounts((err, accounts) => {
                if (err || !accounts || accounts.length === 0) {
                    const ethContext = Object.assign(this.state.ethContext, { status: 'logged out' });
                    this.setState({ ethContext });
                    return;
                }
                if (this.state.ethContext.status !== 'starting' && this.state.ethContext.status !== 'ok') {
                    this.refreshAccount(true, null);
                }
                const account0 = accounts[0].toLowerCase();
                if (account0 !== this.state.ethContext.account) {
                    // The only time we ever want to load data from the chain history
                    // is when we receive a change in accounts - this happens anytime
                    // the page is initially loaded or if there is a change in the account info
                    // via a metamask interaction.
                    web3_override_1.default.eth.defaultAccount = account0;
                    this.refreshAccount(this.state.ethContext.account !== null, account0);
                }
            });
        });
    }
    refreshBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            const eth = this.state.ethContext;
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                const balance = yield eth.forumService.getBalance();
                const ethContext = Object.assign({}, eth, { balance });
                this.setState({
                    ethContext
                });
            }), 3000);
        });
    }
    refreshAccount(refreshBoard, account) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (refreshBoard) {
                    // Easy way out for now
                    window.location.reload();
                }
                const acct = {
                    account,
                    avatar: react_1.default.createElement(react_blockies_1.default, { seed: account, size: 10 }),
                    refreshBalance: this.refreshBalance.bind(this)
                };
                yield this.state.ethContext.forumService.setAccount(acct);
                const alias = yield this.state.ethContext.repService.alias;
                const balance = yield this.state.ethContext.forumService.getBalance();
                const ethContext = Object.assign({}, this.state.ethContext, Object.assign({ status: 'ok', balance,
                    alias }, acct));
                this.setState({
                    ethContext
                });
                this.resolveReady();
            }
            catch (e) {
                const ethContext = Object.assign(this.state.ethContext, { status: 'error', error: e.message });
                this.setState({ ethContext });
                console.error(e);
            }
        });
    }
    render() {
        return (react_1.default.createElement(EthContext_1.EthContext.Provider, { value: this.state.ethContext },
            react_1.default.createElement(react_router_dom_1.BrowserRouter, null,
                react_1.default.createElement(react_router_dom_1.Switch, null,
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/", exact: true, component: Profile_1.default }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/menlo", exact: true, component: Profile_1.default })))));
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map