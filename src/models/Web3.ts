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

// Overrides metamask v0.2 for 1.0 version.
// 1.0 lets us use async and await instead of promises.

let web3 : any = Object.assign({})

if (window.web3) {

    const Web3 = require('web3')

    // Modern dapp browsers...
    if (window.ethereum) {
        const ethereum = window.ethereum

        window.web3 = new Web3(ethereum);
        web3 = window.web3 as any

        // Legacy dapp browsers...
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        web3 = window.web3 as any

        // Non-dapp browsers...
    } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
}

export default web3
