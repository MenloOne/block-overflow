"use strict";
/*
 * Copyright 2018 Menlo One, Inc.
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
var web3_override_1 = tslib_1.__importDefault(require("./web3_override"));
var truffle_contract_1 = tslib_1.__importDefault(require("truffle-contract"));
var MessageBoardGraph_1 = tslib_1.__importDefault(require("../messaging/MessageBoardGraph"));
var RemoteIPFSStorage_1 = tslib_1.__importDefault(require("../storage/RemoteIPFSStorage"));
var HashUtils_1 = tslib_1.__importDefault(require("../storage/HashUtils"));
var QPromise_1 = require("../utils/QPromise");
var MenloToken_json_1 = tslib_1.__importDefault(require("../build-contracts/MenloToken.json"));
var MenloForum_1 = require("../.contracts/MenloForum");
var MenloToken_1 = require("../.contracts/MenloToken");
var Lottery_1 = tslib_1.__importDefault(require("./Lottery"));
var Message_1 = tslib_1.__importDefault(require("./Message"));
var address0 = '0x0000000000000000000000000000000000000000000000000000000000000000';
var ForumService = /** @class */ (function () {
    function ForumService(forumAddress) {
        var _this = this;
        this.ready = QPromise_1.QPromise(function (resolve) { _this.signalReady = resolve; });
        this.synced = QPromise_1.QPromise(function (resolve) { _this.signalSynced = resolve; });
        this.contractAddress = forumAddress;
        this.remoteStorage = new RemoteIPFSStorage_1.default();
        this.messages = new MessageBoardGraph_1.default();
        this.account = null;
        this.messagesCallbacks = {};
        this.lottery = new Lottery_1.default(this);
    }
    ForumService.prototype.setAccount = function (acct) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var tokenContract, _a, _b, _c, _d, _e, _f, _g, _h, post, upvote, downvote, _j, _k, _l, _m, bn1, bn4, e_1;
            return tslib_1.__generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        if (acct.address === this.account) {
                            return [2 /*return*/];
                        }
                        _o.label = 1;
                    case 1:
                        _o.trys.push([1, 10, , 11]);
                        this.account = acct.address;
                        this.refreshTokenBalance = acct.refreshBalance;
                        tokenContract = truffle_contract_1.default(MenloToken_json_1.default);
                        return [4 /*yield*/, tokenContract.setProvider(web3_override_1.default.currentProvider)];
                    case 2:
                        _o.sent();
                        tokenContract.defaults({ from: this.account });
                        _a = this;
                        _b = MenloToken_1.MenloToken.bind;
                        _c = [void 0, web3_override_1.default];
                        return [4 /*yield*/, tokenContract.deployed()];
                    case 3:
                        _a.tokenContract = new (_b.apply(MenloToken_1.MenloToken, _c.concat([(_o.sent()).address])))();
                        this.filledMessagesCounter = 0;
                        this.topicOffsets = {};
                        this.topicHashes = [];
                        /*
                        const forumContract = TruffleContract(ForumContract)
                        await forumContract.setProvider(web3.currentProvider)
                        forumContract.defaults({ from: this.account })
                        */
                        _d = this;
                        return [4 /*yield*/, MenloForum_1.MenloForum.createAndValidate(web3_override_1.default, this.contractAddress)];
                    case 4:
                        /*
                        const forumContract = TruffleContract(ForumContract)
                        await forumContract.setProvider(web3.currentProvider)
                        forumContract.defaults({ from: this.account })
                        */
                        _d.contract = _o.sent();
                        _e = this;
                        _g = (_f = this.remoteStorage).get;
                        return [4 /*yield*/, this.contract.topicHash];
                    case 5: return [4 /*yield*/, _g.apply(_f, [_o.sent()])];
                    case 6:
                        _e.topic = _o.sent();
                        _k = (_j = Promise).all;
                        _l = [this.contract.ACTION_POST, this.contract.ACTION_UPVOTE];
                        return [4 /*yield*/, this.contract.ACTION_DOWNVOTE];
                    case 7: return [4 /*yield*/, _k.apply(_j, [_l.concat([_o.sent()])])];
                    case 8:
                        _h = _o.sent(), post = _h[0], upvote = _h[1], downvote = _h[2];
                        this.actions = { post: post, upvote: upvote, downvote: downvote };
                        return [4 /*yield*/, Promise.all([
                                this.contract.postCount,
                                this.contract.epochLength
                            ])];
                    case 9:
                        _m = _o.sent(), bn1 = _m[0], bn4 = _m[1];
                        this.initialSyncEpoch = bn1.toNumber() - 1;
                        this.lotteryLength = bn4.toNumber() * 1000;
                        // Figure out cost for post
                        // this.postGas = await this.tokenContract.transferAndCall.estimateGas(this.contract.address, 1 * 10**18, this.actions.post, ['0x0', '0x0000000000000000000000000000000000000000000000000000000000000000'])
                        // this.voteGas = await this.tokenContract.transferAndCall.estimateGas(this.contract.address, 1 * 10**18, this.actions.upvote, ['0x0000000000000000000000000000000000000000000000000000000000000000'])
                        // console.log(`postGas ${this.postGas}, voteGas ${this.voteGas}`)
                        this.watchForAnswers();
                        this.watchForVotes();
                        this.watchForComments();
                        this.watchForPayouts();
                        this.lottery.refresh();
                        this.signalReady();
                        if (this.initialSyncEpoch === 0) {
                            this.signalSynced();
                        }
                        return [3 /*break*/, 11];
                    case 10:
                        e_1 = _o.sent();
                        console.error(e_1);
                        throw (e_1);
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    ForumService.prototype.topicOffset = function (id) {
        return this.topicOffsets[id];
    };
    ForumService.prototype.watchForPayouts = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var forum;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.synced];
                    case 1:
                        _a.sent();
                        forum = this.contract;
                        forum.PayoutEvent({}).watch({}, function (error, result) {
                            if (error) {
                                console.error(error);
                                return;
                            }
                            var payout = {
                                tokens: result.args._tokens,
                                user: result.args._user
                            };
                            console.log('[[ Payout ]] ', payout);
                            if (payout.user.toLowerCase() === _this.account) {
                                _this.lottery.markClaimed();
                                _this.lottery.refresh();
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ForumService.prototype.watchForVotes = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var forum;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.synced];
                    case 1:
                        _a.sent();
                        forum = this.contract;
                        forum.VoteEvent({}).watch({}, function (error, result) {
                            if (error) {
                                console.error(error);
                                return;
                            }
                            var offset = result.args._offset;
                            var direction = result.args._direction;
                            console.log("[[ Vote ]] ( " + offset + " ) ^v " + direction);
                            var message = _this.messages.get(_this.topicHashes[offset]);
                            if (message) {
                                _this.updateVotesData(message, 0);
                                _this.onModifiedMessage(message);
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ForumService.prototype.watchForAnswers = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var forum;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready];
                    case 1:
                        _a.sent();
                        forum = this.contract;
                        forum.AnswerEvent({}).watch({}, function (error, result) {
                            if (error) {
                                console.error(error);
                                return;
                            }
                            var parentHash = address0;
                            var messageHash = HashUtils_1.default.solidityHashToCid(result.args.contentHash);
                            if (parentHash === messageHash) {
                                console.log("[[ Topic ]] " + parentHash + " > " + messageHash);
                                // Probably 0x0 > 0x0 which Solidity adds to make life simple
                                _this.topicOffsets[messageHash] = _this.topicHashes.length;
                                _this.topicHashes.push(messageHash);
                                return;
                            }
                            if (typeof _this.topicOffsets[messageHash] === 'undefined') {
                                var offset = _this.topicHashes.length;
                                console.log("[[ Answer ]] ( " + offset + " ) " + messageHash);
                                _this.topicOffsets[messageHash] = offset;
                                _this.topicHashes.push(messageHash);
                                var message = new Message_1.default(_this, messageHash, parentHash, offset);
                                _this.messages.add(message);
                                _this.fillMessage(message.id);
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ForumService.prototype.watchForComments = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var forum;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready];
                    case 1:
                        _a.sent();
                        forum = this.contract;
                        forum.CommentEvent({}).watch({}, function (error, result) {
                            if (error) {
                                console.error(error);
                                return;
                            }
                            var parentHash = HashUtils_1.default.solidityHashToCid(result.args._parentHash);
                            var messageHash = HashUtils_1.default.solidityHashToCid(result.args.contentHash);
                            console.log("[[ Topic ]] " + parentHash + " > " + messageHash);
                            var message = new Message_1.default(_this, messageHash, parentHash, -1);
                            _this.messages.add(message);
                            _this.fillMessage(message.id);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ForumService.prototype.fillMessage = function (id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var message, e_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready];
                    case 1:
                        _a.sent();
                        message = this.messages.get(id);
                        if (!message) {
                            throw (new Error("Unable to get message " + id));
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 6]);
                        return [4 /*yield*/, Promise.all([this.updateVotesData(message, 0), this.remoteStorage.fillMessage(message)])];
                    case 3:
                        _a.sent();
                        message.filled = true;
                        // console.log('onModified ',message)
                        this.onModifiedMessage(message);
                        return [3 /*break*/, 6];
                    case 4:
                        e_2 = _a.sent();
                        // Couldn't fill message, throw it away for now
                        this.messages.delete(message);
                        console.error(e_2);
                        message.error = e_2;
                        message.body = 'IPFS Connectivity Issue. Retrying...';
                        return [3 /*break*/, 6];
                    case 5:
                        this.filledMessagesCounter++;
                        if (this.filledMessagesCounter >= this.initialSyncEpoch) {
                            this.signalSynced();
                        }
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ForumService.prototype.subscribeMessages = function (parentID, callback) {
        this.messagesCallbacks[parentID] = callback;
    };
    ForumService.prototype.subscribeLotteries = function (callback) {
        this.lottery.subscribe(callback);
    };
    ForumService.prototype.updateVotesData = function (message, delta) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var forum, _a, votes, myvotes;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.ready];
                    case 1:
                        _b.sent();
                        forum = this.contract;
                        if (!delta) return [3 /*break*/, 2];
                        message.votes += delta;
                        message.myvotes += delta;
                        return [3 /*break*/, 4];
                    case 2:
                        if (!message || !message.id) {
                            throw (new Error('invalid Topic ID'));
                        }
                        return [4 /*yield*/, Promise.all([
                                forum.votes.call(this.topicOffset(message.id)),
                                forum.voters.call(this.topicOffset(message.id), this.account)
                            ])];
                    case 3:
                        _a = _b.sent(), votes = _a[0], myvotes = _a[1];
                        message.votes = votes.toNumber();
                        message.myvotes = myvotes.toNumber();
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ForumService.prototype.onModifiedMessage = function (message) {
        // Send message back
        var callback = this.messagesCallbacks[message.parent];
        if (callback) {
            callback(message);
        }
        this.refreshBalances();
        this.lottery.refresh();
    };
    Object.defineProperty(ForumService.prototype, "rewardPool", {
        get: function () {
            return this.lottery.pool;
        },
        enumerable: true,
        configurable: true
    });
    ForumService.prototype.refreshBalances = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready];
                    case 1:
                        _a.sent();
                        this.refreshTokenBalance();
                        return [2 /*return*/];
                }
            });
        });
    };
    ForumService.prototype.getMessage = function (id) {
        return this.messages.get(id);
    };
    ForumService.prototype.getChildrenMessages = function (id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var message;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                message = this.getMessage(id);
                if (!message || message.children.length === 0) {
                    return [2 /*return*/, []];
                }
                return [2 /*return*/, Promise.all(message.children.map(function (cid) { return _this.getMessage(cid); }).filter(function (m) { return m && m.body; }))];
            });
        });
    };
    ForumService.prototype.vote = function (id, direction) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var forum, action, tokenCost, message;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready];
                    case 1:
                        _a.sent();
                        forum = this.contract;
                        action = (direction > 0) ? this.actions.upvote : this.actions.downvote;
                        return [4 /*yield*/, forum.voteCost];
                    case 2:
                        tokenCost = _a.sent();
                        return [4 /*yield*/, this.tokenContract.transferAndCallTx(forum.address, tokenCost, action, this.topicOffset(id).toString()).send({})];
                    case 3:
                        _a.sent();
                        message = this.messages.get(id);
                        return [4 /*yield*/, this.updateVotesData(message, direction)];
                    case 4:
                        _a.sent();
                        this.onModifiedMessage(message);
                        return [2 /*return*/, message];
                }
            });
        });
    };
    ForumService.prototype.upvote = function (id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.vote(id, 1)];
            });
        });
    };
    ForumService.prototype.downvote = function (id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.vote(id, -1)];
            });
        });
    };
    ForumService.prototype.createMessage = function (body, parentHash) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var contract, ipfsMessage, ipfsHash, hashSolidity, parentHashSolidity, tokenCost, result, e_3;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready];
                    case 1:
                        _a.sent();
                        contract = this.contract;
                        ipfsMessage = {
                            version: 1,
                            topic: this.topic.offset,
                            offset: this.topicHashes.length,
                            parent: parentHash || '0x0',
                            author: this.account,
                            date: Date.now(),
                            body: body,
                        };
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, this.remoteStorage.createMessage(ipfsMessage)];
                    case 3:
                        // Create message and pin it to remote IPFS
                        ipfsHash = _a.sent();
                        hashSolidity = HashUtils_1.default.cidToSolidityHash(ipfsHash);
                        parentHashSolidity = ipfsMessage.parent;
                        if (parentHashSolidity !== '0x0') {
                            parentHashSolidity = HashUtils_1.default.cidToSolidityHash(parentHashSolidity);
                        }
                        return [4 /*yield*/, contract.postCost];
                    case 4:
                        tokenCost = _a.sent();
                        return [4 /*yield*/, this.tokenContract.transferAndCallTx(contract.address, tokenCost, this.actions.post, parentHashSolidity + hashSolidity).send({})];
                    case 5:
                        result = _a.sent();
                        console.log(result);
                        return [2 /*return*/, tslib_1.__assign({ id: ipfsHash }, ipfsMessage)];
                    case 6:
                        e_3 = _a.sent();
                        if (ipfsHash) {
                            // Failed - unpin it from ipfs.menlo.one
                            // this.localStorage.rm(ipfsHash)
                            this.remoteStorage.unpin(ipfsHash);
                        }
                        console.error(e_3);
                        throw e_3;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return ForumService;
}());
exports.default = ForumService;
//# sourceMappingURL=ForumService.js.map