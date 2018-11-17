import { Topics } from "./Topics";
import {IPFSTopic} from "../storage/RemoteIPFSStorage";
import { Forum } from './Forum'
import { MessageCTOGet, TopicCTOGet } from '../ContentNode/BlockOverflow.cto'


export default class Topic extends IPFSTopic implements TopicCTOGet {

    public topics: Topics

    public forumAddress: string | null | undefined
    public forum: Forum | null = null

    public offset: number

    public messageHash: string
    public transaction: string | null
    public body: string

    // Read from Forum contract
    public endTime: number
    public winningVotes: number
    public totalAnswers: number
    public bounty: number
    public pool: number
    public winner: string
    public winningMessage: MessageCTOGet | null
    public isClaimed: boolean
    public confirmed: boolean

    public filled: boolean

    error: Error | null = null

    constructor(topics : Topics, t: TopicCTOGet) {
        super()

        this.topics = topics

        this.forumAddress = t.forumAddress
        this.offset       = t.offset
        this.messageHash  = t.messageHash
        this.transaction  = t.transaction
        this.isClaimed    = t.isClaimed
        this.endTime      = t.endTime * 1000
        this.forumAddress = t.forumAddress
        this.winningVotes = t.winningVotes
        this.totalAnswers = t.totalAnswers
        this.pool         = t.pool
        this.confirmed    = t.confirmed
        this.winningMessage = t.winningMessage

        this.version = t.version
        this.offset  = t.offset
        this.author  = t.author
        this.date    = t.date
        this.title   = t.title
        this.body    = t.body

        this.filled = true

        this.refresh = this.refresh.bind(this)
    }

    public get isClosed(): boolean {
        return (this.endTime < (new Date()).getTime())
    }

    public get iWon(): boolean {
        if (!this.winningMessage || !this.topics.acctSvc) {
            return false
        }

        return this.winningMessage.author === this.topics.acctSvc.address
    }

    public get id(): string {
        return this.forumAddress ? this.forumAddress : this.endTime.toString()
    }

    async claimWinnings() {

        if (!this.forumAddress) {
            return
        }

        const forum = new Forum(this.forumAddress)
        await forum.setWeb3Account(this.topics.acctSvc!)
        await forum.claimWinnings()

        this.topics.acctSvc!.addBalanceCallback(this.refresh)
    }

    async refresh() {

    }
}

