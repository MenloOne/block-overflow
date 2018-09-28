"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Lottery = /** @class */ (function () {
    function Lottery(_forum) {
        this.endTime = 0;
        this.endTimeServer = 0;
        this.author = '';
        this.pool = 0;
        this.willReconcile = false;
        this.hasEnded = false;
        this.claimed = false;
        this.iWon = false;
        this.forum = _forum;
        this.claimed = false;
        this.refresh = this.refresh.bind(this);
    }
    Lottery.prototype.refresh = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, contract, _b, now, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.forum.synced];
                    case 1:
                        _d.sent();
                        contract = this.forum.contract;
                        return [4 /*yield*/, Promise.all([contract.pool, contract.endTimestamp])];
                    case 2:
                        _a = (_d.sent()).map(function (n) { return n.toNumber(); }), this.pool = _a[0], this.endTimeServer = _a[1];
                        if (!this.endTime) {
                            this.endTime = this.endTimeServer;
                        }
                        _b = this;
                        return [4 /*yield*/, contract.author];
                    case 3:
                        _b.author = _d.sent();
                        this.winner = this.calcWinner();
                        now = (new Date()).getTime();
                        this.hasEnded = (this.endTimeServer < now);
                        this.willReconcile = (this.hasEnded && (this.winner !== null));
                        if (!(this.hasEnded && !this.willReconcile)) return [3 /*break*/, 5];
                        _c = this;
                        return [4 /*yield*/, contract.winner];
                    case 4:
                        _c.winner = _d.sent();
                        _d.label = 5;
                    case 5:
                        this.updateEndTimeTimer();
                        this.iWon = this.winner === this.forum.account;
                        return [2 /*return*/];
                }
            });
        });
    };
    Lottery.prototype.noWinners = function () {
        return this.author === this.winner;
    };
    Lottery.prototype.subscribe = function (callback) {
        this.lotteriesCallback = callback;
    };
    Lottery.prototype.markClaimed = function () {
        this.claimed = true;
    };
    Lottery.prototype.updateEndTimeTimer = function () {
        var _this = this;
        var now = (new Date()).getTime();
        if (this.endTime < now) {
            // We're in a weird state where the server will continue the current lottery
            // as soon as someone pays up.  Assume more time
            this.endTime = (new Date(now + this.forum.lotteryLength)).getTime();
        }
        if (this.lotteryTimeout) {
            clearTimeout(this.lotteryTimeout);
            this.lotteryTimeout = null;
        }
        if (now < this.endTime) {
            this.lotteryTimeout = setTimeout(function () {
                _this.refresh;
            }, this.endTime - now);
        }
    };
    Lottery.prototype.calcWinningMessage = function () {
        var _a = [1, this.forum.topicHashes.length], from = _a[0], to = _a[1];
        if (to <= from) {
            return null;
        }
        var eligibleMessages = [];
        for (var i = from; i < to; i++) {
            var msg = this.forum.getMessage(this.forum.topicHashes[i]);
            if (!msg || msg.votes <= 0) {
                continue;
            }
            eligibleMessages.push(msg);
        }
        // No votes, no winners
        if (eligibleMessages.length === 0) {
            return null;
        }
        // Sort by votes descending, then offset ascending
        var winners = eligibleMessages.sort(function (a, b) {
            var diff = b.votes - a.votes;
            return (diff === 0) ? a.offset - b.offset : diff;
        }).filter(function (m) { return m != null && typeof m !== 'undefined'; });
        // Filter out nulls
        return winners.length > 0 ? winners[0] : null;
    };
    Lottery.prototype.calcWinner = function () {
        var m = this.calcWinningMessage();
        if (!m) {
            return null;
        }
        return m.author;
    };
    Lottery.prototype.claimWinnings = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.forum.ready];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.forum.contract.claimTx().send({})];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        console.error(e_1);
                        throw (e_1);
                    case 5:
                        this.forum.refreshBalances();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Lottery;
}());
exports.default = Lottery;
//# sourceMappingURL=Lottery.js.map