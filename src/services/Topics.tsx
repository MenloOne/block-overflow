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

import * as React from 'react'

import web3 from './web3_override'
import TruffleContract from 'truffle-contract'
import BigNumber from 'bignumber.js'

import RemoteIPFSStorage, { IPFSTopic } from '../storage/RemoteIPFSStorage'
import HashUtils from '../storage/HashUtils'

import { QPromise } from '../utils/QPromise'

import TokenContract   from 'menlo-token/build/contracts/MenloToken.json'
import TopicsContract  from '../artifacts/MenloTopics.json'
import { MenloTopics } from '../contracts/MenloTopics'
// import { MenloToken } from '../contracts/MenloToken'

import { Account } from './Account'
import Topic from './Topic'


export class TopicsModel {
    public topics: Topic[] = []
}

export interface TopicsService {
    ready: any
    synced: any

    topicOffset(id : string)
    getTopic(id : string) : Topic
    allTopics() : Topic[]
    createTopic(title: string, body: string, bounty: number) : Promise<object>
}

export type TopicsContext = { model: TopicsModel, svc: Topics }


type TopicsCallback = (topic: Topic | null) => void
const TOPIC_LENGTH : number = 15 * 60 /* TODO: Change to 24 Hours */

export class Topics extends TopicsModel implements TopicsService {

    public ready: any
    public synced: any

    // Private

    private signalReady: () => void
    private signalSynced: () => void

    private tokenContractJS: any
    private contract: MenloTopics | null

    private actions: { newTopic }

    private account: string | null
    private remoteStorage: RemoteIPFSStorage
    private topicsCallback: TopicsCallback | null

    private initialTopicCount: number
    private filledTopicsCounter: number = 0
    private topicOffsets: Map<string, number> | {}
    private topicHashes: string[]


    constructor() {
        super()

        this.ready  = QPromise((resolve) => { this.signalReady = resolve })
        this.synced = QPromise((resolve) => { this.signalSynced = resolve })

        this.remoteStorage = new RemoteIPFSStorage()
        this.account = null
        this.topicsCallback = null
    }

    public setCallback(callback : TopicsCallback) {
        this.topicsCallback = callback
    }

    async setAccount(acct : Account) {
        if (acct.address === this.account) {
            return
        }

        try {
            this.account = acct.address

            const tokenContract = TruffleContract(TokenContract)
            await tokenContract.setProvider(web3.currentProvider)
            tokenContract.defaults({ from: this.account })
            this.tokenContractJS = await tokenContract.deployed()

            const topicsContract = TruffleContract(TopicsContract)
            await topicsContract.setProvider(web3.currentProvider)
            topicsContract.defaults({ from: this.account })
            const topicAddress = (await topicsContract.deployed()).address
            this.contract = await MenloTopics.createAndValidate(web3, topicAddress)

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

    public topicOffset(id : string) {
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
                await this.fillTopic(message)

                this.topics.push(message)

                this.onModifiedTopic(message)
            }
        })
    }

    async fillTopic(topic: Topic) {
        await this.ready
        const contract = this.contract!;

        try {
            const md: [BigNumber, boolean, BigNumber, BigNumber, string] = await contract.forums(topic.forumAddress)
            topic.metadata = {
                messageHash: HashUtils.solidityHashToCid(md[0].toString(16)),
                isClosed:    md[1],
                payout:      md[2].toNumber(),
                votes:       md[3].toNumber(),
                winner:      md[4]
            }

            const ipfsTopic = await this.remoteStorage.getTopic(topic.metadata.messageHash)
            Object.assign(topic, ipfsTopic)
            topic.filled = true
        } catch (e) {
            // Couldn't fill message, throw it away for now
            // topics.delete(topic)
            console.error(e)

            topic.error = e
            topic.body = 'IPFS Connectivity Issue. Retrying...'
        } finally {
            this.filledTopicsCounter++;

            if (this.filledTopicsCounter >= this.initialTopicCount) {
                this.signalSynced()
            }
        }

    }


    onModifiedTopic(topic : Topic | null) {
        // Send message back
        if (this.topicsCallback) {
            this.topicsCallback(topic)
        }
    }

    public getTopic(id : string) : Topic {
        return this.topics[this.topicOffset(id)]
    }

    public allTopics() : Topic[] {
        return this.topics
    }

    async createTopic(title: string, body: string, bounty: number) : Promise<object> {
        await this.ready
        const contract = this.contract!

        const ipfsTopic : IPFSTopic = {
            version: 1,
            offset: this.topicHashes.length,
            author: this.account!,
            date: Date.now(),
            title,
            body,
        }

        let ipfsHash

        try {
            // Create message and pin it to remote IPFS
            ipfsHash = await this.remoteStorage.createTopic(ipfsTopic)

            const hashSolidity = HashUtils.cidToSolidityHash(ipfsHash)

            // Send it to Blockchain
            console.log('token ', this.tokenContractJS.address, ' topic ', contract.address, ' bounty ', bounty * 10 ** 18, ' action ', this.actions.newTopic)
            // const result = await this.contract!.createForumTx(this.account!, new BigNumber(hashSolidity.toString()), bounty * 10 ** 18, TOPIC_LENGTH).send({})

            const data : [string, string] = [hashSolidity.toString(), TOPIC_LENGTH.toString()]
            const result = await this.tokenContractJS.transferAndCall(contract.address, bounty * 10 ** 18, this.actions.newTopic, data)
            console.log(result)

            return {
                id: ipfsHash,
                ...ipfsTopic
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


export const TopicsCtxtComponent = React.createContext({})


export function withTopics(Component) {
    // ...and returns another component...

    return function withTopicsComponent(props) {
        // ... and renders the wrapped component with the context theme!
        // Notice that we pass through any additional props as well
        return (
            <TopicsCtxtComponent.Consumer>
                {(topics: Topics) => <Component { ...props } topics={ topics }/>}
            </TopicsCtxtComponent.Consumer>
        )
    }
}

