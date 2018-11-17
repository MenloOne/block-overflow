import { IPFSTopic } from '../storage/RemoteIPFSStorage'

export type CID = any;

export interface CNResult {
    success: boolean
}

export interface IIPFSTopic {
    version: number
    offset:  number
    author:  string
    date:    number
    title:   string
    body:    string
}

export interface TopicCTOGet extends IIPFSTopic {
    messageHash:  string
    transaction:  string | null
    isClaimed:    boolean
    endTime:      number
    forumAddress: string | null | undefined
    winningVotes: number
    winningMessage: MessageCTOGet | null
    totalAnswers: number
    pool:         number
    confirmed:    boolean
}

export interface TopicCTOPost extends TopicCTOGet {
}


export interface TopicsCTOGet {
    readonly ACTION_NEWTOPIC: number
    readonly total: number
    readonly query: string
    readonly continuation: string
    readonly topics: TopicCTOGet[]
}

export interface ForumCTOGet {
    readonly topic:           IPFSTopic,
    readonly epochLength:     number
    readonly postCost :       number
    readonly voteCost :       number
    readonly messageOffsets:  Map<CID, number> | {}
    readonly messageHashes:   string[]
    readonly postCount:       number
    readonly endTimestamp:    number
    readonly author:          string
    readonly pool:            number
    readonly claimed:         boolean
    readonly winningVotes:    number
    readonly winningOffset:   number
    readonly ACTION_POST:     number
    readonly ACTION_UPVOTE:   number
    readonly ACTION_DOWNVOTE: number

    readonly messages:       MessageCTOGet
}

export interface IIPFSMessage {
    version: number
    offset:  number
    topic:   number
    parent:  CID
    author:  string
    date:    number
    body:    string
}


export interface MessageCTOGet extends IIPFSMessage {
    readonly forumAddress: string
    readonly id: CID
    readonly votes:   number
    readonly confirmed: boolean
    readonly children: MessageCTOGet[]
}


export interface MessageCTOPost extends MessageCTOGet {
    readonly transaction: string
}

