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
    isClosed:     boolean
    messageHash:  string
    isClaimed:    boolean
    endTime:      number
    forumAddress: string | null | undefined
    winningVotes: number
    totalAnswers: number
    pool:         number
    confirmed:    boolean
}

export interface TopicCTOPost extends TopicCTOGet {
    readonly transaction: string
}


export interface TopicsCTOGet {
    readonly ACTION_NEWTOPIC: number
    readonly total: number
    readonly query: string
    readonly topics: TopicCTOGet[]
}

export interface ForumCTOGet {
    readonly topic:          IPFSTopic,
    readonly epochLength:    number
    readonly postCost :      number
    readonly voteCost :      number
    readonly messageOffsets: Map<CID, number> | {}
    readonly messageHashes:  string[]
    readonly postCount:      number
    readonly endTimestamp:   number
    readonly author:         string
    readonly pool:           number
    readonly tokenBalance:   number
    readonly hasEnded:       boolean
    readonly claimed:        boolean
    readonly winningVotes:   number
    readonly winningOffset:  number
    readonly winner:         string | null
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
    readonly id: CID
    readonly votes:   number
    readonly myvotes: number
    readonly children: MessageCTOGet[]
}


