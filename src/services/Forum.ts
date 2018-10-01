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

import MessagesGraph from '../messaging/MessageBoardGraph'

import RemoteIPFSStorage, {IPFSMessage, IPFSTopic} from '../storage/RemoteIPFSStorage'
import HashUtils from '../storage/HashUtils'

import { QPromise } from '../utils/QPromise'

import TokenContract  from 'menlo-token/build/contracts/MenloToken.json'
import { MenloForum } from '../contracts/MenloForum'
// import { MenloToken } from '../contracts/MenloToken'

import { Account } from './Account'
import Lottery, { LotteriesCallback } from './Lottery'
import Message from './Message'


type NewMessageCallback = () => void


export class ForumModel {
    public topic: IPFSTopic
    public lottery: Lottery
    public messages: MessagesGraph
    public lotteryLength : number
    public winningVotes : number
}


export interface Forum {
    topicOffset(id : string)
    subscribeMessages(parentID : string, callback : NewMessageCallback | null)
    subscribeLotteries(callback : LotteriesCallback | null)
    getMessage(id : string) : Message
    getChildrenMessages(id : string) : Promise<Message[]>
    upvote(id : string, parent: string | null, hash: string | null) : Promise<number>
    downvote(id : string, parent: string | null, hash: string | null) : Promise<number>
    createMessage(body: string, parentHash : string | null) : Promise<object>
}

export type ForumContext = { model: ForumModel, svc: Forum }


export class Forum extends ForumModel implements Forum {

    // Private

    private signalReady: () => void
    private signalSynced: () => void

    // Public

    public ready: any
    public synced: any

    // private tokenContract: MenloToken | null
    private tokenContractJS: any

    private contractAddress: string
    public contract: MenloForum | null

    private acct: Account
    private actions: { post, upvote, downvote }

    public account: string | null
    public remoteStorage: RemoteIPFSStorage
    public messagesCallbacks: Map<string, NewMessageCallback> | {}

    public filledMessagesCounter: number
    public topicOffsets: Map<string, number> | {}
    public topicHashes: string[]

    public initialSyncEpoch : number
    public postCost : number
    public voteCost : number


    constructor( forumAddress: string ) {
        super()

        this.ready  = QPromise((resolve) => { this.signalReady = resolve })
        this.synced = QPromise((resolve) => { this.signalSynced = resolve })

        this.contractAddress = forumAddress

        this.remoteStorage = new RemoteIPFSStorage()
        this.messages = new MessagesGraph()
        this.account = null;
        this.messagesCallbacks = {}
        this.lottery = new Lottery(this)
    }

    async setAccount(acct : Account) {
        if (acct.address === this.account) {
            return
        }

        try {
            this.acct = acct
            this.account = acct.address

            const tokenContract = TruffleContract(TokenContract)
            await tokenContract.setProvider(web3.currentProvider)
            tokenContract.defaults({ from: this.account })
            this.tokenContractJS = await tokenContract.deployed()
            // this.tokenContract = new MenloToken(web3, (await tokenContract.deployed()).address)

            this.filledMessagesCounter = 0
            this.topicOffsets = {}
            this.topicHashes = []

            /*
            const forumContract = TruffleContract(ForumContract)
            await forumContract.setProvider(web3.currentProvider)
            forumContract.defaults({ from: this.account })
            */
            this.contract = await MenloForum.createAndValidate(web3, this.contractAddress)

            const hash = await this.contract.topicHash
            this.topic = await this.remoteStorage.get(HashUtils.solidityHashToCid(hash))
            const [post, upvote, downvote] = (await Promise.all([
                this.contract.ACTION_POST,
                this.contract.ACTION_UPVOTE,
                this.contract.ACTION_DOWNVOTE
            ])).map(bn => bn.toNumber());

            this.actions = { post, upvote, downvote };

            [this.initialSyncEpoch, this.lotteryLength, this.postCost, this.voteCost, this.winningVotes] = (await Promise.all([
                this.contract.postCount,
                this.contract.epochLength,
                this.contract.postCost,
                this.contract.voteCost,
                this.contract.winningVotes
            ])).map(bn => bn.toNumber())

            this.initialSyncEpoch -= 1
            this.lotteryLength    *= 1000

            // Figure out cost for post
            // this.postGas = await this.tokenContract.transferAndCall.estimateGas(this.contract.address, 1 * 10**18, this.actions.post, ['0x0', '0x0000000000000000000000000000000000000000000000000000000000000000'])
            // this.voteGas = await this.tokenContract.transferAndCall.estimateGas(this.contract.address, 1 * 10**18, this.actions.upvote, ['0x0000000000000000000000000000000000000000000000000000000000000000'])
            // console.log(`postGas ${this.postGas}, voteGas ${this.voteGas}`)

            this.watchForAnswers()
            this.watchForVotes()
            this.watchForComments()
            this.watchForPayouts()

            this.lottery.refresh()
            this.signalReady()

            if (this.initialSyncEpoch === 0) {
                this.signalSynced()
            }

        } catch (e) {
            console.error(e)
            throw(e)
        }
    }

    topicOffset(id : string) {
        return this.topicOffsets[id]
    }

    async watchForPayouts() {
        await this.synced
        const forum = this.contract!

        forum.PayoutEvent({}).watch({}, (error, result) => {
            if (error) {
                console.error( error )
                return
            }

            const payout : { tokens: number, user: string} = {
                tokens:  result.args._tokens as number,
                user:    result.args._user as string
            }
            console.log('[[ Payout ]] ', payout)

            if (payout.user.toLowerCase() === this.account) {
                this.lottery.markClaimed()
                this.lottery.refresh()
            }
        })
    }

    async watchForVotes() {
        await this.synced
        const forum = this.contract!

        forum.VoteEvent({}).watch({}, (error, result) => {
            if (error) {
                console.error( error )
                return
            }

            const offset    = result.args._offset as number
            const direction = result.args._direction as number

            console.log(`[[ Vote ]] ( ${offset} ) ^v ${direction}` )

            const message = this.messages.get(this.topicHashes[offset])
            if (message) {
                this.updateVotesData(message, 0)
                this.onModifiedMessage(message)
            }
        })
    }

    async watchForAnswers() {
        await this.ready
        const forum = this.contract!

        forum.AnswerEvent({}).watch({}, (error, result) => {
            if (error) {
                console.error( error )
                return
            }

            const parentHash  = '0x0'
            const messageHash = HashUtils.solidityHashToCid(result.args._contentHash)

            if (parentHash === messageHash) {
                console.log(`[[ Answer ]] ${messageHash}`)

                // Probably 0x0 > 0x0 which Solidity adds to make life simple
                this.topicOffsets[messageHash] = this.topicHashes.length
                this.topicHashes.push(messageHash)
                return
            }

            if (typeof this.topicOffsets[messageHash] === 'undefined') {
                const offset = this.topicHashes.length
                console.log(`[[ Answer ]] ( ${offset} ) ${messageHash}`)

                this.topicOffsets[messageHash] = offset
                this.topicHashes.push(messageHash)
                const message = new Message( this, messageHash, parentHash, offset )

                this.messages.add(message)
                this.fillMessage(message.id)
            }
        })
    }

    async watchForComments() {
        await this.ready
        const forum = this.contract!

        forum.CommentEvent({}).watch({}, (error, result) => {
            if (error) {
                console.error( error )
                return
            }

            const parentHash  = HashUtils.solidityHashToCid(result.args._parentHash)
            const messageHash = HashUtils.solidityHashToCid(result.args._contentHash)

            console.log(`[[ Comment ]] ${parentHash} > ${messageHash}`)
            const message = new Message( this, messageHash, parentHash, -1 )

            this.messages.add(message)
            this.fillMessage(message.id)
        })
    }

    async fillMessage(id) {
        await this.ready;

        const message = this.messages.get(id)
        if (!message) {
            throw (new Error(`Unable to get message ${id}`))
        }

        try {
            await Promise.all([this.updateVotesData(message, 0), this.remoteStorage.fillMessage(message)])
            message.filled = true

            // console.log('onModified ',message)
            this.onModifiedMessage(message)

        } catch (e) {
            // Couldn't fill message, throw it away for now
            this.messages.delete(message)
            console.error(e)

            message.error = e
            message.body = 'IPFS Connectivity Issue. Retrying...'
        } finally {
            this.filledMessagesCounter++;

            if (this.filledMessagesCounter >= this.initialSyncEpoch) {
                this.signalSynced()
            }
        }
    }

    subscribeMessages(parentID : string, callback : NewMessageCallback | null) {
        this.messagesCallbacks[parentID] = callback
    }

    subscribeLotteries(callback : LotteriesCallback | null) {
        this.lottery.subscribe(callback)
    }

    async updateVotesData(message : Message, delta : number) {
        await this.ready
        const forum = this.contract!

        if (delta) {
            message.votes += delta
            message.myvotes += delta
        } else {
            if (!message || !message.id) {
                throw (new Error('invalid Topic ID'))
            }
            const [votes, myvotes] = await Promise.all([
                forum.votes(this.topicOffset(message.id)),
                forum.voters(this.topicOffset(message.id), this.account!)])

            message.votes   = votes.toNumber()
            message.myvotes = myvotes.toNumber()
        }

        // console.log('updated Votes: ', message)
    }

    onModifiedMessage(message : Message) {
        // Send message back
        const callback = this.messagesCallbacks[message.parent]
        if (callback) {
            callback(message)
        }

        this.refreshBalances()
        this.lottery.refresh()
    }

    get rewardPool() : number {
        return this.lottery.pool / 10 ** 18
    }

    async refreshBalances() {
        await this.ready
        
        this.acct.refreshBalance()
    }

    getMessage(id : string) : Message {
        return this.messages.get(id)
    }

    async getChildrenMessages(id : string) : Promise<Message[]> {
        const message = this.getMessage(id)

        if (!message || message.children.length === 0) {
            return []
        }

        return Promise.all(message.children.map(cid => this.getMessage(cid)).filter(m => m && m.body))
    }

    async vote(id : string, direction: number, parent : string | null, hash : string | null) {
        await this.ready
        const forum = this.contract!

        const action = (direction > 0) ? this.actions.upvote : this.actions.downvote

        await this.tokenContractJS.transferAndCall(forum.address, this.voteCost, action, [this.topicOffset(id).toString(), parent ? parent : '', hash ? hash : ''])
        // await this.tokenContract!.transferAndCallTx(forum.address, tokenCost, action, this.topicOffset(id).toString()).send({})

        const message = this.messages.get(id)
        await this.updateVotesData(message, direction)
        this.onModifiedMessage(message)

        return message
    }

    async upvote(id : string, parent: string | null, hash: string | null) : Promise<number> {
        return this.vote(id, 1, parent, hash)
    }

    async downvote(id : string, parent: string | null, hash: string | null) : Promise<number> {
        return this.vote(id, -1, parent, hash)
    }

    async createMessage(body: string, parentHash : string | null) : Promise<object> {
        await this.ready
        const contract = this.contract!

        const ipfsMessage : IPFSMessage = {
            version: 1,
            topic: this.topic.offset,
            offset: this.topicHashes.length,
            parent: parentHash || '0x0', // Do we need this since its in Topic?
            author: this.account!,
            date: Date.now(),
            body,
        }

        let ipfsHash

        try {
            // Create message and pin it to remote IPFS
            ipfsHash = await this.remoteStorage.createMessage(ipfsMessage)

            const hashSolidity = HashUtils.cidToSolidityHash(ipfsHash)
            let parentHashSolidity = ipfsMessage.parent
            if (parentHashSolidity !== '0x0') {
                parentHashSolidity = HashUtils.cidToSolidityHash(parentHashSolidity)
            }

            // Send it to Blockchain
            const result = await this.tokenContractJS.transferAndCall(contract.address, this.postCost, this.actions.post, [parentHashSolidity, hashSolidity])
            // const result = await this.tokenContract!.transferAndCallTx(contract.address, tokenCost, this.actions.post, parentHashSolidity + hashSolidity).send({})
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

