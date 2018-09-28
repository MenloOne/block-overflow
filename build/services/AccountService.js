"use strict";
/*
 * Copyright 2018 Menlo One, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var truffle_contract_1 = tslib_1.__importDefault(require("truffle-contract"));
var react_blockies_1 = tslib_1.__importDefault(require("react-blockies"));
var web3_override_1 = tslib_1.__importDefault(require("./web3_override"));
var MenloToken_1 = require("../.contracts/MenloToken");
var QPromise_1 = require("../utils/QPromise");
var MenloToken_json_1 = tslib_1.__importDefault(require("../../node_modules/menlo-token/build/contracts/MenloToken.json"));
var MetamaskStatus;
(function (MetamaskStatus) {
    MetamaskStatus["Starting"] = "starting";
    MetamaskStatus["Uninstalled"] = "uninstalled";
    MetamaskStatus["LoggedOut"] = "logged out";
    MetamaskStatus["Ok"] = "ok";
    MetamaskStatus["Error"] = "error";
})(MetamaskStatus || (MetamaskStatus = {}));
exports.MetamaskStatus = MetamaskStatus;
var AccountService = /** @class */ (function () {
    function AccountService(stateChangeCallback) {
        var _this = this;
        this.ready = QPromise_1.QPromise(function (res, rej) { return _this.signalReady = res; });
        this.address = null;
        this.balance = 0;
        this.avatar = React.createElement("span", null);
        this.status = MetamaskStatus.Starting;
        this.stateChangeCallback = stateChangeCallback;
        this.checkMetamaskStatus = this.checkMetamaskStatus.bind(this);
        if (!web3_override_1.default) {
            this.status = MetamaskStatus.Uninstalled;
            this.stateChangeCallback(this);
            return;
        }
        this.stateChangeCallback(this);
        web3_override_1.default.currentProvider.publicConfigStore.on('update', this.checkMetamaskStatus);
        this.checkMetamaskStatus();
    }
    AccountService.prototype.isLoggedIn = function () {
        return false;
    };
    AccountService.prototype.checkMetamaskStatus = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                web3_override_1.default.eth.getAccounts(function (err, accounts) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var account0;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err || !accounts || accounts.length === 0) {
                                    this.status = MetamaskStatus.LoggedOut;
                                    this.stateChangeCallback(this);
                                    return [2 /*return*/];
                                }
                                account0 = accounts[0].toLowerCase();
                                if (!(account0 !== this.address)) return [3 /*break*/, 4];
                                if (!(this.status !== MetamaskStatus.Starting && this.status !== MetamaskStatus.Ok)) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.refreshAccount(true, null)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                            case 2:
                                // The only time we ever want to load data from the chain history
                                // is when we receive a change in accounts - this happens anytime
                                // the page is initially loaded or if there is a change in the account info
                                // via a metamask interaction.
                                web3_override_1.default.eth.defaultAccount = account0;
                                return [4 /*yield*/, this.refreshAccount(this.address !== null, account0)];
                            case 3:
                                _a.sent();
                                _a.label = 4;
                            case 4:
                                this.signalReady();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    AccountService.prototype.refreshAccount = function (reload, address) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var TokenContract, tokenAddress, _a, e_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 10]);
                        if (reload) {
                            // Easy way out for now
                            window.location.reload();
                        }
                        this.address = address;
                        if (!!this.token) return [3 /*break*/, 5];
                        return [4 /*yield*/, truffle_contract_1.default(MenloToken_json_1.default)];
                    case 1:
                        TokenContract = _b.sent();
                        return [4 /*yield*/, TokenContract.setProvider(web3_override_1.default.currentProvider)];
                    case 2:
                        _b.sent();
                        TokenContract.defaults({ from: this.address });
                        return [4 /*yield*/, TokenContract.deployed()];
                    case 3:
                        tokenAddress = (_b.sent()).address;
                        _a = this;
                        return [4 /*yield*/, MenloToken_1.MenloToken.createAndValidate(web3_override_1.default, tokenAddress)];
                    case 4:
                        _a.token = _b.sent();
                        _b.label = 5;
                    case 5:
                        this.avatar = React.createElement(react_blockies_1.default, { seed: address, size: 10 });
                        this.getBalance();
                        this.status = MetamaskStatus.Ok;
                        return [4 /*yield*/, this.getBalance()];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, this.stateChangeCallback(this)];
                    case 7:
                        _b.sent();
                        this.signalReady();
                        return [3 /*break*/, 10];
                    case 8:
                        e_1 = _b.sent();
                        console.error(e_1);
                        this.status = MetamaskStatus.Error;
                        this.error = e_1.message;
                        return [4 /*yield*/, this.stateChangeCallback(this)];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    AccountService.prototype.getBalance = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.token.balanceOf(this.address)];
                    case 1:
                        _a.fullBalance = _b.sent();
                        this.balance = this.fullBalance.div(Math.pow(10, 18)).toNumber();
                        return [2 /*return*/, this.balance];
                }
            });
        });
    };
    AccountService.prototype.refreshBalance = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready];
                    case 1:
                        _a.sent();
                        setTimeout(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.getBalance()];
                                    case 1:
                                        _a.sent();
                                        this.stateChangeCallback(this);
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 3000);
                        return [2 /*return*/];
                }
            });
        });
    };
    AccountService.prototype.contractError = function (e) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.error(e);
                        this.status = MetamaskStatus.Error;
                        this.error = e.message;
                        return [4 /*yield*/, this.stateChangeCallback(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AccountService;
}());
exports.AccountService = AccountService;
exports.default = AccountService;
var AccountContext = React.createContext({});
exports.AccountContext = AccountContext;
function withAcct(Component) {
    // ...and returns another component...
    return function EthContextComponent(props) {
        // ... and renders the wrapped component with the context theme!
        // Notice that we pass through any additional props as well
        return (React.createElement(AccountContext.Consumer, null, function (account) { return React.createElement(Component, tslib_1.__assign({}, props, { acct: account })); }));
    };
}
exports.withAcct = withAcct;
//# sourceMappingURL=AccountService.js.map