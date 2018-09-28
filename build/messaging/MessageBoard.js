"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
require("bootstrap/dist/css/bootstrap.min.css");
var react_blockies_1 = tslib_1.__importDefault(require("react-blockies"));
var AccountService_1 = require("../services/AccountService");
var ForumService_1 = tslib_1.__importDefault(require("../services/ForumService"));
var Message_1 = tslib_1.__importDefault(require("./Message"));
var MessageForm_1 = tslib_1.__importDefault(require("./MessageForm"));
var CountdownTimer_1 = tslib_1.__importDefault(require("../components/CountdownTimer"));
require("../App.scss");
var MessageBoard = /** @class */ (function (_super) {
    tslib_1.__extends(MessageBoard, _super);
    function MessageBoard(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.ranks = ['1st', '2nd', '3rd', '4th', '5th'];
        _this.onSubmitMessage = _this.onSubmitMessage.bind(_this);
        _this.onChangeReplying = _this.onChangeReplying.bind(_this);
        _this.claimWinnings = _this.claimWinnings.bind(_this);
        _this.refreshLotteries = _this.refreshLotteries.bind(_this);
        _this.refreshMessages = _this.refreshMessages.bind(_this);
        _this.state = {
            messages: [],
            topFive: false,
            showCompose: true,
            forum: new ForumService_1.default(props.forum)
        };
        return _this;
    }
    MessageBoard.prototype.componentDidMount = function () {
        this.state.forum.subscribeMessages('0x0', this.refreshMessages);
        this.refreshMessages();
        this.state.forum.subscribeLotteries(this.refreshLotteries);
        this.refreshLotteries();
    };
    MessageBoard.prototype.componentWillUnmount = function () {
        this.state.forum.subscribeMessages('0x0', null);
        this.state.forum.subscribeLotteries(null);
    };
    MessageBoard.prototype.componentWillReceiveProps = function (newProps) {
    };
    MessageBoard.prototype.refreshMessages = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var messages;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.state.forum.getChildrenMessages('0x0')];
                    case 1:
                        messages = _a.sent();
                        this.setState({ messages: messages });
                        return [2 /*return*/];
                }
            });
        });
    };
    MessageBoard.prototype.refreshLotteries = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var lottery;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.state.forum.lottery];
                    case 1:
                        lottery = _a.sent();
                        this.setState({ lottery: lottery });
                        return [2 /*return*/];
                }
            });
        });
    };
    MessageBoard.prototype.claimWinnings = function () {
        if (this.state.lottery) {
            this.state.lottery.claimWinnings();
        }
    };
    MessageBoard.prototype.onSubmitMessage = function (body) {
        return this.state.forum.createMessage(body, null);
    };
    MessageBoard.prototype.topFiveMessages = function () {
        return this.state.messages
            .sort(function (a, b) {
            if (a.votes > b.votes) {
                return -1;
            }
            if (a.votes < b.votes) {
                return 1;
            }
            return 0;
        })
            .slice(0, 5);
    };
    MessageBoard.prototype.renderMessagesFilterButton = function () {
        var _this = this;
        if (this.state.topFive) {
            return (React.createElement("button", { onClick: function () { return _this.setState({ topFive: false }); } }, "View All Messages"));
        }
        else {
            return (React.createElement("button", { onClick: function () { return _this.setState({ topFive: true }); } }, "View Top Five Messages"));
        }
    };
    MessageBoard.prototype.onChangeReplying = function (replying) {
        this.setState({ showCompose: !replying });
    };
    MessageBoard.prototype.renderCompleted = function () {
        return null;
    };
    MessageBoard.prototype.renderLottery = function (lottery) {
        var _this = this;
        return (React.createElement("div", { className: 'lottery-block right-side' },
            React.createElement("h4", null, "Answers"),
            !lottery.hasEnded &&
                React.createElement("div", null,
                    React.createElement("div", { className: 'message' }, "TIME LEFT"),
                    React.createElement("div", { className: 'time-left' },
                        React.createElement(CountdownTimer_1.default, { date: new Date(lottery.endTime) }))),
            !(lottery.winner) &&
                React.createElement("div", { className: 'message', style: { top: '0.3em', textAlign: 'center' } },
                    "TOP VOTED ANSWER WINS ",
                    lottery.pool.toFixed(1),
                    " TOKENS",
                    React.createElement("br", null),
                    "NO VOTES YET..."),
            lottery.winner &&
                React.createElement("span", null,
                    lottery.iWon && !lottery.claimed && React.createElement("div", { className: 'message' }, "YOU WON!!!"),
                    lottery.iWon && lottery.claimed && React.createElement("div", { className: 'message' }, "TOKENS CLAIMED"),
                    !lottery.iWon && React.createElement("div", { className: 'winners-message' }, "CURRENT WINNER"),
                    React.createElement("div", { className: 'winners-block' },
                        React.createElement("div", { className: 'winners' }, lottery.winners.map(function (a, i) {
                            return (React.createElement("div", { key: i, className: 'pedestal' },
                                React.createElement("div", { className: 'user-img' },
                                    React.createElement(react_blockies_1.default, { seed: a, size: 10, scale: 3 })),
                                React.createElement("div", { className: 'rank' }, _this.ranks[i]),
                                React.createElement("div", { className: 'tokens' },
                                    Number(lottery.winnings(i)) === 0 ? React.createElement("span", null,
                                        "PAID",
                                        React.createElement("br", null),
                                        "OUT") : Number(lottery.pool).toFixed(1),
                                    Number(lottery.winnings(i)) === 0 ? null : React.createElement("span", null,
                                        React.createElement("br", null),
                                        "ONE"))));
                        })),
                        lottery.iWon && !lottery.claimed &&
                            React.createElement("div", { className: 'claim' },
                                React.createElement("button", { className: 'btn claim-btn', onClick: this.claimWinnings },
                                    "CLAIM ",
                                    Number(lottery.pool).toFixed(1),
                                    " ONE TOKENS"))))));
    };
    MessageBoard.prototype.renderUserStats = function () {
        return (React.createElement("div", { className: "user-stats right-side-box white-bg" },
            React.createElement("h4", null, "User Metrics"),
            React.createElement("div", { className: "stats-wrapper" },
                React.createElement("div", { className: "stat" },
                    React.createElement("div", { className: "number-circle" },
                        React.createElement("span", null, "84%")),
                    React.createElement("div", { className: "stat-label-wrapper" },
                        React.createElement("span", null, "Your Reputation"),
                        React.createElement("span", null, "3,812 Reviews"))),
                React.createElement("div", { className: "stat" },
                    React.createElement("div", { className: "number-circle" },
                        React.createElement("span", null, "102")),
                    React.createElement("div", { className: "stat-label-wrapper" },
                        React.createElement("span", null, "ONE Tokens Earned"),
                        React.createElement("span", null, "($10 USD)"))),
                React.createElement("div", { className: "stat" },
                    React.createElement("div", { className: "number-circle" },
                        React.createElement("span", null, "12")),
                    React.createElement("div", { className: "stat-label-wrapper" },
                        React.createElement("span", null, "Your Posts"),
                        React.createElement("span", null, "See Posts"))),
                React.createElement("div", { className: "stat" },
                    React.createElement("div", { className: "number-circle" },
                        React.createElement("span", null, "9")),
                    React.createElement("div", { className: "stat-label-wrapper" },
                        React.createElement("span", null, "Paid Views"),
                        React.createElement("span", null, "Link"))))));
    };
    MessageBoard.prototype.renderMessages = function () {
        var _this = this;
        if (this.state.messages.length === 0 && (this.props.acct.status !== AccountService_1.MetamaskStatus.Ok || !this.state.forum.synced.isFulfilled())) {
            return (React.createElement("li", { className: 'borderis' },
                React.createElement("div", { style: { paddingBottom: '3em' } }, "Loading Discussion...")));
        }
        if (this.state.messages.length === 0) {
            return (React.createElement("li", { className: 'borderis' },
                React.createElement("div", { style: { paddingBottom: '3em' } }, "Be the first to leave a comment...")));
        }
        var messages = this.state.topFive ? this.topFiveMessages() : this.state.messages;
        return messages.map(function (m, index) {
            return (React.createElement("div", { key: index, className: 'row' },
                React.createElement("div", { className: 'col-12' },
                    React.createElement(Message_1.default, { key: m.id, forumService: _this.state.forum, message: m, onChangeReplying: _this.onChangeReplying }))));
        });
    };
    MessageBoard.prototype.render = function () {
        return (React.createElement("div", { className: 'row' },
            React.createElement("div", { className: "col-md-8" },
                React.createElement("div", { className: "left-side" },
                    React.createElement("div", { className: "left-side-wrapper" },
                        React.createElement("div", { className: "expert-reviews-1 left-side white-bg" },
                            React.createElement("h2", null, "Townhall"),
                            React.createElement("h6", null,
                                "If anyone makes money off your internet activity,",
                                React.createElement("br", null),
                                "it should be you. Build a reputation and profit. "),
                            React.createElement("p", null, "What is TownHall? Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation "),
                            React.createElement("div", { className: "comments" },
                                React.createElement("ul", null,
                                    this.renderMessages(),
                                    this.state.showCompose &&
                                        React.createElement("li", null,
                                            React.createElement("div", { className: 'content' },
                                                React.createElement(MessageForm_1.default, { onSubmit: this.onSubmitMessage }))))))))),
            React.createElement("div", { className: "col-md-4" },
                React.createElement("div", { className: 'right-side' },
                    this.renderUserStats(),
                    this.state.lottery &&
                        React.createElement("div", { className: "lottery right-side-box white-bg" }, this.renderLottery(this.state.lottery))))));
    };
    return MessageBoard;
}(React.Component));
exports.default = AccountService_1.withAcct(MessageBoard);
//# sourceMappingURL=MessageBoard.js.map