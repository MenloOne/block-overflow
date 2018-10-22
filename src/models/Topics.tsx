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
import { toast } from 'react-toastify'

import web3 from './Web3'
import BigNumber from 'bignumber.js'

import RemoteIPFSStorage, { IPFSTopic } from '../storage/RemoteIPFSStorage'
import HashUtils from '../storage/HashUtils'

import { QPromise } from '../utils/QPromise'

import { MenloTopics } from '../contracts/MenloTopics'
import { MenloToken }  from '../contracts/MenloToken'

import { Account } from './Account'
import Topic from './Topic'
import { MenloForum } from '../contracts/MenloForum'

export class TopicsModel {
    public topics: Topic[] = []
    public query: string = ''
    public total: number = 0
}

export type TopicsContext = { model: TopicsModel, svc: Topics }


type TopicsCallback = (topic?: Topic) => void
const TOPIC_LENGTH : number = 24 * 60 * 60

export class Topics extends TopicsModel {

    public ready: any
    public synced: any

    // Private

    private allTopics: Topic[] = []

    private signalReady: () => void
    private signalSynced: () => void

    private tokenContract: MenloToken
    private contract: MenloTopics | null

    private actions: { newTopic }

    private account: string | null
    public  acctSvc: Account | null
    private remoteStorage: RemoteIPFSStorage
    private topicsCallback: TopicsCallback | null

    private initialTopicCount: number
    private filledTopicsCounter: number = 0
    private topicOffsets: Map<string, number> | {}
    private topicHashes: string[]

    private queryRegExp: RegExp
    private pageSize: number = 15
    private pageLimit: number = this.pageSize


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

    public setFilter(query: string, filters?: { any }) {
        this.query = query.toLowerCase()
        const pattern = `(${this.query.toLowerCase().split(' ').filter(s => s.length > 0).map(s => `(?=.*${s})`).join('')})`
        this.queryRegExp = RegExp(pattern)
        this.onModifiedTopic()
    }

    public getNextPage() {
        this.pageLimit += this.pageSize
        this.onModifiedTopic()
    }

    async setAccount(acct : Account) {
        if (acct.address === this.account || acct.address === null) {
            return
        }

        try {
            this.account = acct.address
            this.acctSvc = acct

            this.tokenContract = await MenloToken.createAndValidate(web3, this.acctSvc.contractAddresses.MenloToken)
            this.contract = await MenloTopics.createAndValidate(web3, this.acctSvc.contractAddresses.MenloTopics)

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

            this.onModifiedTopic()
        } catch (e) {
            console.error(e)
            // throw(e)
        }
    }

    async watchForTopics() {
        await this.ready
        const topics = this.contract!

        topics.NewTopicEvent({}).watch({fromBlock:0, toBlock:'latest'}, (error, result) => {
            if (error) {
                console.error( `[[ Topic ERROR ]] ${error}` )
                return
            }

            const forumAdddress = result.args._forum.toString()

            if (typeof this.topicHashes[forumAdddress] !== 'undefined') {
                console.error('Received duplicate Topic! ', forumAdddress)
                return
            }

            const offset = this.topicHashes.length
            console.log(`[[ Topic ]] ( ${offset} ) ${forumAdddress}`)

            this.topicOffsets[forumAdddress] = offset
            this.topicHashes.push(forumAdddress)

            const message = new Topic( this, forumAdddress, offset )
            this.allTopics.push(message)
            this.fillTopic(message)

            this.filledTopicsCounter++;

            if (this.filledTopicsCounter >= this.initialTopicCount) {
                this.signalSynced()
            }
        })
    }

    async fillTopic(topic: Topic) {
        await this.ready
        const contract = this.contract!;

        try {
            // console.log(`[[ Fill Topic ]] ( ${topic.offset} ) ${topic.metadata.messageHash}`)

            // Grab data from the actual Forum contract
            const forumContract = await MenloForum.createAndValidate(web3, topic.forumAddress);
            [topic.endTime, topic.winningVotes, topic.totalAnswers, topic.pool] = (await Promise.all([
                forumContract.endTimestamp,
                forumContract.winningVotes,
                forumContract.postCount,
                forumContract.pool
                ])).map(bn => bn.toNumber());
            topic.totalAnswers -= 1;
            topic.pool /= 10 ** 18;

            const md: [string, boolean, BigNumber, BigNumber, string] = await contract.forums(topic.forumAddress);
            topic.metadata = {
                messageHash: HashUtils.solidityHashToCid(md[0]),
                isClosed:    (topic.endTime < (new Date()).getTime())
            };

            const ipfsTopic = await this.remoteStorage.getMessage(topic.metadata.messageHash);
            Object.assign(topic, ipfsTopic);

            [topic.winner] = (await Promise.all([
                forumContract.winner
            ]));

            topic.endTime *= 1000 // Convert to Milliseconds
            topic.isAnswered = (topic.winner !== topic.author)
            topic.iWon = (topic.winner === this.account)
            topic.bounty = (await this.tokenContract.balanceOf(topic.forumAddress)).toNumber() / 10 ** 18
            topic.isClaimed = (topic.bounty === 0)

            topic.error  = null
            topic.filled = true
        } catch (e) {
            console.log('Error with Topic ', topic, ' Error ', e)

            if (!topic.error) {
                setTimeout(() => { this.fillTopic(topic) }, 100)
            }

            topic.error = e
            topic.title = 'IPFS Retrieval Issue. Retrying...'
            topic.body  = '...'

        } finally {
            this.onModifiedTopic(topic)
        }
    }


    onModifiedTopic(topic?: Topic) {

        // Filter to search query/filters
        let allTopics = this.allTopics
        if (this.query.length > 0) {
            allTopics = allTopics.filter(t => this.queryRegExp.test(t.title.toLowerCase()))
        }
        this.total  = allTopics.length

        // Copy paged topics out to model
        this.topics = allTopics.filter(m => m.filled).sort((a, b) => b.endTime - a.endTime).slice(0, this.pageLimit)

        // Send message back
        if (this.topicsCallback) {
            this.topicsCallback(topic)
        }
    }

    public topicOffset(id : string) {
        return this.topicOffsets[id]
    }

    public getTopic(id : string) : Topic {
        return this.allTopics[this.topicOffset(id)]
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

            if (!ipfsTopic.title || !ipfsTopic.body || !bounty) {
                throw new Error('Please fill out all of the fields.');
            }

            // Create message and pin it to remote IPFS
            ipfsHash = await this.remoteStorage.createTopic(ipfsTopic)

            const hashSolidity = HashUtils.cidToSolidityHash(ipfsHash)

            // Send it to Blockchain
            const data : string[] = [hashSolidity.toString(), TOPIC_LENGTH.toString()]
            const result = await this.tokenContract.transferAndCallTx(contract.address, bounty * 10 ** 18, this.actions.newTopic, data).send({})
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

            let msg = e.message
            let timeout = 4000

            if (e.message === "Error: MetaMask Tx Signature: User denied transaction signature.") {
                msg = "You cancelled the MetaMask transaction."
                timeout = 1500
            }

            console.error(e)
            toast(msg, {
                autoClose: timeout,
                toastId: 123
            })
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
                {(topics: Topics) => (
                    <div>
                        <Component {...props} topics={topics} />
                    </div>
                )}
            </TopicsCtxtComponent.Consumer>
        )
    }
}

