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

const questionAvatar = require('../images/question-avatar.svg')
const voteTriangle = require('../images/vote-triangle.svg')


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
        this.subscribe(this.props.forum)
    }

    componentWillUnmount() {
        this.unsubscribe(this.props.forum)
    }

    subscribe(forum: Forum) {
        forum.subscribeMessages('0x0', this.refreshMessages)
        this.refreshMessages()

        forum.subscribeLotteries(this.refreshLotteries)
        this.refreshLotteries()
    }

    unsubscribe(forum: Forum) {
        forum.subscribeMessages('0x0', null)
        forum.subscribeLotteries(null)
    }

    componentWillReceiveProps(newProps) {
        // TODO: Redirect home if Forum isn't valid on account change
        if ( newProps.forum !== this.props.forum) {
            this.unsubscribe(this.props.forum)
            this.subscribe(newProps.forum)
        }
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
            <div className="left-side">
                <div className="QuestionHeader">
                    <div className="QuestionHeader-logoWrapper">
                        <img src={questionAvatar}/>
                    </div>
                    <div className="QuestionHeader-textWrapper">
                        <h6>How does Menlo.one work with relational databases?</h6>
                        <span>@cypherpunk<i className="sX"></i></span><span>104 points</span><span>19 hours ago</span>
                    </div>
                    <div className="QuestionHeader-countdown">
                        {this.state.lottery &&
                        <CountdownTimer date={new Date(this.state.lottery.endTime)}/>}
                    </div>
                </div>
                <div className="Question-stats">
                    <div className="stat">
                        <div className="number-circle"><span>84%</span></div>
                        <div className="stat-label-wrapper">
                            <span>Payout for Winning Answer</span>
                            <span>1,337 ONE token ($41 USD)</span>
                        </div>
                    </div>
                    <div className="stat">
                        <div className="number-circle"><span>84%</span></div>
                        <div className="stat-label-wrapper">
                            <span>Most Popular</span>
                            <span>9 Replies</span>
                        </div>
                    </div>
                    <div className="stat">
                        <div className="stat-label-wrapper">
                            <span>Total Votes</span>
                            <span>
                            <i className="fa fa-fw fa-thumbs-up"></i>
                            210
                            <i className="fa fa-fw fa-thumbs-down"></i>
                            10
                        </span>
                        </div>
                    </div>
                </div>
                <div className="Question-wrapper left-side-wrapper">
                    <span className="small-heading">Question</span>
                    <p>
                        With the content node infrastructure being Node and Mongo, how can Menlo One store relational
                        data?
                    </p>
                    <p>
                        <a href="">
                        <span className="Question-upvote">
                            <img src={voteTriangle} className="icon-upvote"/>
                            Upvote (12)
                        </span>
                        </a>
                        <a href="">
                        <span className="Question-downvote">
                            <img src={voteTriangle} className="icon-downvote"/>
                            Downvote
                        </span>
                        </a>
                        <a href="">
                        <span className="Question-reply">
                            Reply
                        </span>
                        </a>
                        <a href="">
                        <span className="Question-permalink">
                            Permalink
                        </span>
                        </a>
                        <a href="">
                        <span className="Question-report">
                            Report
                        </span>
                        </a>
                    </p>
                </div>
                <div className="left-side-wrapper townhall">
                    <div className="expert-reviews-1">
                        <div>
                            <div className="comments">
                                <div className="message-wrapper">
                                    <span className="small-heading">Townhall</span>
                                </div>
                                <ul>
                                    {this.renderMessages()}

                                    {
                                        this.state.showCompose &&
                                        <li>
                                            <div className='content message-wrapper'>
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
        )
    }
}

export default withAcct(MessageBoard)

