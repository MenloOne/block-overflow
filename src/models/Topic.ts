import { Topics } from "./Topics";
import {IPFSTopic} from "../storage/RemoteIPFSStorage";
import { Forum } from './Forum'
import { TopicCTOGet } from '../ContentNode/BlockOverflow.cto'


export default class Topic extends IPFSTopic implements TopicCTOGet {

    public topics: Topics

    public forumAddress: string
    public forum: Forum | null = null

    public offset: number

    public isClosed:  boolean
    public messageHash: string
    public body: string

    // Read from Forum contract
    public endTime: number
    public winningVotes: number
    public totalAnswers: number
    public bounty: number
    public pool: number
    public winner: string
    public isAnswered: boolean
    public isClaimed: boolean
    public iWon: boolean

    public filled: boolean

    error: Error | null = null

    constructor(topics : Topics, t: TopicCTOGet) {
        super()

        this.topics = topics

        this.forumAddress = t.forumAddress
        this.offset       = t.offset
        this.isClosed     = t.isClosed
        this.messageHash  = t.messageHash
        this.isClaimed    = t.isClaimed
        this.endTime      = t.endTime
        this.forumAddress = t.forumAddress
        this.winningVotes = t.winningVotes
        this.totalAnswers = t.totalAnswers
        this.pool         = t.pool

        this.version = t.version
        this.offset  = t.offset
        this.author  = t.author
        this.date    = t.date
        this.title   = t.title
        this.body    = t.body

        this.filled = true

        this.refresh = this.refresh.bind(this)
    }

    public get id(): string {
        return this.forumAddress
    }

    async getForum(refresh: boolean = false) : Promise<Forum> {
        if (this.forum && !refresh) {
            return this.forum
        }

        this.forum = new Forum(this.forumAddress)
        await this.forum.queryCN()
        return this.forum
    }

    async clearForum() {
        this.forum = null
    }

    async claimWinnings() {
        const forum = new Forum(this.forumAddress)
        await forum.setWeb3Account(this.topics.acctSvc!)
        await forum.claimWinnings()

        this.topics.acctSvc!.addBalanceCallback(this.refresh)
    }

    async refresh() {

    }
}

