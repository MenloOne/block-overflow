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
var AccountService_1 = require("../services/AccountService");
var TopicForm = /** @class */ (function (_super) {
    tslib_1.__extends(TopicForm, _super);
    function TopicForm(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            message: '',
            submitting: false
        };
        _this.onChange = _this.onChange.bind(_this);
        _this.onCancel = _this.onCancel.bind(_this);
        _this.onSubmit = _this.onSubmit.bind(_this);
        return _this;
    }
    TopicForm.prototype.componentWillReceiveProps = function (newProps) {
        this.refreshForum(newProps);
    };
    TopicForm.prototype.refreshForum = function (newProps) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    TopicForm.prototype.onSubmit = function (event) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.preventDefault();
                        this.setState({ submitting: true });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.props.onSubmit(this.state.message)];
                    case 2:
                        _a.sent();
                        this.setState({
                            message: '',
                            submitting: false,
                            error: null
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        this.setState({
                            error: e_1.message,
                            submitting: false,
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TopicForm.prototype.onChange = function (event) {
        this.setState({ message: event.target.value });
    };
    TopicForm.prototype.onCancel = function () {
        this.setState({ message: '' });
    };
    TopicForm.prototype.render = function () {
        return (react_1.default.createElement("form", { onSubmit: this.onSubmit },
            react_1.default.createElement("textarea", { name: "", className: "field", id: "", cols: "30", rows: "10", value: this.state.message, onChange: this.onChange }),
            react_1.default.createElement("input", { type: "submit", className: "btn submit-btn", disabled: this.state.submitting }),
            react_1.default.createElement("a", { href: "", className: "btn cancel-btn", onClick: this.onCancel }, "Cancel"),
            this.state.error && react_1.default.createElement("p", { className: "error new-message" }, this.state.error)));
    };
    return TopicForm;
}(react_1.default.Component));
exports.default = AccountService_1.withAcct(TopicForm);
//# sourceMappingURL=TopicForm.js.map