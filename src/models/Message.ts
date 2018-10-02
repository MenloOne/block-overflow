import { Forum } from "./Forum";
import { IPFSMessage } from "../storage/RemoteIPFSStorage";
import { CID } from 'ipfs'


export default class Message extends IPFSMessage {

    public forum: Forum

    public id: CID
    public parent: CID

    public children: string[] = []
    public votes: number = 0
    public myvotes: number = 0

    public filled: boolean = false
    public error?: Error | null

    constructor(forum: Forum, id: CID, parent: CID, offset: number) {
        super()

        this.forum = forum
        this.id = id

        // IPFS Message
        this.parent  = parent
        this.offset  = offset

        this.body = 'Loading from IPFS...'
    }

    votesDisabled() {
        return (this.author === this.forum.account || this.forum.lottery.hasEnded)
    }

    upvoteDisabled() {
        return (this.votesDisabled() || this.myvotes > 0)
    }

    downvoteDisabled() {
        return (this.votesDisabled() || this.myvotes < 0)
    }
}

