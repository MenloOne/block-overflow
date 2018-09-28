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
var RemoteIPFSStorage_1 = tslib_1.__importDefault(require("../storage/RemoteIPFSStorage"));
var HashUtils_1 = tslib_1.__importDefault(require("../storage/HashUtils"));
var QPromise_1 = require("../utils/QPromise");
var MenloToken_json_1 = tslib_1.__importDefault(require("../build-contracts/MenloToken.json"));
var MenloTopics_json_1 = tslib_1.__importDefault(require("../build-contracts/MenloTopics.json"));
var MenloTopics_1 = require("../.contracts/MenloTopics");
var MenloToken_1 = require("../.contracts/MenloToken");
var Topic_1 = tslib_1.__importDefault(require("./Topic"));
var TOPIC_LENGTH = 15 * 60; /* 15 Minutes */
var TopicsService = /** @class */ (function () {
    function TopicsService() {
        var _this = this;
        this.topics = [];
        this.ready = QPromise_1.QPromise(function (resolve) { _this.signalReady = resolve; });
        this.synced = QPromise_1.QPromise(function (resolve) { _this.signalSynced = resolve; });
        this.remoteStorage = new RemoteIPFSStorage_1.default();
        this.account = null;
        this.topicsCallback = null;
    }
    TopicsService.prototype.setAccount = function (acct) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var tokenContract, _a, _b, _c, _d, topicsContract, topicAddress, _e, _f, newTopic, e_1;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (acct.address === this.account) {
                            return [2 /*return*/];
                        }
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 10, , 11]);
                        this.account = acct.address;
                        this.refreshTokenBalance = acct.refreshBalance;
                        tokenContract = truffle_contract_1.default(MenloToken_json_1.default);
                        return [4 /*yield*/, tokenContract.setProvider(web3_override_1.default.currentProvider)];
                    case 2:
                        _g.sent();
                        tokenContract.defaults({ from: this.account });
                        _a = this;
                        return [4 /*yield*/, tokenContract.deployed()];
                    case 3:
                        _a.tokenContractJS = _g.sent();
                        _b = this;
                        _c = MenloToken_1.MenloToken.bind;
                        _d = [void 0, web3_override_1.default];
                        return [4 /*yield*/, tokenContract.deployed()];
                    case 4:
                        _b.tokenContract = new (_c.apply(MenloToken_1.MenloToken, _d.concat([(_g.sent()).address])))();
                        topicsContract = truffle_contract_1.default(MenloTopics_json_1.default);
                        return [4 /*yield*/, topicsContract.setProvider(web3_override_1.default.currentProvider)];
                    case 5:
                        _g.sent();
                        topicsContract.defaults({ from: this.account });
                        return [4 /*yield*/, topicsContract.deployed()];
                    case 6:
                        topicAddress = (_g.sent()).address;
                        _e = this;
                        return [4 /*yield*/, MenloTopics_1.MenloTopics.createAndValidate(web3_override_1.default, topicAddress)];
                    case 7:
                        _e.contract = _g.sent();
                        this.filledMessagesCounter = 0;
                        this.topicOffsets = {};
                        this.topicHashes = [];
                        _f = this;
                        return [4 /*yield*/, this.contract.topicsCount];
                    case 8:
                        _f.initialTopicCount = (_g.sent()).toNumber();
                        return [4 /*yield*/, this.contract.ACTION_NEWTOPIC];
                    case 9:
                        newTopic = (_g.sent()).toNumber();
                        this.actions = { newTopic: newTopic };
                        this.watchForTopics();
                        this.signalReady();
                        if (this.initialTopicCount === 0) {
                            this.signalSynced();
                        }
                        this.onModifiedTopic(null);
                        return [3 /*break*/, 11];
                    case 10:
                        e_1 = _g.sent();
                        console.error(e_1);
                        throw (e_1);
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    TopicsService.prototype.topicOffset = function (id) {
        return this.topicOffsets[id];
    };
    TopicsService.prototype.watchForTopics = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var topics;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready];
                    case 1:
                        _a.sent();
                        topics = this.contract;
                        topics.NewTopicEvent({}).watch({}, function (error, result) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var forumAdddress, offset, message;
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (error) {
                                            console.error(error);
                                            return [2 /*return*/];
                                        }
                                        forumAdddress = HashUtils_1.default.solidityHashToCid(result.args._forum);
                                        if (!(typeof this.topicOffsets[forumAdddress] === 'undefined')) return [3 /*break*/, 2];
                                        offset = this.topicHashes.length;
                                        console.log("[[ Topic ]] ( " + offset + " ) " + forumAdddress);
                                        this.topicOffsets[forumAdddress] = offset;
                                        this.topicHashes.push(forumAdddress);
                                        message = new Topic_1.default(this, forumAdddress, offset);
                                        return [4 /*yield*/, message.fill()];
                                    case 1:
                                        _a.sent();
                                        this.topics.push(message);
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    TopicsService.prototype.subscribeTopics = function (callback) {
        this.topicsCallback = callback;
    };
    TopicsService.prototype.onModifiedTopic = function (topic) {
        // Send message back
        if (this.topicsCallback) {
            this.topicsCallback(topic);
        }
    };
    TopicsService.prototype.getTopic = function (id) {
        return this.topics[this.topicOffset(id)];
    };
    TopicsService.prototype.getTopics = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.topics];
            });
        });
    };
    TopicsService.prototype.createTopic = function (body, bounty) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var contract, ipfsMessage, ipfsHash, hashSolidity, result, e_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready];
                    case 1:
                        _a.sent();
                        contract = this.contract;
                        ipfsMessage = {
                            version: 1,
                            offset: this.topicHashes.length,
                            author: this.account,
                            date: Date.now(),
                            body: body,
                        };
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.remoteStorage.createTopic(ipfsMessage)];
                    case 3:
                        // Create message and pin it to remote IPFS
                        ipfsHash = _a.sent();
                        hashSolidity = HashUtils_1.default.cidToSolidityHash(ipfsHash);
                        // Send it to Blockchain
                        console.log('token ', this.tokenContractJS.address, ' topic ', contract.address, ' bounty ', bounty * Math.pow(10, 18), ' action ', this.actions.newTopic);
                        return [4 /*yield*/, this.tokenContractJS.transferAndCall(contract.address, bounty * Math.pow(10, 18), this.actions.newTopic, [hashSolidity, TOPIC_LENGTH])];
                    case 4:
                        result = _a.sent();
                        console.log(result);
                        return [2 /*return*/, tslib_1.__assign({ id: ipfsHash }, ipfsMessage)];
                    case 5:
                        e_2 = _a.sent();
                        if (ipfsHash) {
                            // Failed - unpin it from ipfs.menlo.one
                            // this.localStorage.rm(ipfsHash)
                            this.remoteStorage.unpin(ipfsHash);
                        }
                        console.error(e_2);
                        throw e_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return TopicsService;
}());
exports.default = TopicsService;
//# sourceMappingURL=TopicsService.js.map