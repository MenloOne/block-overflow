import ForumService from "./ForumService";
import { IPFSMessage } from "../storage/RemoteIPFSStorage";

export default class Message extends IPFSMessage {

    public forum: ForumService

    public id: string
    public parent: string
    public children: string[]

    public votes: number
    public myvotes: number

    constructor(forum, id, parent, offset) {
        super()

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
        return (this.author === this.forum.account || this.forum.lottery.hasEnded)
    }

    upvoteDisabled() {
        return (this.votesDisabled() || this.myvotes > 0)
    }

    downvoteDisabled() {
        return (this.votesDisabled() || this.myvotes < 0)
    }
}

