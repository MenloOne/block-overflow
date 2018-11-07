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

import RemoteIPFSStorage, { IPFSTopic } from '../storage/RemoteIPFSStorage'
import HashUtils from '../storage/HashUtils'

import { QPromise } from '../utils/QPromise'

import { MenloTopics } from '../contracts/MenloTopics'
import { MenloToken } from '../contracts/MenloToken'

import { Account } from './Account'
import Topic  from './Topic'
import { ContentNode } from '../ContentNode/BlockOverflow'
import { MessageCTOGet, TopicCTOGet } from '../ContentNode/BlockOverflow.cto'


export class TopicsModel {
    public topics: Topic[] = []
    public query: string | null = null
    public total: number = 0
}

export type TopicsContext = { model: TopicsModel, svc: Topics }


type TopicsCallback = (topic?: Topic) => void
const TOPIC_LENGTH_SECONDS : number = 24 * 60 * 60

export class Topics extends TopicsModel {

    public ready: any

    // Private
    private signalReady: () => void

    private currentToken : string | null = null
    private nextToken : string | null = null

    private tokenContract: MenloToken
    private contract: MenloTopics | null

    private account: string | null
    public  acctSvc: Account | null
    private remoteStorage: RemoteIPFSStorage
    private topicsCallback: TopicsCallback | null

    public  ACTION_NEWTOPIC: number

    private cn: ContentNode
    private socket: SocketIOClient.Socket | null = null

    constructor() {
        super()

        this.ready  = QPromise((resolve) => { this.signalReady = resolve })

        this.remoteStorage = new RemoteIPFSStorage()
        this.account = null
        this.topicsCallback = null

        this.cn = new ContentNode()
    }

    public setSocket(socket: SocketIOClient.Socket) {
        if (this.socket) {
            this.socket.disconnect()
        }
        this.socket = socket
        socket.connect()

//        socket.emit('events', ['NewTopic'] )
        socket.on('NewTopic', (topic : TopicCTOGet) => {
            console.log('NewTopic ', topic)
            this.queryCN()
        })

        socket.on('NewMessage', (message : MessageCTOGet) => {
            console.log('Saw new message ', message)

            if (this.topics.filter(t => t.forumAddress === message.forumAddress).length > 0) {
                this.queryCN()
            }
        })
    }

    public setCallback(callback : TopicsCallback) {
        this.topicsCallback = callback
    }

    public setFilter(query: string, filters?: { any }) {
        if (query === this.query) {
            return
        }

        this.query = query
        this.currentToken = null
        this.nextToken = null

        this.queryCN()
    }

    public clearFilters() {
        this.query = null
        this.currentToken = null
        this.nextToken = null

        this.queryCN()
    }

    public getNextPage() {
        this.queryCN(this.nextToken)
    }

    async queryCN(next?: string | null) {
        const currentToken = next ? next : this.currentToken
        const topics = await this.cn.getTopics(this.query, currentToken)

        this.ACTION_NEWTOPIC   = topics.ACTION_NEWTOPIC
        this.total             = topics.total
        this.query             = topics.query
        this.currentToken      = currentToken
        this.nextToken         = topics.continuation
        this.topics            = topics.topics.map(t => new Topic(this, t))

        this.signalReady()

        this.onModifiedTopic()
    }

    async setWeb3Account(acct : Account) {
        await this.queryCN()

        if (this.socket) {
            this.socket.connect()
        }

        if (acct.address === this.account || acct.address === null) {
            return
        }

        try {
            this.account = acct.address
            this.acctSvc = acct

            this.tokenContract = await MenloToken.createAndValidate(web3, this.acctSvc.contractAddresses.MenloToken)
            this.contract = await MenloTopics.createAndValidate(web3, this.acctSvc.contractAddresses.MenloTopics)
            // this.watchForTopics()

        } catch (e) {
            console.error(e)
            // throw(e)
        }
    }

    onModifiedTopic(topic?: Topic) {

        // Send message back
        if (this.topicsCallback) {
            this.topicsCallback(topic)
        }
    }

    public getTopic(id : string) : Topic {
        return this.topics.filter(t => t.forumAddress === id)[0]
    }

    async createTopic(title: string, body: string, bounty: number) {
        await this.ready
        const contract = this.contract!

        const ipfsTopic : IPFSTopic = {
            version: 1,
            offset: this.total,
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
            const data : string[] = [hashSolidity.toString(), TOPIC_LENGTH_SECONDS.toString()]
            const bounty18 = bounty * 10 ** 18
            const transaction = await this.tokenContract.transferAndCallTx(contract.address as string, bounty18, this.ACTION_NEWTOPIC, data).send({})
            console.log('Create transaction: ', transaction)

            const topicModel: TopicCTOGet = {
                ...ipfsTopic,
                isClosed    : false,
                messageHash : ipfsHash,
                isClaimed   : false,
                endTime     : new Date().getTime(), // Make model expired so we render a closed (not open yet) topic
                forumAddress: null,
                winningVotes: 0,
                totalAnswers: 0,
                pool        : bounty18,
                confirmed   : false
            }

            await this.cn.createTopic({ transaction, ...topicModel })

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

