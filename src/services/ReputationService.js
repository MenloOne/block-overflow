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

import web3 from '../web3_override'
import TruffleContract from 'truffle-contract'
import ReputationContract from '../truffle_artifacts/contracts/MenloReputation.json'

import QPromise from '../utils/QPromise'


class User {
    constructor(svc, acct, alias, rep) {
        this.svc = svc
        this.acct = acct
        this.alias = alias
        this.rep = rep
    }
}


export default class ReputationService {

    constructor() {
        this.ready = new QPromise((resolve) => { this.signalReady = resolve })

        this.account = null
        this.rep = null
        this.repContract = TruffleContract(ReputationContract)

        this.me = null
    }

    async setAccount(acct) {
        if (acct.account === this.account) {
            return
        }

        try {
            this.account = acct.account

            await this.repContract.setProvider(web3.currentProvider)
            this.repContract.defaults({
                from: this.account
            })
            this.rep = await this.repContract.deployed()

            const [alias, rep] = await Promise.all([this.rep.alias.call(this.account),
                                                    this.rep.reputation.call(this.account)])
            this.me = new User(this, this.account, alias, rep.toNumber())

            this.signalReady()

        } catch (e) {

            console.error(e)
            throw(e)
        }
    }

    async setAlias(alias) {
        await this.ready
        return this.rep.setAlias(alias)
    }


}