import { Forum } from "./Forum";
import Message from './Message'
import { CIDZero } from '../storage/HashUtils'


export type LotteriesCallback  = () => void

export default class Lottery {

    private forum: Forum

    public  endTime: number = 0
    public  endTimeServer: number = 0

    public  author: string = ''
    public  pool: number = 0
    public  tokenBalance: number = 0
    public  willReconcile: boolean = false
    public  hasEnded: boolean = false
    public  claimed: boolean = false
    public  iWon: boolean = false

    public  winningVotes: number
    public  winningOffset: number
    public  winningMessage: Message | null
    public  winner: string | null

    public lotteriesCallback: LotteriesCallback | null


    constructor( _forum : Forum ) {
        this.forum = _forum
        this.claimed = false

        this.refresh = this.refresh.bind(this)
    }

    async refresh() {
        await this.forum.synced
        const contract = this.forum.contract!;

        [this.pool, this.endTimeServer] = (await Promise.all([ contract.pool, contract.endTimestamp ])).map(n => n.toNumber())
        this.pool /= 10 ** 18

        // Convert to JS time
        this.endTimeServer *= 1000

        if (!this.endTime) {
            this.endTime = this.endTimeServer
        }

        this.author = await contract.author
        const now = (new Date()).getTime()
        this.hasEnded = (this.endTimeServer < now)
        this.willReconcile = (this.hasEnded && (this.winner !== null))
        this.winningVotes = (await contract.winningVotes).toNumber()
        this.winningOffset = (await contract.winningOffset).toNumber()
        this.winningMessage = this.forum.messages.get(this.forum.topicHashes[this.winningOffset])
        this.tokenBalance = (await this.forum.tokenContract!.balanceOf(this.forum.contractAddress)).toNumber()
        if (this.winningMessage && this.winningMessage.id !== CIDZero) {
            this.winner = this.winningMessage.author
        } else {
            this.winner = this.forum.topic.author
        }
        this.iWon = this.winner === this.forum.account

        this.updateEndTimeTimer()

        if (this.lotteriesCallback) {
            this.lotteriesCallback()
        }
    }

    noWinners() : boolean {
        return this.author === this.winner
    }

    subscribe(callback : LotteriesCallback | null) {
        this.lotteriesCallback = callback
    }

    markClaimed() {
        this.claimed = true
    }

    updateEndTimeTimer() {
        const now = (new Date()).getTime()

        if ( this.endTime < now ) {
            return
        }

        setTimeout(() => {
            this.refresh
        }, this.endTime - now)
    }

    async claimWinnings() {
        await this.forum.ready

        try {
            
            await this.forum.contract!.claimTx().send({})
        } catch (e) {
            console.error(e)
            throw (e)
        }

        this.forum.refreshBalances()
    }
}
