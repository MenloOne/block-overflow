"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var RemoteIPFSStorage_1 = require("../storage/RemoteIPFSStorage");
var Message = /** @class */ (function (_super) {
    tslib_1.__extends(Message, _super);
    function Message(forum, id, parent, offset) {
        var _this = _super.call(this) || this;
        _this.forum = forum;
        _this.id = id;
        _this.parent = parent;
        _this.offset = offset;
        _this.children = [];
        _this.votes = 0;
        _this.myvotes = 0;
        _this.body = 'Loading from IPFS...';
        return _this;
    }
    Message.prototype.votesDisabled = function () {
        return (this.author === this.forum.account || this.forum.lottery.hasEnded);
    };
    Message.prototype.upvoteDisabled = function () {
        return (this.votesDisabled() || this.myvotes > 0);
    };
    Message.prototype.downvoteDisabled = function () {
        return (this.votesDisabled() || this.myvotes < 0);
    };
    return Message;
}(RemoteIPFSStorage_1.IPFSMessage));
exports.default = Message;
//# sourceMappingURL=Message.js.map