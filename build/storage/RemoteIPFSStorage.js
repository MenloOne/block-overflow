"use strict";
/*
 * Copyright 2018 Menlo One, Inc.
 * Copyright 2018 Vulcanize, Inc.
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
var ipfs_api_1 = tslib_1.__importDefault(require("ipfs-api"));
var PromiseTimeout_1 = tslib_1.__importStar(require("../utils/PromiseTimeout"));
var IPFSMessage = /** @class */ (function () {
    function IPFSMessage() {
    }
    return IPFSMessage;
}());
exports.IPFSMessage = IPFSMessage;
var IPFSTopic = /** @class */ (function () {
    function IPFSTopic() {
    }
    return IPFSTopic;
}());
exports.IPFSTopic = IPFSTopic;
var RemoteIPFSStorage = /** @class */ (function () {
    function RemoteIPFSStorage() {
        // this.ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
        this.ipfs = ipfs_api_1.default('ipfs.menlo.one', '443', { protocol: 'https' });
    }
    RemoteIPFSStorage.prototype.createMessage = function (message) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var file, result, hash;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        file = {
                            path: "/" + message.topic + "/" + message.offset + ".json",
                            content: Buffer.from(JSON.stringify(message))
                        };
                        return [4 /*yield*/, this.ipfs.files.add([file], { pin: true })];
                    case 1:
                        result = _a.sent();
                        hash = result[0].hash;
                        /*
                        console.log(`Created ${hash}`)
                
                        const list = await this.ipfs.pin.ls()
                        console.log(list.filter(l => l.hash === hash))
                
                        const add = await this.ipfs.pin.add(hash)
                
                        const list2 = await this.ipfs.pin.ls()
                        console.log(list.filter(l => l.hash === hash))
                
                        Test
                        const hashSolidity = HashUtils.cidToSolidityHash(hash)
                        const ipfsHash = HashUtils.solidityHashToCid(hashSolidity)
                
                        let files = await this.ipfs.files.get(ipfsHash)
                        let ipfsMessage = JSON.parse(files[0].content.toString('utf8'))
                        console.log(`Stored ${ipfsMessage}`)
                         */
                        return [2 /*return*/, hash];
                }
            });
        });
    };
    RemoteIPFSStorage.prototype.createTopic = function (topic) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var file, result, hash;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        file = {
                            path: "/" + topic.offset + "/Topic.json",
                            content: Buffer.from(JSON.stringify(topic))
                        };
                        return [4 /*yield*/, this.ipfs.files.add([file], { pin: true })];
                    case 1:
                        result = _a.sent();
                        hash = result[0].hash;
                        /*
                        console.log(`Created ${hash}`)
                
                        const list = await this.ipfs.pin.ls()
                        console.log(list.filter(l => l.hash === hash))
                
                        const add = await this.ipfs.pin.add(hash)
                
                        const list2 = await this.ipfs.pin.ls()
                        console.log(list.filter(l => l.hash === hash))
                
                        Test
                        const hashSolidity = HashUtils.cidToSolidityHash(hash)
                        const ipfsHash = HashUtils.solidityHashToCid(hashSolidity)
                
                        let files = await this.ipfs.files.get(ipfsHash)
                        let ipfsMessage = JSON.parse(files[0].content.toString('utf8'))
                        console.log(`Stored ${ipfsMessage}`)
                         */
                        return [2 /*return*/, hash];
                }
            });
        });
    };
    RemoteIPFSStorage.prototype.get = function (hash) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var files;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PromiseTimeout_1.default(10000, this.ipfs.files.get(hash))];
                    case 1:
                        files = _a.sent();
                        return [2 /*return*/, JSON.parse(files[0].content.toString('utf8'))];
                }
            });
        });
    };
    RemoteIPFSStorage.prototype.fillMessage = function (message) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var ipfsMessage, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("IPFS Files Get " + message.id);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.get(message.id)];
                    case 2:
                        ipfsMessage = _a.sent();
                        Object.assign(message, ipfsMessage);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        if (e_1 instanceof PromiseTimeout_1.Timeout) {
                            // TODO: Kill outstanding connection
                        }
                        throw (e_1);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RemoteIPFSStorage.prototype.pin = function (hash) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ipfs.pin.add(hash)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RemoteIPFSStorage.prototype.unpin = function (hash) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Unpinning " + hash);
                        return [4 /*yield*/, this.ipfs.pin.rm(hash)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RemoteIPFSStorage;
}());
exports.default = RemoteIPFSStorage;
//# sourceMappingURL=RemoteIPFSStorage.js.map