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
var react_moment_1 = tslib_1.__importDefault(require("react-moment"));
var TopicForm_1 = tslib_1.__importDefault(require("./TopicForm"));
require("../App.scss");
require("./Topic.css");
var TopicComponent = /** @class */ (function (_super) {
    tslib_1.__extends(TopicComponent, _super);
    function TopicComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            showReplyForm: false,
            showReplies: true
        };
        return _this;
    }
    TopicComponent.prototype.componentDidMount = function () {
    };
    TopicComponent.prototype.componentWillUnmount = function () {
    };
    TopicComponent.prototype.reply = function (body) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setState({ showReplyForm: false });
                        return [4 /*yield*/, this.props.service.createTopic(body, 5)
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
                        _a.sent();
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
    TopicComponent.prototype.showReplies = function (show) {
        this.setState({ showReplies: show });
    };
    TopicComponent.prototype.showReplyForm = function () {
        this.setState({ showReplyForm: true });
        if (this.props.onChangeReplying) {
            this.props.onChangeReplying(true);
        }
    };
    TopicComponent.prototype.messageStatus = function () {
        return this.props.service.getTopic(this.props.topic.id) ? 'complete' : 'pending';
    };
    TopicComponent.prototype.messageComplete = function () {
        return this.messageStatus() === 'complete';
    };
    TopicComponent.prototype.messagePending = function () {
        return this.messageStatus() === 'pending';
    };
    TopicComponent.prototype.renderVotes = function () {
        var message = this.props.topic;
        var metadata = message.metadata;
        if (!metadata || metadata.votes === 0) {
            return null;
        }
        return (
        // tslint:disable-next-line
        react_1.default.createElement("span", { className: "votes-indicator item text-primary d-lg-block", negative: (metadata.votes < 0) ? 'true' : 'false' },
            react_1.default.createElement("div", { className: 'circle left' }),
            react_1.default.createElement("div", { className: 'circle mid' }, metadata.votes < 0 ?
                react_1.default.createElement("span", null,
                    react_1.default.createElement("i", { className: 'fa fa-fw fa-thumbs-down' }),
                    metadata.votes)
                :
                    react_1.default.createElement("span", null,
                        react_1.default.createElement("i", { className: 'fa fa-fw fa-thumbs-up' }),
                        metadata.votes)),
            react_1.default.createElement("div", { className: 'circle right' })));
    };
    TopicComponent.prototype.render = function () {
        var _this = this;
        var message = this.props.topic;
        return (react_1.default.createElement("li", { className: "borderis message" },
            react_1.default.createElement("div", { className: "content" },
                react_1.default.createElement("h3", { className: "tag-name" },
                    react_1.default.createElement("span", { className: "points", style: { display: 'none' } }, "??? points "),
                    react_1.default.createElement("span", { className: "time" },
                        react_1.default.createElement(react_moment_1.default, { fromNow: true }, message.date))),
                react_1.default.createElement("div", { className: "comments-text" }, message.body),
                this.state.showReplyForm &&
                    react_1.default.createElement(TopicForm_1.default, { onSubmit: function (message) { return _this.reply(message); } }))));
    };
    return TopicComponent;
}(react_1.default.Component));
exports.default = TopicComponent;
//# sourceMappingURL=Topic.js.map