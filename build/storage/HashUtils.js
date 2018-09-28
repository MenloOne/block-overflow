"use strict";
/*
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
var multihashes_1 = tslib_1.__importDefault(require("multihashes"));
var multihashing_async_1 = tslib_1.__importDefault(require("multihashing-async"));
var cids_1 = tslib_1.__importDefault(require("cids"));
var ipld_dag_cbor_1 = tslib_1.__importDefault(require("ipld-dag-cbor"));
var waterfall_1 = tslib_1.__importDefault(require("async/waterfall"));
var thisExport = {};
thisExport.cidToSolidityHash = function (cid) {
    if (cid === '0x0') {
        return '0x0000000000000000000000000000000000000000000000000000000000000000';
    }
    var _cid = new cids_1.default(cid);
    var _multihash = _cid.multihash;
    var _hex = '0x' + multihashes_1.default.decode(_multihash).digest.toString('hex');
    return _hex;
};
thisExport.solidityHashToCid = function (_hash) {
    if (_hash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return '0x0';
    }
    var hash = _hash;
    if (hash.length === 66) {
        hash = hash.slice(2, 66);
    }
    var encodedHash = multihashes_1.default.encode(multihashes_1.default.fromHexString(hash), 'sha2-256');
    var _cid = new cids_1.default(0, 'dag-pb', encodedHash);
    var cid = _cid.toBaseEncodedString();
    return cid;
};
thisExport.nodeToCID = function (node, callback) {
    return waterfall_1.default([
        function (cb) { return ipld_dag_cbor_1.default.util.serialize(node, cb); },
        function (serialized, cb) { return multihashing_async_1.default(serialized, 'keccak-256', cb); },
        function (mh, cb) { return cb(null, new cids_1.default(1, 'dag-cbor', mh)); }
    ], callback);
};
exports.default = thisExport;
//# sourceMappingURL=HashUtils.js.map