import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Blockies from 'react-blockies'

import { AccountContext, MetamaskStatus, withAcct } from '../services/Account'
import { Forum } from '../services/Forum'
import Lottery from '../services/Lottery'

import MessageRow from './MessageRow'
import MessageForm from './MessageForm'
import CountdownTimer from '../components/CountdownTimer'

import '../App.scss'


interface MessageBoardProps {
    acct: AccountContext,
    forum: Forum
}

interface MessageBoardState {
    messages: any[],
    topFive: boolean,
    showCompose: boolean,
    lottery?: Lottery,
}

class MessageBoard extends React.Component<MessageBoardProps> {

    state : MessageBoardState

    constructor(props: any, context: any) {
        super(props, context)

        this.onSubmitMessage = this.onSubmitMessage.bind(this)
        this.onChangeReplying = this.onChangeReplying.bind(this)
        this.claimWinnings = this.claimWinnings.bind(this)
        this.refreshLotteries = this.refreshLotteries.bind(this)
        this.refreshMessages = this.refreshMessages.bind(this)
        
        this.state = {
            messages: [],
            topFive: false,
            showCompose: true
        }
    }

    componentDidMount() {
        this.props.forum.subscribeMessages('0x0', this.refreshMessages)
        this.refreshMessages()

        this.props.forum.subscribeLotteries(this.refreshLotteries)
        this.refreshLotteries()
    }

    componentWillUnmount() {
        this.props.forum.subscribeMessages('0x0', null)
        this.props.forum.subscribeLotteries(null)
    }

    componentWillReceiveProps(newProps) {
        // TODO: Redirect home if Forum isn't valid on account change
    }

    async refreshMessages() {
        const messages = await this.props.forum.getChildrenMessages('0x0')
        this.setState({ messages })
    }

    async refreshLotteries() {
        const lottery = await this.props.forum.lottery
        this.setState({ lottery })
    }

    claimWinnings() {
        if (this.state.lottery) {
            this.state.lottery.claimWinnings()
        }
    }

    onSubmitMessage(body) {
        return this.props.forum.createMessage(body, null)
    }

    topFiveMessages() {
        return this.state.messages
            .sort((a, b) => {
                if (a.votes > b.votes) {
                    return -1
                }

                if (a.votes < b.votes) {
                    return 1
                }

                return 0
            })
            .slice(0, 5)
    }

    renderMessagesFilterButton() {
        if (this.state.topFive) {
            return (<button onClick={() => this.setState({ topFive: false })}>View All Messages</button>)
        } else {
            return (<button onClick={() => this.setState({ topFive: true })}>View Top Five Messages</button>)
        }
    }

    onChangeReplying(replying) {
        this.setState({ showCompose: !replying })
    }

    renderCompleted() {
        return null
    }

    renderLottery(lottery) {
        return (
            <div className='lottery-block right-side'>
                <h4>Answers</h4>

                { !lottery.hasEnded &&
                    <div>
                        <div className='message'>TIME LEFT</div>
                        <div className='time-left'>
                            <CountdownTimer date={ new Date(lottery.endTime) }/>
                        </div>
                    </div>
                }
                { !(lottery.winner) &&
                    <div className='message' style={{ top: '0.3em', textAlign: 'center' }}>
                        TOP VOTED ANSWER WINS { lottery.pool.toFixed(1) } TOKENS<br/>
                        NO VOTES YET...
                    </div>
                }
                {
                    lottery.winner &&
                    <span>
                        {  lottery.iWon && !lottery.claimed && <div className='message'>YOU WON!!!</div> }
                        {  lottery.iWon &&  lottery.claimed && <div className='message'>TOKENS CLAIMED</div> }
                        { !lottery.iWon && <div className='winners-message'>CURRENT WINNER</div> }
                        <div className='winners-block'>
                            <div className='winners'>
                                <div className='pedestal'>
                                    <div className='user-img'>
                                        <Blockies seed={ lottery.winner } size={10} scale={3}/>
                                    </div>
                                    <div className='tokens'>
                                        { Number(lottery.pool) === 0 ? <span>PAID<br/>OUT</span> : Number(lottery.pool).toFixed(1) }
                                        { Number(lottery.pool) === 0 ? null : <span><br/>ONE</span> }
                                    </div>
                                </div>
                            </div>
                            {
                                lottery.iWon && !lottery.claimed &&
                                <div className='claim'>
                                    <button className='btn claim-btn' onClick={this.claimWinnings}>CLAIM { Number(lottery.pool).toFixed(1) } ONE TOKENS</button>
                                </div>
                            }
                        </div>
                    </span>
                }
            </div>
        )
    }

    renderUserStats() {
        return (
            <div className="user-stats right-side-box white-bg">
                <h4>User Metrics</h4>
                <div className="stats-wrapper">
                    <div className="stat">
                        <div className="number-circle">
                            <span>84%</span>
                        </div>
                        <div className="stat-label-wrapper">
                            <span>Your Reputation</span>
                            <span>3,812 Reviews</span>
                        </div>
                    </div>
                    <div className="stat">
                        <div className="number-circle">
                            <span>102</span>
                        </div>
                        <div className="stat-label-wrapper">
                            <span>ONE Tokens Earned</span>
                            <span>($10 USD)</span>
                        </div>
                    </div>
                    <div className="stat">
                        <div className="number-circle">
                            <span>12</span>
                        </div>
                        <div className="stat-label-wrapper">
                            <span>Your Posts</span>
                            <span>See Posts</span>
                        </div>
                    </div>
                    <div className="stat">
                        <div className="number-circle">
                            <span>9</span>
                        </div>
                        <div className="stat-label-wrapper">
                            <span>Paid Views</span>
                            <span>Link</span>
                        </div>
                    </div>
                </div>
                {/* <div className="userstats-countdown-wrapper">
                    <span className="userstats-countdown-label">Conversation Ends</span>
                    <div className="userstats-timeblock-wrapper">
                        <div className="userstats-timeblock">
                            <div className="userstats-block">00</div>
                            <div className="userstats-label">Days</div>
                        </div>
                        <div className="userstats-divider">
                            <div className="userstats-block">:</div>
                            <div className="userstats-label">&nbsp;</div>
                        </div>
                        <div className="userstats-timeblock">
                            <div className="userstats-block">00</div>
                            <div className="userstats-label">Hours</div>
                        </div>
                        <div className="userstats-divider">
                            <div className="userstats-block">:</div>
                            <div className="userstats-label">&nbsp;</div>
                        </div>
                        <div className="userstats-timeblock">
                            <div className="userstats-block">00</div>
                            <div className="userstats-label">Minutes</div>
                        </div>
                        <div className="userstats-divider">
                            <div className="userstats-block">:</div>
                            <div className="userstats-label">&nbsp;</div>
                        </div>
                        <div className="userstats-timeblock">
                            <div className="userstats-block">00</div>
                            <div className="userstats-label">Seconds</div>
                        </div>
                    </div>
                </div> */}
            </div>
        )
    }

    renderMessages() {
        if (this.state.messages.length === 0 && (this.props.acct.model.status !== MetamaskStatus.Ok || !this.props.forum.synced.isFulfilled())) {
            return (<li className='borderis'>
                <div style={{ paddingBottom: '3em' }}>
                    Loading Discussion...
                </div>
            </li>)
        }

        if (this.state.messages.length === 0) {
            return (<li className='borderis'>
                <div style={{ paddingBottom: '3em' }}>
                    Be the first to leave a comment...
                </div>
            </li>)
        }

        const messages = this.state.topFive ? this.topFiveMessages() : this.state.messages

        return messages.map((m, index) => {
            return (
                <div key={index} className='row'>
                    <div className='col-12'>
                        <MessageRow key={m.id}
                                    forumService={this.props.forum}
                                    message={m}
                                    onChangeReplying={this.onChangeReplying}
                        />
                    </div>
                </div>
            )
        })
    }


    render() {
        return (
            <div className='row'>
                <div className="col-md-8">

                    <div className="left-side">
                        <div className="left-side-wrapper">
                            <div className="expert-reviews-1 left-side white-bg">
                                <h2>Townhall</h2>
                                <h6>If anyone makes money off your internet activity,<br />it should be you. Build a reputation and profit. </h6>
                                <p>What is TownHall? Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation </p>
                                <div className="comments">
                                    <ul>
                                        { this.renderMessages() }

                                        {
                                            this.state.showCompose &&
                                            <li>
                                                <div className='content'>
                                                    <MessageForm onSubmit={this.onSubmitMessage}/>
                                                </div>
                                            </li>
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className='right-side'>
                        {this.renderUserStats()}
                        {this.state.lottery &&
                            <div className="lottery right-side-box white-bg">
                                {this.renderLottery(this.state.lottery)}
                            </div>
                        }
                    </div>
                </div>
            </div>



        )
    }
}

export default withAcct(MessageBoard)

