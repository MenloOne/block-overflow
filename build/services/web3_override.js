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
// Overrides metamask v0.2 for 1.0 version.
// 1.0 lets us use async and await instead of promises.
var web3_1 = tslib_1.__importDefault(require("web3"));
// Overrides metamask v0.2 for our v 1.0
var web3;
if (window.web3) {
    web3 = new web3_1.default(window.web3.currentProvider);
    web3.eth.defaultAccount = window.web3.eth.defaultAccount;
}
exports.default = web3;
//# sourceMappingURL=web3_override.js.map