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

import { toast } from 'react-toastify'

import web3 from './Web3'

import MessagesGraph from './MessageGraph'

import RemoteIPFSStorage, {IPFSMessage, IPFSTopic} from '../storage/RemoteIPFSStorage'
import HashUtils, { CIDZero, SolidityHash, SolidityHashZero } from '../storage/HashUtils'

import { QPromise } from '../utils/QPromise'

import { MenloForum } from '../contracts/MenloForum'
import { MenloToken } from '../contracts/MenloToken'

import { Account } from './Account'
import Message, { Message0 } from './Message'
import { CID } from 'ipfs'
import { ContentNode } from '../ContentNode/BlockOverflow'


type NewMessageCallback = () => void


export class ForumModel {
    public  topic: IPFSTopic
    public  messages: MessagesGraph
    public  lotteryLength: number
    public  contractAddress: string
    public  winningMessage: Message | null
    public  hasEnded: boolean = false
    public  claimed: boolean = false
    public  iWon: boolean = false
    public  winningVotes: number
    public  winningOffset: number
    public  winner: string | null
    public  pool: number = 0
    public  tokenBalance: number = 0
    public  author: string = ''
    public  endTimestamp: number = 0
}


export interface Forum {
    topicOffset(id : string)
    subscribeMessages(parentID : string, callback : NewMessageCallback | null)
    getMessage(id : string) : Message
    getChildrenMessages(id : string) : Promise<Message[]>
    upvoteAndComment(id : string, body: string | null)
    downvoteAndComment(id : string, body: string | null)
    postMessage(body: string, parentHash : string | null)
}

export type ForumContext = { model: ForumModel, svc: Forum }
export type LotteriesCallback = () => void

export class Forum extends ForumModel {

    // Private

    private signalReady: () => void

    // Public

    public ready: any

    public cn: ContentNode
    public tokenContract: MenloToken | null
    private tokenContractJS: any

    public contractAddress: string
    public contract: MenloForum | null

    private acct: Account | null
    private actions: { post, upvote, downvote }

    public account: string | null
    public remoteStorage: RemoteIPFSStorage
    public messagesCallbacks: Map<string, NewMessageCallback> | {}
    public lotteriesCallback: LotteriesCallback | null

    public filledMessagesCounter: number
    public messageOffsets: Map<CID, number> | {}
    public messageHashes: string[]

    public initialSyncEpoch : number
    public postCost : number
    public voteCost : number
    public postCount: number
    public epochLength: number = 0

    
    constructor( forumAddress: string ) {
        super()

        this.ready  = QPromise((resolve) => { this.signalReady = resolve })

        this.contractAddress = forumAddress
        this.messages = new MessagesGraph(new Message(this, Message0))
        this.account = null;
        this.messagesCallbacks = {}

        this.remoteStorage = new RemoteIPFSStorage()
        this.cn = new ContentNode()
    }
    
    async queryCN() {
        const forum = await this.cn.getForum(this.contractAddress, this.account)

        this.topic           = Object.assign({}, forum.topic)
        this.voteCost        = forum.voteCost
        this.postCost        = forum.postCost
        this.epochLength     = forum.epochLength
        this.postCount       = forum.postCount
        this.messageHashes   = forum.messageHashes
        this.messageOffsets  = forum.messageOffsets
        this.endTimestamp    = forum.endTimestamp
        this.author          = forum.author
        this.pool            = forum.pool
        this.tokenBalance    = forum.tokenBalance
        this.hasEnded        = forum.hasEnded
        this.claimed         = forum.claimed
        this.winningVotes    = forum.winningVotes
        this.winningOffset   = forum.winningOffset
        this.winner          = forum.winner

        forum.messages.children.forEach(m => {
            this.messages.add(new Message(this, m))
        })

        this.winningMessage  = this.winningOffset ? this.getMessage(this.messageOffsets[this.winningOffset]) : null

        this.signalReady()
        
        this.messageHashes.forEach(id => {
            const msg = this.messages.get(id)
            this.onModifiedMessage(msg)
        })
    }

    async setWeb3Account(acct : Account) {
        await this.queryCN()

        if (acct.address === this.account) {
            return
        }

        try {
            this.acct = acct
            this.account = acct.address

            this.tokenContract = new MenloToken(web3, this.acct.contractAddresses.MenloToken)

            this.filledMessagesCounter = 0
            this.messageOffsets = {}
            this.messageHashes = []

            /*
            const forumContract = TruffleContract(ForumContract)
            await forumContract.setProvider(web3.currentProvider)
            forumContract.defaults({ from: this.account })
            */
            this.contract = await MenloForum.createAndValidate(web3, this.contractAddress)

            const [post, upvote, downvote] = (await Promise.all([
                this.contract.ACTION_POST,
                this.contract.ACTION_UPVOTE,
                this.contract.ACTION_DOWNVOTE
            ])).map(bn => bn.toNumber());

            this.actions = { post, upvote, downvote };

            [this.initialSyncEpoch, this.lotteryLength, this.postCost, this.voteCost] = (await Promise.all([
                this.contract.postCount,
                this.contract.epochLength,
                this.contract.postCost,
                this.contract.voteCost
            ])).map(bn => bn.toNumber())

            this.initialSyncEpoch -= 1
            this.lotteryLength    *= 1000

            // Figure out cost for post
            // this.postGas = await this.tokenContract.transferAndCall.estimateGas(this.contract.address, 1 * 10**18, this.actions.post, [SolidityHashZero, '0x0000000000000000000000000000000000000000000000000000000000000000'])
            // this.voteGas = await this.tokenContract.transferAndCall.estimateGas(this.contract.address, 1 * 10**18, this.actions.upvote, ['0x0000000000000000000000000000000000000000000000000000000000000000'])
            // console.log(`postGas ${this.postGas}, voteGas ${this.voteGas}`)

            /*
            this.watchForAnswers()
            this.watchForVotes()
            this.watchForComments()
            this.watchForPayouts()
            */

            this.refreshBalances()
            this.signalReady()

        } catch (e) {
            console.error(e)
            throw(e)
        }
    }

    clearAccount() {
        // TODO: Remove watchers
    }

    topicOffset(id : string) {
        return this.messageOffsets[id]
    }

    /*
    async watchForPayouts() {
        await this.ready
        const forum = this.contract!

        forum.PayoutEvent({}).watch({}, (error, result) => {
            if (error) {
                console.error( error )
                return
            }

            const payout : { tokens: number, user: string} = {
                tokens:  (result.args._tokens as number) / 10 ** 18,
                user:    result.args._user as string
            }
            console.log('[[ Payout ]] ', payout)

            if (payout.user.toLowerCase() === this.account) {
                this.markClaimed()
                this.refreshBalances()
            }

            this.refreshLottery()
            this.refreshBalances()
        })
    }

    async watchForVotes() {
        await this.ready
        const forum = this.contract!

        forum.VoteEvent({}).watch({}, (error, result) => {
            if (error) {
                console.error( error )
                return
            }

            const offset    = result.args._offset as number
            const direction = result.args._direction as number

            console.log(`[[ Vote ]] ( ${offset} ) > ${direction}` )

            const message = this.messages.get(this.messageHashes[offset])
            if (message) {
                this.updateVotesData(message, 0)
                this.onModifiedMessage(message)
            }

            this.refreshLottery()
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

            const messageHash : SolidityHash = result.args._contentHash.toString()
            const messageID : CID = solidityHashToCid(messageHash)

            if (messageID === CIDZero) {
                console.log(`[[ Answer ]] ${messageHash}`)

                // Probably 0x0 > 0x0 which Solidity adds to make life simple
                this.messageOffsets[messageID] = this.messageHashes.length
                this.messageHashes.push(messageID)
                return
            }

            if (typeof this.messageOffsets[messageID] === 'undefined') {
                const offset = this.messageHashes.length
                console.log(`[[ Answer ]] ( ${offset} ) ${messageHash}`)

                this.messageOffsets[messageID] = offset
                this.messageHashes.push(messageID)
                const message = new Message( this, messageID, CIDZero, offset )

                this.messages.add(message)
                this.fillMessage(message.id)

                this.refreshLottery()
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

            const parentHash  : SolidityHash = result.args._parentHash.toString()
            const messageHash : SolidityHash = result.args._contentHash.toString()

            const parentID  = HashUtils.solidityHashToCid(parentHash)
            const messageID = HashUtils.solidityHashToCid(messageHash)

            console.log(`[[ Comment ]] ${parentID} > ${messageID}`)
            const message = new Message( this, messageID, parentID, -1 )

            this.messages.add(message)
            this.fillMessage(message.id)

            this.refreshLottery()
        })
    }
    */

    async claimWinnings() {
        await this.ready

        try {

            await this.contract!.claimTx().send({})
        } catch (e) {
            console.error(e)
            throw (e)
        }

        this.refreshLottery()
    }

    async fillMessage(id : string) {
        await this.ready;

        const message = this.messages.get(id)
        if (!message) {
            throw (new Error(`Unable to get message ${id}`))
        }

        try {
            if (message.parent === CIDZero) {
                await this.updateVotesData(message, 0)
            }

            const ipfsMessage = await this.remoteStorage.getMessage(message.id)
            Object.assign(message, ipfsMessage)

            message.filled = true
        } catch (e) {
            console.log('Error with Message ', message, ' Error ', e)

            if (!message.error) {
                setTimeout(() => { this.fillMessage(message.id) }, 100)
            } else {
                this.messages.delete(message)
            }

            // Couldn't fill message, retry
            console.error(e)

            message.error = e
            message.body = 'IPFS Retrieval Issue. Retrying...'
        } finally {
            this.filledMessagesCounter++;

            // console.log('onModified ',message)
            this.onModifiedMessage(message)
        }
    }

    subscribeMessages(parentID : CID, callback : NewMessageCallback | null) {
        this.messagesCallbacks[parentID] = callback
    }

    subscribeLotteries(callback : LotteriesCallback | null) {
        this.lotteriesCallback = callback
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
    }

    async refreshLottery() {
        if (this.lotteriesCallback) {
            this.lotteriesCallback()
        }
    }

    async refreshBalances() {
        await this.ready
        await this.refreshLottery()

        if (this.acct) {
            this.acct.refreshBalance()
        }
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


    async upvoteAndComment(id : string, body: string | null) {
        await this.voteAndComment(id, 1, body)
    }

    async downvoteAndComment(id : string, body: string | null) {
        await this.voteAndComment(id, -1, body)
    }

    async voteAndComment(id : CID, direction: number, body: string | null) {
        await this.ready

        const action = (direction > 0) ? this.actions.upvote : this.actions.downvote

        if (!body) {
            // Send it to Blockchain
            const data: [string, SolidityHash, SolidityHash] = [this.topicOffset(id).toString(), SolidityHashZero, SolidityHashZero]
            const result = await this.tokenContractJS.transferAndCall(this.contractAddress, this.voteCost, action, data)
            // await this.tokenContract!.transferAndCallTx(forum.address, tokenCost, action, this.topicOffset(id).toString()).send({})
            console.log(result)
            return null
        }

        const parentID : CID = id

        const ipfsMessage : IPFSMessage = {
            version: 1,
            topic: this.topic.offset,
            offset: this.messageHashes.length,
            parent: parentID,
            author: this.account!,
            date: Date.now(),
            body,
        }

        let ipfsHash

        try {
            // Create message and pin it to remote IPFS
            ipfsHash = await this.remoteStorage.createMessage(ipfsMessage)

            // Send it to Blockchain
            const data : [string, SolidityHash, SolidityHash] = [this.topicOffset(id).toString(), HashUtils.cidToSolidityHash(parentID), HashUtils.cidToSolidityHash(ipfsHash)]
            const result = await this.tokenContractJS.transferAndCall(this.contractAddress, this.voteCost, action, data)
            // await this.tokenContract!.transferAndCallTx(forum.address, tokenCost, action, this.topicOffset(id).toString()).send({})
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

    async postMessage(body: string, parentHash : string | null) : Promise<object> {
        await this.ready

        const ipfsMessage : IPFSMessage = {
            version: 1,
            topic: this.topic.offset,
            offset: this.messageHashes.length,
            parent: parentHash || CIDZero, // Do we need this since its in Topic?
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
            if (parentHashSolidity !== SolidityHashZero) {
                parentHashSolidity = HashUtils.cidToSolidityHash(parentHashSolidity)
            }

            // Send it to Blockchain
            const data : string[] = [parentHashSolidity, hashSolidity]
            const result = await this.tokenContract!.transferAndCallTx(this.contractAddress, this.postCost, this.actions.post, data).send({})
            console.log(result)

            return {
                id: ipfsHash,
                ...ipfsMessage
            }
        } catch (e) {

            let msg = e.message
            let timeout = 4000

            if (ipfsHash) {
                // Failed - unpin it from ipfs.menlo.one
                // this.localStorage.rm(ipfsHash)
                this.remoteStorage.unpin(ipfsHash)
            }

            if (e.message === "Error: MetaMask Tx Signature: User denied transaction signature.") {
                msg = "You cancelled the MetaMask transaction."
                timeout = 1500
            }

            toast(msg, {
                autoClose: timeout,
                toastId: 2
            })

            console.error(e)
            
            throw e
        }
    }
}

