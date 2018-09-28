"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var RemoteIPFSStorage_1 = require("../storage/RemoteIPFSStorage");
var Topic = /** @class */ (function (_super) {
    tslib_1.__extends(Topic, _super);
    function Topic(topics, forumAddress, offset) {
        var _this = _super.call(this) || this;
        _this.topics = topics;
        _this.forumAddress = forumAddress;
        _this.offset = offset;
        _this.metadata = null;
        _this.filled = false;
        _this.body = 'Loading from IPFS...';
        return _this;
    }
    Object.defineProperty(Topic.prototype, "id", {
        get: function () {
            return this.forumAddress;
        },
        enumerable: true,
        configurable: true
    });
    Topic.prototype.refreshMetadata = function (address) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.topics.ready];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Topic.prototype.fill = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var contract, md;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.topics.ready];
                    case 1:
                        _a.sent();
                        contract = this.topics.contract;
                        return [4 /*yield*/, contract.forums(this.forumAddress)];
                    case 2:
                        md = _a.sent();
                        this.metadata = {
                            messageHash: md[0].toString(16),
                            isClosed: md[1],
                            payout: md[2].toNumber(),
                            votes: md[3].toNumber(),
                            winner: md[4]
                        };
                        return [4 /*yield*/, this.topics.remoteStorage.get(this.metadata.messageHash)];
                    case 3:
                        _a.sent();
                        this.filled = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    return Topic;
}(RemoteIPFSStorage_1.IPFSTopic));
exports.default = Topic;
//# sourceMappingURL=Topic.js.map