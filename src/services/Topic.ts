import TopicsService from "./TopicsService";
import { BigNumber } from "bignumber.js";
import {IPFSTopic} from "../storage/RemoteIPFSStorage";
import HashUtils from '../storage/HashUtils'

type TopicMetadata = {
    isClosed:  boolean,
    messageHash: string,
    payout:  number,
    votes:   number,
    winner:  string
}


export default class Topic extends IPFSTopic {

    public topics: TopicsService

    public forumAddress: string
    public offset: number

    public metadata: TopicMetadata | null
    public body: string
    public filled: boolean

    constructor(topics : TopicsService, forumAddress : string, offset : number) {
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

    async fill() {
        await this.topics.ready
        const contract = this.topics.contract!;

        const md: [BigNumber, boolean, BigNumber, BigNumber, string] = await contract.forums(this.forumAddress)
        this.metadata = {
            messageHash: HashUtils.solidityHashToCid(md[0].toString(16)),
            isClosed:    md[1],
            payout:      md[2].toNumber(),
            votes:       md[3].toNumber(),
            winner:      md[4]
        }

        const ipfsTopic : IPFSTopic = await this.topics.remoteStorage.get(this.metadata.messageHash)
        Object.assign(this, ipfsTopic)
        this.filled = true
    }
}

