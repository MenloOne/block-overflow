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

import web3 from './web3_override'
import TruffleContract from 'truffle-contract'
import BigNumber from 'bignumber.js'

import RemoteIPFSStorage, { IPFSTopic } from '../storage/RemoteIPFSStorage'
import HashUtils from '../storage/HashUtils'

import { QPromise } from '../utils/QPromise'

import TokenContract  from '../build-contracts/MenloToken.json'
import TopicsContract  from '../build-contracts/MenloTopics.json'
import { MenloTopics } from '../.contracts/MenloTopics'
import { MenloToken } from '../.contracts/MenloToken'

import AccountService from './AccountService'
import Topic from './Topic'


type NewTopicCallback = (topic: Topic | null) => void
const TOPIC_LENGTH = 15 * 60 /* 15 Minutes */

class TopicsService {

    // Private

    private signalReady: () => void
    private signalSynced: () => void

    // Public

    public ready: QPromise<void>
    public synced: QPromise<void>

    public tokenContract: MenloToken | null
    public tokenContractJS: any
    public contract: MenloTopics | null

    public actions: { newTopic }

    public account: string | null
    public remoteStorage: RemoteIPFSStorage
    public topics: Topic[] = []
    public topicsCallback: NewTopicCallback | null

    public initialTopicCount: number
    public filledMessagesCounter: number
    public topicOffsets: Map<string, number> | {}
    public topicHashes: string[]

    public refreshTokenBalance: () => void


    constructor() {
        this.ready  = QPromise((resolve) => { this.signalReady = resolve })
        this.synced = QPromise((resolve) => { this.signalSynced = resolve })

        this.remoteStorage = new RemoteIPFSStorage()
        this.account = null
        this.topicsCallback = null
    }

    async setAccount(acct : AccountService) {
        if (acct.address === this.account) {
            return
        }

        try {
            this.account = acct.address
            this.refreshTokenBalance = acct.refreshBalance

            const tokenContract = TruffleContract(TokenContract)
            await tokenContract.setProvider(web3.currentProvider)
            tokenContract.defaults({ from: this.account })

            this.tokenContractJS = await tokenContract.deployed()
            this.tokenContract   = new MenloToken(web3, (await tokenContract.deployed()).address)

            const topicsContract = TruffleContract(TopicsContract)
            await topicsContract.setProvider(web3.currentProvider)
            topicsContract.defaults({ from: this.account })
            const topicAddress = (await topicsContract.deployed()).address
            this.contract = await MenloTopics.createAndValidate(web3, topicAddress)

            this.filledMessagesCounter = 0
            this.topicOffsets = {}
            this.topicHashes = []
            this.initialTopicCount = (await this.contract.topicsCount).toNumber()

            const newTopic = (await this.contract.ACTION_NEWTOPIC).toNumber()
            this.actions = { newTopic }

            this.watchForTopics()

            this.signalReady()

            if (this.initialTopicCount === 0) {
                this.signalSynced()
            }

            this.onModifiedTopic(null)
        } catch (e) {
            console.error(e)
            throw(e)
        }
    }

    topicOffset(id : string) {
        return this.topicOffsets[id]
    }

    async watchForTopics() {
        await this.ready
        const topics = this.contract!

        topics.NewTopicEvent({}).watch({}, async (error, result) => {
            if (error) {
                console.error( error )
                return
            }

            const forumAdddress = result.args._forum.toString()

            if (typeof this.topicHashes[forumAdddress] === 'undefined') {
                const offset = this.topicHashes.length
                console.log(`[[ Topic ]] ( ${offset} ) ${forumAdddress}`)

                this.topicOffsets[forumAdddress] = offset
                this.topicHashes.push(forumAdddress)

                const message = new Topic( this, forumAdddress, offset )
                await message.fill()

                this.topics.push(message)

                this.onModifiedTopic(message)
            }
        })
    }


    subscribeTopics(callback : NewTopicCallback | null) {
        this.topicsCallback = callback
    }


    onModifiedTopic(topic : Topic | null) {
        // Send message back
        if (this.topicsCallback) {
            this.topicsCallback(topic)
        }
    }
    
    getTopic(id : string) : Topic {
        return this.topics[this.topicOffset(id)]
    }

    async getTopics() : Promise<Topic[]> {
        return this.topics
    }

    async createTopic(body: string, bounty: number) : Promise<object> {
        await this.ready
        const contract = this.contract!

        const ipfsMessage : IPFSTopic = {
            version: 1,
            offset: this.topicHashes.length,
            author: this.account!,
            date: Date.now(),
            body,
        }

        let ipfsHash

        try {
            // Create message and pin it to remote IPFS
            ipfsHash = await this.remoteStorage.createTopic(ipfsMessage)

            const hashSolidity = HashUtils.cidToSolidityHash(ipfsHash)

            // Send it to Blockchain
            console.log('token ', this.tokenContractJS.address, ' topic ', contract.address, ' bounty ', bounty * 10 ** 18, ' action ', this.actions.newTopic)
            const result = await this.contract!.createForumTx(this.account!, new BigNumber(hashSolidity), bounty * 10 ** 18, TOPIC_LENGTH).send({})
            // const result = await this.tokenContractJS.transferAndCall(contract.address, bounty * 10 ** 18, this.actions.newTopic, [hashSolidity, TOPIC_LENGTH])
            console.log(result)

            return {
                id: ipfsHash,
                ...ipfsMessage
            }
        } catch (e) {
            if (ipfsHash) {
                // Failed - unpin it from ipfs.menlo.one
                // this.localStorage.rm(ipfsHash)
                this.remoteStorage.unpin(ipfsHash)
            }

            console.error(e)
            throw e
        }
    }
}


export default TopicsService
