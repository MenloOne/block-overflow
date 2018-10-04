import { Topics } from "./Topics";
import {IPFSTopic} from "../storage/RemoteIPFSStorage";
import { Forum } from './Forum'


type TopicMetadata = {
    isClosed:  boolean,
    messageHash: string,
}


export default class Topic extends IPFSTopic {

    public topics: Topics

    public forumAddress: string
    public offset: number

    public metadata: TopicMetadata | null
    public body: string

    // Read from Forum contract
    public endTime: number
    public winningVotes: number
    public totalAnswers: number
    public winner: string
    public isAnswered: boolean
    public isClaimed: boolean
    public iWon: boolean

    public filled: boolean

    error: Error | null = null

    constructor(topics : Topics, forumAddress : string, offset : number) {
        super()

        this.topics = topics
        this.forumAddress = forumAddress
        this.offset = offset

        this.metadata = null
        this.filled = false
        this.body = 'Loading from IPFS...'
    }

    public get id(): string {
        return this.forumAddress
    }

    async refreshMetadata(address) {
        await this.topics.ready
    }

    async claimWinnings() {
        const forum = new Forum(this.forumAddress)
        await forum.setAccount(this.topics.acctSvc!)
        await forum.lottery.claimWinnings()
    }
}

