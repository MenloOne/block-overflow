import Message from './Message'
import { Forum } from "./Forum";


export type LotteriesCallback  = () => void

export default class Lottery {

    private forum: Forum

    public  endTime: number = 0
    public  endTimeServer: number = 0
    private lotteryTimeout: NodeJS.Timer | null

    public  author: string = ''
    public  pool: number = 0
    public  willReconcile: boolean = false
    public  hasEnded: boolean = false
    public  claimed: boolean = false
    public  iWon: boolean = false
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
        this.winner = this.calcWinner()
        const now = (new Date()).getTime()
        this.hasEnded = (this.endTimeServer < now)
        this.willReconcile = (this.hasEnded && (this.winner !== null))

        if ( this.hasEnded && !this.willReconcile ) {
            this.winner = await contract.winner
        }

        this.updateEndTimeTimer()
        this.iWon = this.winner === this.forum.account
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
            // We're in a weird state where the server will continue the current lottery
            // as soon as someone pays up.  Assume more time
            this.endTime = (new Date(now + this.forum.lotteryLength)).getTime()
        }

        if (this.lotteryTimeout) {
            clearTimeout(this.lotteryTimeout)
            this.lotteryTimeout = null
        }

        if (now < this.endTime) {
            this.lotteryTimeout = setTimeout(() => {
                this.refresh
            }, this.endTime - now)
        }
    }

    calcWinningMessage() : Message | null {
        const [from, to] = [1, this.forum.topicHashes.length]

        if (to <= from) {
            return null
        }

        const eligibleMessages : Message[] = []

        for (let i = from; i < to; i++) {
            const msg = this.forum.getMessage(this.forum.topicHashes[i])
            if (!msg || msg.votes <= 0) {
                continue
            }
            eligibleMessages.push(msg)
        }

        // No votes, no winners
        if (eligibleMessages.length === 0) {
            return null
        }

        // Sort by votes descending, then offset ascending
        const winners = eligibleMessages.sort((a: Message, b: Message) => {
            const diff = b.votes - a.votes
            return (diff === 0) ? a.offset - b.offset : diff
        }).filter(m => m != null && typeof m !== 'undefined')

        // Filter out nulls
        return winners.length > 0 ? winners[0] : null
    }

    calcWinner() : string | null {
        const m = this.calcWinningMessage()
        if (!m) {
            return null
        }

        return m.author
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
