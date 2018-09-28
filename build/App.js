"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var CssBaseline_1 = tslib_1.__importDefault(require("@material-ui/core/CssBaseline"));
var AccountService_1 = require("./services/AccountService");
var config_1 = require("./config");
var BasicRouter_1 = tslib_1.__importDefault(require("./BasicRouter"));
var Topics_1 = tslib_1.__importDefault(require("./pages/Topics"));
var Forum_1 = tslib_1.__importDefault(require("./pages/Forum"));
require("./App.scss");
var Footer = /** @class */ (function (_super) {
    tslib_1.__extends(Footer, _super);
    function Footer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Footer.prototype.render = function () {
        return (React.createElement("div", null));
    };
    return Footer;
}(React.Component));
var App = /** @class */ (function (_super) {
    tslib_1.__extends(App, _super);
    function App(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.loggedOutRoutes = [
            { path: '/', action: function () { return React.createElement(Topics_1.default, null); } },
        ];
        _this.loggedInRoutes = [
            { path: '/', action: function () { return React.createElement(Topics_1.default, null); } },
            { path: '/topic/:address(\\d+)', action: function (params) { return React.createElement(Forum_1.default, tslib_1.__assign({}, params)); } },
        ];
        _this.commonRoutes = [
            { path: '/privacy', action: function () { return React.createElement(Topics_1.default, null); } }
        ];
        _this.accountChanged = _this.accountChanged.bind(_this);
        _this.renderLocation = _this.renderLocation.bind(_this);
        return _this;
    }
    App.prototype.accountChanged = function (account) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                this.setState({ account: account });
                return [2 /*return*/];
            });
        });
    };
    App.prototype.componentWillMount = function () {
        this.setState({
            account: new AccountService_1.AccountService(this.accountChanged)
        });
    };
    App.prototype.componentDidMount = function () {
        config_1.history.listen(this.renderLocation); // render subsequent URLs
        this.renderLocation(config_1.history.location, 'REPLACE');
    };
    App.prototype.renderComponent = function (component) {
        if (!component) {
            console.log("Error trying to set to null component");
            return;
        }
        console.log("Setting component to " + component.type.name);
        this.setState({ component: component });
    };
    App.prototype.renderLocation = function (location, action) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var renderComponent;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                renderComponent = this.renderComponent.bind(this);
                if (this.state.account.isLoggedIn()) {
                    this.setState({ wasLoggedIn: true });
                    BasicRouter_1.default.resolve(this.loggedInRoutes, location)
                        .then(renderComponent)
                        .catch(function (error) { return BasicRouter_1.default.resolve(tslib_1.__assign({}, _this.loggedInRoutes, _this.commonRoutes), tslib_1.__assign({}, location, { error: error }))
                        .then(renderComponent); });
                    return [2 /*return*/];
                }
                this.setState({ wasLoggedIn: false });
                BasicRouter_1.default.resolve(this.loggedOutRoutes, location)
                    .then(renderComponent)
                    .catch(function (error) { return BasicRouter_1.default.resolve(_this.loggedOutRoutes, tslib_1.__assign({}, location, { error: error }))
                    .then(renderComponent); });
                return [2 /*return*/];
            });
        });
    };
    App.prototype.render = function () {
        return (React.createElement(AccountService_1.AccountContext.Provider, { value: this.state.account },
            React.createElement(CssBaseline_1.default, null),
            this.state.component,
            this.props.children,
            React.createElement(Footer, null)));
    };
    return App;
}(React.Component));
exports.default = App;
//# sourceMappingURL=App.js.map