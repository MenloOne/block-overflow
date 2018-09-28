"use strict";
/*
 * Copyright 2018 Menlo One, Inc.
 * Parts Copyright 2018 Vulcanize, Inc.
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
var react_1 = tslib_1.__importDefault(require("react"));
var react_blockies_1 = tslib_1.__importDefault(require("react-blockies"));
var react_moment_1 = tslib_1.__importDefault(require("react-moment"));
var MessageForm_1 = tslib_1.__importDefault(require("./MessageForm"));
require("../App.scss");
require("./Message.css");
var Message = /** @class */ (function (_super) {
    tslib_1.__extends(Message, _super);
    function Message(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            showReplyForm: false,
            showReplies: true,
            children: [],
        };
        return _this;
    }
    Message.prototype.componentDidMount = function () {
        this.props.forumService.subscribeMessages(this.props.message.id, this.refreshMessages.bind(this));
    };
    Message.prototype.componentWillUnmount = function () {
        this.props.forumService.subscribeMessages(this.props.message.id, null);
    };
    Message.prototype.componentWillReceiveProps = function (newProps) {
        this.refreshMessages();
    };
    Message.prototype.refreshMessages = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var message, replies;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        message = this.props.message;
                        return [4 /*yield*/, this.props.forumService.getChildrenMessages(message.id)];
                    case 1:
                        replies = _a.sent();
                        this.setState({ children: replies });
                        return [2 /*return*/];
                }
            });
        });
    };
    Message.prototype.reply = function (body) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var message;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setState({ showReplyForm: false });
                        return [4 /*yield*/, this.props.forumService.createMessage(body, this.props.message.id)
                            /*
                    
                            const child = (
                                <Topic key={message.id}
                                         message={message}
                                         forumService={this.props.forumService}/>
                            )
                    
                            this.showReplies(true)
                            this.setState({
                                children: [...this.state.children, child],
                                showReplyForm: false
                            })
                             */
                        ];
                    case 1:
                        message = _a.sent();
                        /*
                
                        const child = (
                            <Topic key={message.id}
                                     message={message}
                                     forumService={this.props.forumService}/>
                        )
                
                        this.showReplies(true)
                        this.setState({
                            children: [...this.state.children, child],
                            showReplyForm: false
                        })
                         */
                        this.setState({
                            showReplyForm: false
                        });
                        if (this.props.onChangeReplying) {
                            this.props.onChangeReplying(false);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Message.prototype.showReplies = function (show) {
        this.setState({ showReplies: show });
    };
    Message.prototype.showReplyForm = function () {
        this.setState({ showReplyForm: true });
        if (this.props.onChangeReplying) {
            this.props.onChangeReplying(true);
        }
    };
    Message.prototype.upvote = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.props.forumService.upvote(this.props.message.id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Message.prototype.downvote = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.props.forumService.downvote(this.props.message.id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Message.prototype.messageStatus = function () {
        return this.props.forumService.getMessage(this.props.message.id) ? 'complete' : 'pending';
    };
    Message.prototype.messageComplete = function () {
        return this.messageStatus() === 'complete';
    };
    Message.prototype.messagePending = function () {
        return this.messageStatus() === 'pending';
    };
    Message.prototype.renderVotes = function () {
        var message = this.props.message;
        if (message.votes === 0) {
            return null;
        }
        return (react_1.default.createElement("span", { className: "votes-indicator item text-primary d-lg-block", negative: (message.votes < 0) ? 'true' : 'false' },
            react_1.default.createElement("div", { className: 'circle left' }),
            react_1.default.createElement("div", { className: 'circle mid' }, message.votes < 0 ?
                react_1.default.createElement("span", null,
                    react_1.default.createElement("i", { className: 'fa fa-fw fa-thumbs-down' }),
                    message.votes)
                :
                    react_1.default.createElement("span", null,
                        react_1.default.createElement("i", { className: 'fa fa-fw fa-thumbs-up' }),
                        message.votes)),
            react_1.default.createElement("div", { className: 'circle right' })));
    };
    Message.prototype.renderReplies = function () {
        var _this = this;
        return this.state.children.map(function (m) {
            return (react_1.default.createElement(Message, { key: m.id, message: m, forumService: _this.props.forumService }));
        });
    };
    Message.prototype.render = function () {
        var _this = this;
        var message = this.props.message;
        return (react_1.default.createElement("li", { className: "borderis message" },
            react_1.default.createElement("div", { className: "comments user-img" },
                react_1.default.createElement(react_blockies_1.default, { seed: message.author, size: 9 })),
            react_1.default.createElement("div", { className: "content" },
                react_1.default.createElement("h3", { className: "tag-name" },
                    message.author,
                    react_1.default.createElement("span", { className: "points", style: { display: 'none' } }, "??? points "),
                    react_1.default.createElement("span", { className: "time" },
                        react_1.default.createElement(react_moment_1.default, { fromNow: true }, message.date))),
                react_1.default.createElement("div", { className: "comments-text" }, message.body),
                react_1.default.createElement("div", { className: "comments-votes" },
                    react_1.default.createElement("span", null, this.renderVotes()),
                    (!this.props.message.upvoteDisabled() || !this.props.message.downvoteDisabled()) &&
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("a", { onClick: this.downvote.bind(this), disabled: this.props.message.downvoteDisabled() },
                                react_1.default.createElement("span", { className: 'item' },
                                    react_1.default.createElement("i", { className: "fa fa-thumbs-down fa-lg" }))),
                            react_1.default.createElement("a", { onClick: this.upvote.bind(this), disabled: this.props.message.upvoteDisabled() },
                                react_1.default.createElement("span", { className: 'item' },
                                    react_1.default.createElement("i", { className: "fa fa-thumbs-up fa-lg" })))),
                    (this.state.children.length > 0 || message.parent === '0x0') &&
                        react_1.default.createElement("span", { className: 'item' },
                            message.parent === '0x0' && react_1.default.createElement("a", { className: "reply", onClick: this.showReplyForm.bind(this) },
                                react_1.default.createElement("span", null, "Reply")),
                            this.state.children.length > 0 &&
                                react_1.default.createElement("span", null,
                                    this.state.showReplies &&
                                        react_1.default.createElement("a", { onClick: function () { return _this.showReplies(!_this.state.showReplies); } },
                                            " ",
                                            react_1.default.createElement("em", { className: "blue" }, "Hide Replies ")),
                                    !this.state.showReplies &&
                                        react_1.default.createElement("a", { onClick: function () { return _this.showReplies(!_this.state.showReplies); } },
                                            " ",
                                            react_1.default.createElement("em", { className: "blue" }, "Show Replies"),
                                            " (",
                                            message.children.length,
                                            ")")))),
                react_1.default.createElement("ul", null, this.state.showReplies && this.renderReplies()),
                this.state.showReplyForm &&
                    react_1.default.createElement(MessageForm_1.default, { onSubmit: function (message) { return _this.reply(message); } }))));
    };
    return Message;
}(react_1.default.Component));
exports.default = Message;
//# sourceMappingURL=Message.js.map