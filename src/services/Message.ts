import ForumService from "./ForumService";

export default class Message {

    public forum: ForumService
    public id: string
    public author: string
    public parent: string
    public offset: number
    public children: string[]
    public votes: number
    public myvotes: number
    public body: string

    constructor(forum, id, parent, offset) {
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

