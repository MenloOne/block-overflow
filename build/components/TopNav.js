"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
require("bootstrap/dist/css/bootstrap.min.css");
var web3_override_1 = tslib_1.__importDefault(require("../services/web3_override"));
var AccountService_1 = require("../services/AccountService");
var truffle_contract_1 = tslib_1.__importDefault(require("truffle-contract"));
var MenloFaucetContract = require('../build-contracts/MenloFaucet.json');
require("../App.scss");
var logo = require('../images/logo.svg');
var TopNav = /** @class */ (function (_super) {
    tslib_1.__extends(TopNav, _super);
    function TopNav(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.onGetTokens = _this.onGetTokens.bind(_this);
        return _this;
    }
    TopNav.prototype.onGetTokens = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var faucetContract, faucet, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.props.acct.status !== AccountService_1.MetamaskStatus.Ok) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        faucetContract = truffle_contract_1.default(MenloFaucetContract);
                        faucetContract.defaults({
                            from: this.props.acct.address
                        });
                        faucetContract.setProvider(web3_override_1.default.currentProvider);
                        return [4 /*yield*/, faucetContract.deployed()];
                    case 2:
                        faucet = _a.sent();
                        return [4 /*yield*/, faucet.drip()];
                    case 3:
                        _a.sent();
                        this.props.acct.refreshBalance();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        window.alert(e_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    TopNav.prototype.renderONE = function () {
        var one = this.props.acct.balance;
        if (one < 5) {
            return (React.createElement("li", { className: "nav-item token-number" },
                React.createElement("button", { className: 'btn faucet-btn', onClick: this.onGetTokens }, "GET ONE TOKENS FROM KOVAN FAUCET")));
        }
        return (React.createElement("li", { className: "nav-item token-number" },
            React.createElement("span", null, new bignumber_js_1.default(one).toFormat(0)),
            React.createElement("span", { className: "token-one" }, "\u00A0ONE")));
    };
    TopNav.prototype.renderAccountStatus = function () {
        console.log('STATUS: ', this.props.acct.status);
        if (this.props.acct.status === AccountService_1.MetamaskStatus.LoggedOut) {
            return (React.createElement("ul", { className: "navbar-nav ml-auto" },
                React.createElement("li", { className: "nav-item token-number" },
                    React.createElement("span", { className: "token-one" }, "YOU MUST SIGN INTO METAMASK TO TAKE PART IN DISCUSSIONS"))));
        }
        if (this.props.acct.status === AccountService_1.MetamaskStatus.Uninstalled) {
            return (React.createElement("ul", { className: "navbar-nav ml-auto" },
                React.createElement("li", { className: "nav-item token-number" },
                    React.createElement("span", { className: "token-one" }, "YOU MUST USE CHROME WITH THE METAMASK EXTENSION TO TAKER PART IN DISCUSSIONS"))));
        }
        if (this.props.acct.status === AccountService_1.MetamaskStatus.Error) {
            return (React.createElement("ul", { className: "navbar-nav ml-auto" },
                React.createElement("li", { className: "nav-item token-number" },
                    React.createElement("span", { className: "token-one" }, this.props.acct.error))));
        }
        if (this.props.acct.status === AccountService_1.MetamaskStatus.Starting) {
            return (React.createElement("ul", { className: "navbar-nav ml-auto" },
                React.createElement("li", { className: "nav-item token-number" },
                    React.createElement("span", { className: "token-one" }, "..."))));
        }
        return (React.createElement("ul", { className: "navbar-nav ml-auto" },
            this.renderONE(),
            React.createElement("li", { className: "nav-item dropdown" },
                React.createElement("a", { className: "nav-link dropdown-toggle mr-lg-2", id: "messagesDropdown", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false" },
                    React.createElement("span", { className: "user-img" }, this.props.acct.avatar),
                    React.createElement("span", { className: "name" }, this.props.acct.address),
                    false &&
                        React.createElement("span", { className: "avatar-indicator text-primary d-none d-lg-block" },
                            React.createElement("i", { className: "fa fa-fw fa-circle" }, "3"))))));
    };
    TopNav.prototype.render = function () {
        return (React.createElement("nav", { className: "navbar navbar-expand-lg navbar-dark bg-dark fixed-top", id: "mainNav" },
            React.createElement("div", { className: "container" },
                React.createElement("a", { className: "navbar-brand", href: "index.html" },
                    React.createElement("img", { src: logo, title: "Menlo One", alt: "Menlo One" })),
                React.createElement("button", { className: "navbar-toggler navbar-toggler-right", type: "button", "data-toggle": "collapse", "data-target": "#navbarResponsive", "aria-controls": "navbarResponsive", "aria-expanded": "false", "aria-label": "Toggle navigation" },
                    React.createElement("span", { className: "navbar-toggler-icon" })),
                React.createElement("div", { className: "collapse navbar-collapse", id: "navbarResponsive" },
                    React.createElement("ul", { className: "navbar-nav main ml-auto", style: { display: 'none' } },
                        React.createElement("li", { className: "nav-item" },
                            React.createElement("a", { href: "/", title: "Discover" }, "Discover")),
                        React.createElement("li", { className: "nav-item" },
                            React.createElement("a", { href: "/guild/", title: "Guilds" }, "Guilds")),
                        React.createElement("li", { className: "nav-item" },
                            React.createElement("a", { href: "/wallet/", title: "Wallet" }, "Wallet"))),
                    this.renderAccountStatus()))));
    };
    return TopNav;
}(React.Component));
exports.default = AccountService_1.withAcct(TopNav);
//# sourceMappingURL=TopNav.js.map