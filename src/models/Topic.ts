import { Topics } from "./Topics";
import {IPFSTopic} from "../storage/RemoteIPFSStorage";


type TopicMetadata = {
    isClosed:  boolean,
    messageHash: string,
    payout:  number,
    votes:   number,
    winner:  string
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

    public filled: boolean

    error: Error

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
}

