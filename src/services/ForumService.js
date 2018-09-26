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

import TokenContract from '../build-contracts/contracts/MenloToken.json'
import ForumContract from '../build-contracts/contracts/MenloForum.json'

import RemoteIPFSStorage from '../storage/RemoteIPFSStorage'
import MessagesGraph from '../storage/MessageBoardGraph'

import HashUtils from '../HashUtils'
import QPromise from '../utils/QPromise'

const address0 = '0x0000000000000000000000000000000000000000'

class Message {

    constructor(forum, id, parent, offset) {
        this.forum = forum
        this.id = id
        this.parent = parent
        this.offset = offset
        this.children = []
        this.votes = 0
        this.myvotes = 0
        this.body = 'Loading from IPFS...'
    }

    votesDisabled() {
        return (this.author === this.forum.account || this.forum.currentLottery.offsets[0] > this.offset)
    }

    upvoteDisabled() {
        return (this.votesDisabled() || this.myvotes > 0)
    }

    downvoteDisabled() {
        return (this.votesDisabled() || this.myvotes < 0)
    }
}


class Lottery {

    DEBUG = true

    constructor( _forum, _type ) {
        this.forum = _forum
        this.type = _type
        this.claimed = false
        this.offsets = [0,0]
    }

    updateEndTimeTimer() {
        const date = new Date()
        const now = date.getTime()
        const self = this

        if ( this.endTime < now ) {
            // We're in a weird state where the server will continue the current lottery
            // as soon as someone pays up.  Assume more time
            const newDate = new Date(now + this.forum.lotteryLength)
            this.endTime = newDate.getTime()
        }

        if (this.lotteryTimeout) {
            clearTimeout(this.lotteryTimeout)
            this.lotteryTimeout = null
        }

        if (now < this.endTime) {
            this.lotteryTimeout = setTimeout(() => {
                self.forum.refreshLotteries()
            }, this.endTime - now)
        }
    }

    async refresh(currentLottery, endTime, epochPrior, epochCurrent, epochLatest) {
        await this.forum.synced
        const now = new Date()

        // If time on server has run out.
        // If there are winners in current, the next paying action will reconcile current -> last
        const currentWinners = await this.winningAuthors([epochCurrent, epochLatest])
        this.willReconcile = (endTime < now.getTime() && (currentWinners.length > 0))

        if (this.type == 'current') {
            this.endTimeServer = endTime

            if (!this.endTime) {
                this.endTime = this.endTimeServer
            }

            if (this.willReconcile) {
                // Make current == no new messages

                this.lotteryID = currentLottery + 1
                this.offsets = [epochLatest, epochLatest]
                this.pool = 0
                this.winners = []

            } else {

                this.lotteryID = currentLottery
                this.offsets = [epochCurrent, epochLatest]
                const [poolBN] = await Promise.all([this.forum.forum.nextRewardPool.call()])
                this.pool = poolBN.toNumber() / 10 ** 18
                this.winners = await this.winningAuthors()
            }

            this.hasEnded = false
            this.updateEndTimeTimer()
            this.iWon = false

        } else {
            // Last

            if (this.willReconcile) {

                this.lotteryID = currentLottery
                this.offsets = [epochCurrent, epochLatest]
                const [poolBN] = await Promise.all([this.forum.forum.nextRewardPool.call()])
                this.pool = poolBN.toNumber() / 10**18

                this.winners = await this.winningAuthors()
                this.payouts = this.winners

            } else {

                this.lotteryID = currentLottery -1
                this.offsets = [epochPrior, epochCurrent]
                const poolBN = await this.forum.forum.rewardPool.call()
                this.pool = poolBN.toNumber() / 10**18

                this.winners = await this.winningAuthors()
                this.payouts = await Promise.all([0,1,2,3,4].map(i => this.forum.forum.payouts.call(i)))
            }

            this.hasEnded = true
            this.claimed = (this.forum.claimedLotteries[this.lotteryID] == true)
            this.iWon = (this.winners.filter(a => a === this.forum.account).length > 0)
        }


        if (this.DEBUG) {
            const forum = this.forum.forum // SOL Contract

            const debug = {}

            const [p,c,r,n,v,pc] = await Promise.all([
                forum.epochPrior.call(),
                forum.epochCurrent.call(),
                forum.rewardPool.call(),
                forum.nextRewardPool.call(),
                forum.votesCount.call(),
                forum.postCount.call()])

            Object.assign(debug, {
                epochPrior: p.toNumber(),
                epochCurrent: c.toNumber(),
                rewardPool: r.toNumber(),
                nextRewardPool: n.toNumber(),
                votesCount: v.toNumber(),
                postersCount: pc.toNumber(),
                show: this.show(),
                currentType: this.currentType()
            })

            debug.votes = []
            for (let i = 0; i < debug.votesCount; i++) {
                const bn = await forum.votes.call(i)
                debug.votes.push(bn.toNumber())
            }

            if (this.payouts) {
                debug.voters = []
                for (let i = 0; i < 5; i++) {
                    debug.voters.push (await Promise.all(this.payouts.map(async (user) => {
                        let bn = await forum.voters.call(i, user)
                        return { user, votes: bn.toNumber() }
                    })))
                }
            }

            debug.posters = []
            for (let i = 0; i < debug.postersCount; i++) {
                debug.posters.push(await forum.posters.call(i))
            }

            this.debug = debug
        }

        this.filled = true
        return this
    }


    async winningMessages(offsets) {
        const [from, to] = offsets || this.offsets

        if (to <= from) {
            return []
        }

        var eligibleMessages = []

        for (let i = from; i < to; i++) {
            let msg = this.forum.getMessage(this.forum.topicHashes[i])
            if (!msg || msg.votes <= 0) {
                continue
            }
            eligibleMessages.push(msg)
        }

        // No votes, no winners
        if (eligibleMessages.length == 0) {
            return []
        }

        // Sort by votes descending, then offset descending
        const winners = eligibleMessages.sort((a,b) => {
            let diff = b.votes - a.votes
            return (diff === 0) ? b.offset - a.offset : diff
        }).slice(0,5)

        // Filter out nulls
        return winners.filter(m => m != null && typeof m != 'undefined')
    }

    async winningAuthors(offsets) {
        let winners = await this.winningMessages(offsets)
        return winners.map(m => m.author)
    }

    currentType() {
        if (this.type == 'last') return 'last'

        return (this.offsets[1] == this.forum.topicHashes.length && !this.forum.currentLotteryElapsed()) ? 'current' : 'last'
    }

    show() {
        return ((this.type === 'current') ||
                (this.type === 'last' && this.offsets[1] != 1))
    }

    hasElapsedWithWinners() {
        const now = new Date()
        return ((now.getTime() > this.endTimeServer) &&  this.winners && this.winners.length > 0)
    }

    name() {
        return this.hasEnded ? 'Last' : 'Open'
    }

    totalWinners() {
        return this.winners.length
    }

    winnings(i) {
        const r = this.pool
        let me   = 0
        let rest = 0

        if (!r) {
            return null
        }

        if (i === 0) { me = r * 2 / 5; }
        if (i === 1) { me = r / 4; }
        if (i === 2) { me = r / 5; }
        if (i === 3) { me = r / 10; }
        if (i === 4) { me = r / 20; }

        if (this.hasEnded && !this.willReconcile) {
            // Has this winner been paid out?
            if (this.payouts[i] == address0) {
                return 0
            }
        }

        return me
    }

    totalWinnings() {
        let totals = this.winners.map((a, i) => {
            if (a === this.forum.account) {
                return this.winnings(i)
            }
            return 0
        })

        return totals.reduce((acc, cur) => acc + cur)
    }

    async claimWinnings() {
        try {
            await this.forum.forum.claim()
        } catch (e) {
            console.error(e)
            // await this.forum.forum.endEpoch()
            throw (e)
        }

        // How long do we wait?
        setTimeout(this.forum.refreshBalances.bind(this.forum), 2000)
    }
}



class ForumService {


    constructor() {
        const self = this

        this.ready  = new QPromise((resolve) => { self.signalReady = resolve })
        this.synced = new QPromise((resolve) => { self.signalSynced = resolve })

        this.tokenContract = TruffleContract(TokenContract)
        this.forumContract = TruffleContract(ForumContract)

        this.forum = null;
        this.remoteStorage = new RemoteIPFSStorage()

        this.messages = new MessagesGraph()
        this.account = null;
        this.messagesCallbacks = {}
        this.lotteriesCallback = null
        this.claimedLotteries = {}
        this.priorLottery   = new Lottery(this, 'last')
        this.currentLottery = new Lottery(this, 'current')

        // Callbacks
        this.calculateLotteries = this.calculateLotteries.bind(this)
    }

    async setAccount(acct) {
        if (acct.account === this.account) {
            return
        }

        try {
            this.account = acct.account
            this.refreshTokenBalance = acct.refreshBalance

            await this.tokenContract.setProvider(web3.currentProvider)
            this.tokenContract.defaults({
                from: this.account
            })
            this.token = await this.tokenContract.deployed()

            this.filledMessagesCounter = 0
            this.topicOffsets = {}
            this.topicHashes = []

            await this.forumContract.setProvider(web3.currentProvider)
            this.forumContract.defaults({
                from: this.account
            })
            this.forum = await this.forumContract.deployed();

            const [post, upvote, downvote] = await Promise.all([this.forum.ACTION_POST.call(), this.forum.ACTION_UPVOTE.call(), await this.forum.ACTION_DOWNVOTE.call()])
            this.actions = { post, upvote, downvote }

            const [bn1,bn2,bn3,bn4] = await Promise.all([
                this.forum.postCount.call(),
                this.forum.epochCurrent.call(),
                this.forum.epochPrior.call(),
                this.forum.epochLength.call()
            ])
            this.initialSyncEpoch = bn1.toNumber()-1
            this.epochCurrent     = bn2.toNumber()
            this.epochPrior       = bn3.toNumber()
            this.lotteryLength    = bn4.toNumber() * 1000

            // Figure out cost for post
            // this.postGas = await this.token.transferAndCall.estimateGas(this.forum.address, 1 * 10**18, this.actions.post, ['0x0', '0x0000000000000000000000000000000000000000000000000000000000000000'])
            // this.voteGas = await this.token.transferAndCall.estimateGas(this.forum.address, 1 * 10**18, this.actions.upvote, ['0x0000000000000000000000000000000000000000000000000000000000000000'])
            // console.log(`postGas ${this.postGas}, voteGas ${this.voteGas}`)

            this.watchForPayouts()
            this.watchForMessages()
            this.watchForVotes()

            this.signalReady()

            if (this.initialSyncEpoch === 0) {
                this.signalSynced()
            }

        } catch (e) {
            console.error(e)
            throw(e)
        }
    }

    currentLotteryElapsed() {
        return this.currentLottery.willReconcile
    }

    topicOffset(hash) {
        return this.topicOffsets[hash]
    }

    async watchForPayouts() {
        await this.synced
        const self = this

        this.forum.Payout({}, {fromBlock: 0}).watch((error, result) => {
            if (error) {
                console.error( error )
                return
            }

            const payout = {
                lottery: result.args._lottery.toNumber(),
                tokens:  result.args._tokens.toNumber(),
                user:    result.args._user
            }
            console.log('[[ Payout ]] ', payout)

            if (payout.lottery < self.priorLottery.lotteryID) {
                return
            }

            if (payout.user.toLowerCase() === self.account) {
                // Mark payout
                self.claimedLotteries[payout.lottery] = true
                if (self.priorLottery.lotteryID === payout.lottery) {
                    self.refreshLotteries()
                }
            }
        })
    }

    async watchForVotes() {
        let self = this
        await this.synced

        this.forum.Vote({}, {fromBlock: 0}).watch((error, result) => {
            if (error) {
                console.error( error )
                return
            }

            const bn = result.args._offset
            const offset = bn.toNumber()
            console.log('[[ Vote ]]  ',offset)

            const message = this.messages.get(self.topicHashes[offset])
            if (message) {
                self.updateVotesData(message)
                self.onModifiedMessage(message)

                if (offset >= this.priorLottery.offsets[0]) {
                    self.refreshLotteries()
                }
            }
        })
    }

    async watchForMessages() {
        await this.ready
        const self = this

        this.forum.Topic({}, {fromBlock: 0}).watch((error, result) => {
            if (error) {
                console.error( error )
                return
            }

            const parentHash  = HashUtils.solidityHashToCid(result.args._parentHash)
            const messageHash = HashUtils.solidityHashToCid(result.args.contentHash)

            if (parentHash === messageHash) {
                console.log(`[[ Topic ]] ${parentHash} > ${messageHash}`)

                // Probably 0x0 > 0x0 which Solidity adds to make life simple
                self.topicOffsets[messageHash] = self.topicHashes.length
                self.topicHashes.push(messageHash)
                return
            }

            if (typeof self.topicOffsets[messageHash] === 'undefined') {
                let offset = self.topicHashes.length
                console.log(`[[ Topic ]] ${parentHash} > ( ${offset} ) ${messageHash}`)

                self.topicOffsets[messageHash] = offset
                self.topicHashes.push(messageHash)
                let message = new Message( this, messageHash, parentHash, offset )

                // IMPORTANT - Have to do this first to prevent re-entrancy problems,
                // and only after this any await statements
                this.messages.add(message)

                self.fillMessage(message.id)
            }
        })
    }

    async fillMessage(id) {
        await this.ready;

        let message = this.messages.get(id)
        if (!message) {
            throw (new Error(`Unable to get message ${id}`))
        }

        try {
            await Promise.all([this.updateVotesData(message), this.remoteStorage.fillMessage(message)])
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

    subscribeMessages(parentID, callback) {
        this.messagesCallbacks[parentID] = callback
    }

    subscribeLotteries(callback) {
        this.lotteriesCallback = callback
    }

    async updateVotesData(message, delta) {
        if (delta) {
            message.votes += delta
            message.myvotes += delta
        } else {
            if (!message || !message.id) {
                throw (new Error('invalid Message ID'))
            }
            const [votes, myvotes] = await Promise.all([
                this.forum.votes.call(this.topicOffset(message.id)),
                this.forum.voters.call(this.topicOffset(message.id), this.account)])

            message.votes   = votes.toNumber()
            message.myvotes = myvotes.toNumber()
        }

        // console.log('updated Votes: ', message)
    }

    onModifiedMessage(message) {

        // Send message back
        let callback = this.messagesCallbacks[message.parent]
        if (callback) {
            callback(message)
        }

        this.refreshBalances()
        this.refreshLotteries()
    }

    countReplies(id) {
        return this.messages.get(id).children.length
    }

    async refreshBalances() {
        await Promise.all([
            this.refreshTokenBalance(),
            this.refreshRewardPool(true)
        ])

        // Optimization - don't refresh lotteries, just lotteries time
        if (this.lotteriesCallback) {
            this.lotteriesCallback()
        }
    }

    async isOpen() {
        let end = await this.endTimestamp()
        return (new Date().getTime() < end)
    }

    getMessage(id) {
        return this.messages.get(id)
    }

    async getChildrenMessages(id) {
        let self = this
        const message = this.getMessage(id)

        if (!message || message.children.length === 0) {
            return []
        }

        return Promise.all(message.children.map(cid => self.getMessage(cid)).filter(m => m && m.body))
    }

    async epoch() {
        await this.ready
        try {
            let r = await this.forum.epochCurrent.call()
            return r.toNumber()
        } catch (e) {
            console.error(e)
            return 0;
        }
    }

    async refreshRewardPool(refresh) {
        await this.ready
        if (!refresh && this.rewardPool) {
            return this.rewardPool
        }

        let reward = await this.forum.nextRewardPool.call()
        this.rewardPool = reward.toNumber() / 10**18

        return this.rewardPool
    }


    async rewards() {
        await this.ready
        let promises = [0, 1, 2, 3, 4].map(async i => {
            return this.forum.reward.call(i)
        })

        let rewards = Promise.all(promises)
        return rewards.map(r => r.toString())
    }

    async payoutAccounts() {
        await this.ready
        let promises = [0, 1, 2, 3, 4].map(async i => {
            return this.forum.payouts.call(i)
        })

        let payouts = await Promise.all(promises)
        return payouts.map(p => p.toString())
    }

    async votes(id) {
        await this.ready
        try {
            let r = await this.forum.votes.call(this.topicOffset(id))
            let v = r.toNumber()
            return v
        } catch (e) {
            console.error(e)
            return 0
        }
    }

    async voters(id, user) {
        await this.ready
        try {
            let r = await this.forum.voters.call(this.topicOffset(id), user)
            let v = r.toNumber()
            return v
        } catch (e) {
            console.error(e)
            return 0
        }
    }

    async vote(id, direction) {
        await this.ready

        let action = (direction > 0) ? this.actions.upvote : this.actions.downvote

        let tokenCost = await this.forum.voteCost.call()
        let tx = await this.token.transferAndCall(this.forum.address, tokenCost, action, [this.topicOffset(id).toString()])

        let message = this.messages.get(id)
        await this.updateVotesData(message, direction)
        this.onModifiedMessage(message)
        this.refreshBalances()

        return message
    }

    async refreshLotteries() {
        await this.synced

        if (!this.calcLotteriesTimer) {
            this.calcLotteriesTimer = setTimeout(this.calculateLotteries, 500)
        }
    }

    async calculateLotteries() {
        await this.synced

        const now = new Date()
        const [bn1, bn2, bn3, bn4] = await Promise.all([
            this.forum.currentLottery.call(),
            this.forum.endTimestamp.call(),
            this.forum.epochCurrent.call(),
            this.forum.epochPrior.call(),
        ])
        const currentLottery = bn1.toNumber()
        const endTime        = bn2.toNumber() * 1000 // Convert to JS
        const epochCurrent   = Math.max(bn3.toNumber(), 1)
        const epochPrior     = Math.max(bn4.toNumber(), 1)
        const epochLatest    = Math.max(this.topicHashes.length, 1)

        await Promise.all([
            this.priorLottery.refresh(currentLottery, endTime, epochPrior, epochCurrent, epochLatest),
            this.currentLottery.refresh(currentLottery, endTime, epochPrior, epochCurrent, epochLatest)
        ])
        this.calcLotteriesTimer = null

        console.log('Lotteries: ', [this.priorLottery, this.currentLottery])
        if (this.lotteriesCallback) {
            this.lotteriesCallback()
        }
    }

    async getLotteries()  {
        await this.synced

        var signalGetLotteriesSync
        // Optimize so we only call refresh once across multiple get calls
        if (this.getLotteriesSync) {
            await this.getLotteriesSync
        } else {
            this.getLotteriesSync = new Promise(resolve => signalGetLotteriesSync = resolve)
        }

        if (!this.currentLottery.filled || !this.priorLottery.filled) {
            await this.calculateLotteries()
            signalGetLotteriesSync()
        }

        return {
            currentLottery: this.currentLottery,
            priorLottery:   this.priorLottery,
        }
    }

    async upvote(id) {
        return this.vote(id, 1)
    }

    async downvote(id) {
        return this.vote(id, -1)
    }

    async createMessage(body, parentHash) {
        await this.ready

        const ipfsMessage = {
            version: 1,
            offset: this.topicHashes.length,
            parent: parentHash || '0x0', // Do we need this since its in Topic?
            author: this.account,
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
            let tokenCost = await this.forum.postCost.call()
            let result = await this.token.transferAndCall(this.forum.address, tokenCost, this.actions.post, [parentHashSolidity, hashSolidity])
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

export default ForumService
