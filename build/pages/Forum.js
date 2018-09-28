"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
require("bootstrap/dist/css/bootstrap.min.css");
var TopNav_1 = tslib_1.__importDefault(require("../components/TopNav"));
var MessageBoard_1 = tslib_1.__importDefault(require("../messaging/MessageBoard"));
var react_responsive_embed_1 = tslib_1.__importDefault(require("react-responsive-embed"));
var ForumService_1 = tslib_1.__importDefault(require("../services/ForumService"));
var AccountService_1 = require("../services/AccountService");
var assets_1 = tslib_1.__importDefault(require("../assets"));
require("../App.scss");
var arrowRight = require('../images/arrow-right.svg');
var globe = require('../images/icon-globe.svg');
var paper = require('../images/icon-paper.svg');
var twitter = require('../images/twitter.svg');
var facebook = require('../images/facebook.svg');
var github = require('../images/github.svg');
var telegram = require('../images/telegram.svg');
var userIm = require('../images/user-1.png');
var user2Im = require('../images/user-2.png');
var iconIm = require('../images/icon.png');
var computer = require('../images/ICO_profile_page_svg.svg');
var townhall = require('../images/Townhall_valued_comment_svg.svg');
var Forum = /** @class */ (function (_super) {
    tslib_1.__extends(Forum, _super);
    function Forum(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.onEditEth = _this.onEditEth.bind(_this);
        _this.onEditTokens = _this.onEditTokens.bind(_this);
        _this.state = {
            eth: 1,
            tokens: 0
        };
        return _this;
    }
    Forum.prototype.componentWillReceiveProps = function (nextProps, nextContext) {
        this.updateForum(nextProps.acct);
    };
    Forum.prototype.updateForum = function (nextProps) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(nextProps.address !== this.props.address)) return [3 /*break*/, 2];
                        this.forum = new ForumService_1.default(nextProps.address);
                        return [4 /*yield*/, this.forum.setAccount(nextProps.acct)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        if (!(nextProps.acct !== this.props.acct)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.forum.setAccount(nextProps.acct)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Forum.prototype.componentDidMount = function () {
        this.onEditEth(null);
    };
    Forum.prototype.componentWillMount = function () {
    };
    Forum.prototype.onEditEth = function (evt) {
        var eth = 1;
        if (evt) {
            eth = evt.target.value;
        }
        var tokens = Math.round((eth * 12000) * 100) / 100;
        this.setState({ eth: eth, tokens: tokens });
    };
    Forum.prototype.onEditTokens = function (evt) {
        var tokens = evt.target.value;
        var eth = Math.round((tokens / (12000)) * 100) / 100;
        this.setState({ eth: eth, tokens: tokens });
    };
    Forum.prototype.renderMoreInfo = function () {
        return (React.createElement("div", { className: "user-stats right-side-box white-bg" },
            React.createElement("h4", null, "More Info"),
            React.createElement("div", { className: "moreinfo-btns-wrapper" },
                React.createElement("a", { href: "http://menlo.one" },
                    React.createElement("div", { className: "moreinfo-btn" },
                        React.createElement("img", { src: paper, className: "icon-paper" }),
                        React.createElement("div", { className: "moreinfo-btn-textwrapper" },
                            React.createElement("span", null, "White Paper")),
                        React.createElement("img", { src: arrowRight, className: "arrow-right" }))),
                React.createElement("a", { href: "http://menlo.one" },
                    React.createElement("div", { className: "moreinfo-btn" },
                        React.createElement("img", { src: globe, className: "icon-globe" }),
                        React.createElement("div", { className: "moreinfo-btn-textwrapper" },
                            React.createElement("span", null, "Website"),
                            React.createElement("span", null, "http://menlo.one")),
                        React.createElement("img", { src: arrowRight, className: "arrow-right" })))),
            React.createElement("div", { className: "moreinfo-social-wrapper" },
                React.createElement("ul", null,
                    React.createElement("li", null,
                        React.createElement("a", { href: "https://twitter.com/menloone?lang=en", target: "_blank" },
                            React.createElement("img", { src: twitter, alt: "Menlo One Twitter" }))),
                    React.createElement("li", null,
                        React.createElement("a", { href: "https://www.facebook.com/menloone/", target: "_blank" },
                            React.createElement("img", { src: facebook, alt: "Menlo One Facebook" }))),
                    React.createElement("li", null,
                        React.createElement("a", { href: "https://github.com/MenloOne", target: "_blank" },
                            React.createElement("img", { src: github, alt: "Menlo One Github" }))),
                    React.createElement("li", null,
                        React.createElement("a", { href: "https://t.me/Menloone", target: "_blank" },
                            React.createElement("img", { src: telegram, alt: "Menlo One Telegram" })))))));
    };
    Forum.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement(TopNav_1.default, null),
            React.createElement("div", { className: "game-token shadow-sm" },
                React.createElement("div", { className: "container" },
                    React.createElement("div", { className: "col-md-8 game-detail-wrapper" },
                        React.createElement("img", { className: "game-img", src: assets_1.default.menloFB, alt: "", style: { scale: 2 } }),
                        React.createElement("div", { className: "game-detail" },
                            React.createElement("h2", null, "Menlo One"),
                            React.createElement("p", null, "Menlo One is a powerful framework for building decentralized applications with the speed of a traditional web app. Our decentralized database and Proof-of-Reputation incentive system is the infrastructure that enables the Web 3.0 generation of marketplaces, social media platforms, and future apps to be as fast and performant as their centralized predecessors."),
                            React.createElement("div", { className: "locaton-tag" },
                                React.createElement("span", { className: "location" },
                                    React.createElement("i", { className: "fa fa-map-marker" }),
                                    " New Jersey"),
                                React.createElement("span", { className: "tag" },
                                    React.createElement("i", { className: "fa fa-tag" }),
                                    " Utility Token")))),
                    React.createElement("div", { className: "col-md-4 game-action-wrapper" },
                        React.createElement("div", { className: "header-buttons" },
                            React.createElement("a", { href: "", className: "btn" }, "Watch"),
                            React.createElement("a", { href: "", className: "btn" }, "Recommend")),
                        React.createElement("div", { className: "committed" },
                            React.createElement("p", { className: "total-comments" },
                                React.createElement("a", { className: "circle-btn", title: "" },
                                    React.createElement("img", { src: iconIm, alt: "" })),
                                React.createElement("span", null, "103 accounts"),
                                "\u00A0currently hold Menlo ONE tokens\u00A0"))))),
            React.createElement("div", { className: "content-wrapper" },
                React.createElement("div", { className: "container" },
                    React.createElement("div", { className: "row" },
                        React.createElement("div", { className: "col-md-8" },
                            React.createElement("div", { className: "left-side" },
                                React.createElement("div", { className: "left-side-wrapper" },
                                    React.createElement("div", { className: "top-users", style: { display: 'none' } },
                                        React.createElement("div", { className: "members" },
                                            React.createElement("h3", null, "MEMBERS 12 (3)"),
                                            React.createElement("div", { className: "member-users" },
                                                React.createElement("span", { className: "user-img" },
                                                    React.createElement("img", { src: userIm, title: "user", alt: "user" })),
                                                React.createElement("span", { className: "user-img" },
                                                    React.createElement("img", { src: user2Im, title: "user", alt: "user" })),
                                                React.createElement("span", { className: "user-img" },
                                                    React.createElement("img", { src: userIm, title: "user", alt: "user" }))),
                                            React.createElement("div", { className: "top-names" },
                                                React.createElement("a", null, "@david"),
                                                ", ",
                                                React.createElement("a", null, "@jenny"),
                                                ", and ",
                                                React.createElement("a", null, "@bobNYC"))),
                                        React.createElement("div", { className: "backers" },
                                            React.createElement("h3", null, "Other Backers (1,322)"),
                                            React.createElement("div", { className: "member-users" },
                                                React.createElement("span", { className: "user-img" },
                                                    React.createElement("img", { src: userIm, title: "user", alt: "user" })),
                                                React.createElement("span", { className: "user-img" },
                                                    React.createElement("img", { src: user2Im, title: "user", alt: "user" })),
                                                React.createElement("span", { className: "user-img" },
                                                    React.createElement("img", { src: userIm, title: "user", alt: "user" }))),
                                            React.createElement("div", { className: "top-names" },
                                                React.createElement("a", null, "@BlockchainCapital"),
                                                ", ",
                                                React.createElement("a", null, "@RogerVer"),
                                                " and 1,322 others")),
                                        React.createElement("hr", null)),
                                    React.createElement("h2", null, "The next generation of the web"),
                                    React.createElement("h6", null,
                                        "All of the data on this page was pulled from",
                                        React.createElement("br", null),
                                        "a blockchain, but is as fast as the cloud."),
                                    React.createElement("div", { className: "row" },
                                        React.createElement("div", { className: "col-md-6" },
                                            React.createElement("p", null, "This page is different from any other webpage you\u2019ve ever used. While it may not seem like it, all of the information here was pulled in from several blockchains and decentralized systems, and there is a built in protocol for you the user to verify that. The goal of Menlo One is to make dApps as fast and easy to use as their centralized predecessors, and this page is a demonstrtion of the alpha release of our framework in action.")),
                                        React.createElement("div", { className: "col-md-6 text-center" },
                                            React.createElement("img", { src: computer })))),
                                React.createElement("hr", null),
                                React.createElement("div", { className: "left-side-wrapper" },
                                    React.createElement(react_responsive_embed_1.default, { src: 'https://www.youtube.com/embed/yuohXyDP1pk?rel=0', allowFullScreen: true }))),
                            React.createElement("div", { className: "team left-side", style: { display: 'none' } },
                                React.createElement("h2", null, "Team"),
                                React.createElement("div", { className: "team-member" },
                                    React.createElement("span", { className: "user-img" },
                                        React.createElement("img", { src: userIm, title: "user", alt: "user" })),
                                    React.createElement("div", { className: "user-detail" },
                                        React.createElement("div", { className: "team-member-name" },
                                            React.createElement("a", null, "@wethefuture")),
                                        React.createElement("div", { className: "designation" }, "CTO"))),
                                React.createElement("div", { className: "team-member" },
                                    React.createElement("span", { className: "user-img" },
                                        React.createElement("img", { src: user2Im, title: "user", alt: "user" })),
                                    React.createElement("div", { className: "user-detail" },
                                        React.createElement("div", { className: "team-member-name" },
                                            React.createElement("a", null, "@greatthings")),
                                        React.createElement("div", { className: "designation" }, "COO")))),
                            React.createElement("div", { className: "reviews-and-comments expert-reviews left-side", style: { display: 'none' } },
                                React.createElement("div", { className: "Expert-Reviews" },
                                    React.createElement("h3", null, " Expert Reviews "),
                                    React.createElement("div", { className: "boxinner" },
                                        React.createElement("span", { className: "oval-1" }, "84%"),
                                        React.createElement("div", { className: "boxinner-text" },
                                            " Blockchain Architect Guild",
                                            React.createElement("span", null, "3,812 Reviews"))),
                                    React.createElement("div", { className: "boxinner" },
                                        React.createElement("span", { className: "oval-2" }, "92%"),
                                        React.createElement("div", { className: "boxinner-text" },
                                            "Startup MBA Guild",
                                            React.createElement("span", null, "401 Reviews")))),
                                React.createElement("div", { className: "User-Reviews" },
                                    React.createElement("h3", null, "User Reviews"),
                                    React.createElement("div", { className: "Profile" },
                                        React.createElement("i", { className: "fa fa-thumbs-up" }),
                                        "12"),
                                    React.createElement("div", { className: "Profile" },
                                        React.createElement("i", { className: "fa fa-thumbs-down" }),
                                        "109")),
                                React.createElement("div", { className: "awesome-product-aw" },
                                    "\u201CLove what these guys are doing.\u201D ",
                                    React.createElement("br", null),
                                    React.createElement("span", { className: "name" }, "- Blockchain Architect Guild"))),
                            React.createElement("div", { className: "left-side" },
                                React.createElement("div", { className: "left-side-wrapper" },
                                    React.createElement("h2", null, "Build reputation, earn tokens"),
                                    React.createElement("h6", null, "You know it\u2019s secure, because you validate it yourself."),
                                    React.createElement("div", { style: { display: 'flex' } },
                                        React.createElement("img", { src: townhall, style: { marginRight: '1rem' } }),
                                        React.createElement("div", { className: "paragraph-details-wrapper" },
                                            React.createElement("p", null, "EXPLAIN WHY REPUTATION IS IMPORTANT HERE - Vallidate this page and begin earning tokens. \u2014\u2014\u2014Meow up on this idea, since if we built this game on the blockchain everything would\u2019ve been easier to create. So here we are, the decentralized way to make games a "),
                                            React.createElement("div", { className: "points-wrapper" },
                                                React.createElement("div", { className: "point" },
                                                    React.createElement("span", { className: "points-label" }, "REPUTATION"),
                                                    React.createElement("span", { className: "points-stat" }, "2")),
                                                React.createElement("div", { className: "point" },
                                                    React.createElement("span", { className: "points-label" }, "REWARD"),
                                                    React.createElement("span", { className: "points-stat" }, "2 ONE")),
                                                React.createElement("div", { className: "point" },
                                                    React.createElement("span", { className: "points-label" }, "VALIDATION COST"),
                                                    React.createElement("span", { className: "points-stat" }, "0.00013 ETH")),
                                                React.createElement("div", { className: "point" },
                                                    React.createElement("span", { className: "points-label" }, "PROFIT"),
                                                    React.createElement("span", { className: "points-stat" }, "13%")))))))),
                        React.createElement("div", { className: "col-md-4" },
                            React.createElement("div", { className: "right-side-box" },
                                React.createElement("div", { className: "green-bg" },
                                    React.createElement("div", { className: "start-in" }, "CONTENT NODE STATS"),
                                    React.createElement("table", { className: "stats" },
                                        React.createElement("tbody", null,
                                            React.createElement("tr", null,
                                                React.createElement("td", null, "Node Earnings (In ONE)"),
                                                React.createElement("td", null, "34,233  ONE")),
                                            React.createElement("tr", null,
                                                React.createElement("td", null, "Node Earnings (In USD)"),
                                                React.createElement("td", null, "$220")),
                                            React.createElement("tr", null,
                                                React.createElement("td", null, "Content Node Cost (mo)"),
                                                React.createElement("td", null, "$19")),
                                            React.createElement("tr", null,
                                                React.createElement("td", null, "Content Node Reputation"),
                                                React.createElement("td", null, "440 (A+ Grade)")),
                                            React.createElement("tr", null,
                                                React.createElement("td", null, "Node Uptime"),
                                                React.createElement("td", null, "99%")),
                                            React.createElement("tr", null,
                                                React.createElement("td", null, "Annual ROI"),
                                                React.createElement("td", null, "91.4%"))))),
                                React.createElement("div", { className: "white-bg content-node" },
                                    React.createElement("a", { href: "https://tokensale.menlo.one", className: "green-btn", title: "Buy Tokens" }, "Apply to run a Content Node"),
                                    React.createElement("div", null,
                                        React.createElement("p", null,
                                            "Menlo One Content Nodes are an",
                                            React.createElement("br", null),
                                            "alpha stage project. If you would like to run a",
                                            React.createElement("br", null),
                                            "Content Node, please contact us.")))),
                            React.createElement("div", { className: "token-metrics right-side-box white-bg" },
                                React.createElement("h4", null, "Token Metrics"),
                                React.createElement("ul", null,
                                    React.createElement("li", null,
                                        React.createElement("div", { className: "name" }, "Tokens in circulation"),
                                        React.createElement("div", { className: "detail" }, "354,000,000")),
                                    React.createElement("li", null,
                                        React.createElement("div", { className: "name" }, "Price"),
                                        React.createElement("div", { className: "detail" }, "$0.03")),
                                    React.createElement("li", null,
                                        React.createElement("div", { className: "name" }, "Volume"),
                                        React.createElement("div", { className: "detail" }, "34,241")),
                                    React.createElement("li", null,
                                        React.createElement("div", { className: "name" }, "Token Supply"),
                                        React.createElement("div", { className: "detail" }, "50% discount")))),
                            this.renderMoreInfo())),
                    React.createElement(MessageBoard_1.default, null)))));
    };
    return Forum;
}(React.Component));
exports.default = AccountService_1.withAcct(Forum);
//# sourceMappingURL=Forum.js.map