"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importStar(require("react"));
var prop_types_1 = tslib_1.__importDefault(require("prop-types"));
var react_countdown_now_1 = tslib_1.__importDefault(require("react-countdown-now"));
require("../App.scss");
var CountdownTimer = /** @class */ (function (_super) {
    tslib_1.__extends(CountdownTimer, _super);
    function CountdownTimer() {
        var _this = _super.call(this) || this;
        _this.renderer = _this.renderer.bind(_this);
        return _this;
    }
    CountdownTimer.prototype.renderer = function (_a) {
        var days = _a.days, hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds, completed = _a.completed;
        if (completed) {
            if (this.props.renderCompleted) {
                this.props.renderCompleted();
            }
            return null;
        }
        return (react_1.default.createElement("div", { className: "time-watch" },
            parseInt(days, 10) > 0 && (react_1.default.createElement("span", null,
                react_1.default.createElement("div", null,
                    days,
                    react_1.default.createElement("span", null, "Days")),
                react_1.default.createElement("div", { className: "dots" }, ":"))),
            react_1.default.createElement("div", null,
                hours,
                react_1.default.createElement("span", null, "Hours")),
            react_1.default.createElement("div", { className: "dots" }, ":"),
            react_1.default.createElement("div", null,
                minutes,
                react_1.default.createElement("span", null, "Minutes")),
            react_1.default.createElement("div", { className: "dots" }, ":"),
            react_1.default.createElement("div", null,
                seconds,
                react_1.default.createElement("span", null, "Seconds"))));
    };
    CountdownTimer.prototype.render = function () {
        return (react_1.default.createElement(react_countdown_now_1.default, { date: this.props.date, zeroPadLength: 2, renderer: this.renderer }));
    };
    CountdownTimer.propTypes = {
        date: prop_types_1.default.object.isRequired,
    };
    return CountdownTimer;
}(react_1.Component));
exports.default = CountdownTimer;
//# sourceMappingURL=CountdownTimer.js.map