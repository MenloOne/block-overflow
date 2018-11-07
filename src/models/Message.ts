import { Forum } from "./Forum";
import { IPFSMessage } from "../storage/RemoteIPFSStorage";
import { CID } from 'ipfs'
import { MessageCTOGet } from '../ContentNode/BlockOverflow.cto'
import { CIDZero } from '../storage/HashUtils'


export const Message0 : MessageCTOGet = {
    id:      CIDZero,
    votes:    0,
    myvotes:  0,
    children: [],
    version:  0,
    offset:   0,
    topic:    0,
    forumAddress: '0x0',
    parent:   CIDZero,
    author:   '',
    date:     0,
    body:     '',
    confirmed: true
}


export default class Message extends IPFSMessage {

    public forum: Forum

    public id: CID
    public parent: CID

    public children: string[] = []
    public votes: number = 0
    public myvotes: number = 0
    public confirmed: boolean = true
    public filled: boolean = false
    public error?: Error | null

    constructor(forum: Forum, m: MessageCTOGet) {
        super()

        this.forum = forum

        this.id       = m.id
        this.parent   = m.parent
        this.offset   = m.offset
        this.votes    = m.votes
        this.myvotes  = m.myvotes
        this.version  = m.version
        this.offset   = m.offset
        this.topic    = m.topic
        this.parent   = m.parent
        this.author   = m.author
        this.date     = m.date
        this.body     = m.body
        this.confirmed = m.confirmed

        this.children = m.children.map(child => {
            this.forum.messages.add(new Message(forum, child))
            return child.id
        })
    }

    votesDisabled() {
        return (this.author === this.forum.account || this.forum.hasEnded)
    }

    upvoteDisabled() {
        return (this.votesDisabled() || this.myvotes > 0)
    }

    downvoteDisabled() {
        return (this.votesDisabled() || this.myvotes < 0)
    }
}

