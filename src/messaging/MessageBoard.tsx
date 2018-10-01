import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Blockies from 'react-blockies'

import { AccountContext, MetamaskStatus, withAcct } from '../services/Account'
import { Forum, ForumContext } from '../services/Forum'
import Lottery from '../services/Lottery'

import MessageView from './MessageView'
import MessageForm from './MessageForm'
import CountdownTimer from '../components/CountdownTimer'

import '../App.scss'



interface MessageBoardProps {
    acct: AccountContext,
    forum: ForumContext
}

interface MessageBoardState {
    messages: any[],
    topFive: boolean,
    showCompose: boolean,
    lottery?: Lottery,
    topicAvatar: Element | null
}

class MessageBoard extends React.Component<MessageBoardProps> {

    state : MessageBoardState

    constructor(props: MessageBoardProps, context: any) {
        super(props, context)

        this.onSubmitMessage = this.onSubmitMessage.bind(this)
        this.onChangeReplying = this.onChangeReplying.bind(this)
        this.claimWinnings = this.claimWinnings.bind(this)
        this.refreshLotteries = this.refreshLotteries.bind(this)
        this.refreshMessages = this.refreshMessages.bind(this)

        this.state = {
            messages: [],
            topFive: false,
            showCompose: true,
            topicAvatar: null
        }

        this.updateForum(props.forum)
    }

    componentWillMount() {
        this.subscribe(this.props.forum.svc)
    }

    componentWillUnmount() {
        this.unsubscribe(this.props.forum.svc)
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

    componentWillReceiveProps(newProps : MessageBoardProps) {
        // TODO: Redirect home if Forum isn't valid on account change
        if ( newProps.forum !== this.props.forum) {
            this.unsubscribe(this.props.forum.svc)
            this.updateForum(newProps.forum)
        }
    }

    async updateForum(forum : ForumContext) {
        await forum.svc.ready
        this.subscribe(forum.svc)

        if (forum.model.topic) {
            this.setState({ topicAvatar: <Blockies seed={ forum.model.topic.author } size={ 7 }/> })
        } else {
            this.setState({ topicAvatar: null })
        }
    }

    async refreshMessages() {
        const messages = await this.props.forum.svc.getChildrenMessages('0x0')
        this.setState({ messages })
    }

    async refreshLotteries() {
        const lottery = await this.props.forum.model.lottery
        this.setState({ lottery })
    }

    claimWinnings() {
        if (this.state.lottery) {
            this.state.lottery.claimWinnings()
        }
    }

    onSubmitMessage(body) {
        return this.props.forum.svc.createMessage(body, null)
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

    onChangeReplying(replying : boolean) {
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
                                    <button className='btn claim-btn' onClick={this.claimWinnings}>CLAIM { Number(lottery.pool).toFixed(0) } ONE TOKENS</button>
                                </div>
                            }
                        </div>
                    </span>
                }
            </div>
        )
    }


    renderMessages() {
        if (this.state.messages.length === 0 && (this.props.acct.model.status !== MetamaskStatus.Ok || !this.props.forum.svc.synced.isFulfilled())) {
            return (
                <li className='borderis message'>
                    <div style={{ paddingBottom: '3em' }}>
                        Loading Answers...
                    </div>
                </li>)
        }

        if (this.state.messages.length === 0) {
            return (
                <li className='borderis message'>
                    <div style={{ paddingBottom: '3em' }}>
                        Be the first to leave an Answer!
                    </div>
                </li>)
        }

        const messages = this.state.topFive ? this.topFiveMessages() : this.state.messages

        return messages.map((m, index) => {
            return (
                <div key={index} className='row'>
                    <div className='col-12'>
                        <MessageView key={m.id}
                                     forum={this.props.forum}
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
                        <span className="user-img">
                            { this.state.topicAvatar }
                        </span>
                    </div>
                    <div className="QuestionHeader-textWrapper">
                        <h6>
                            { this.props.forum.model.topic && this.props.forum.model.topic.body }
                        </h6>
                        <span><span className='alias'>{ this.props.forum.model.topic ? this.props.forum.model.topic.author : '...' }</span>&nbsp;<i className="sX"></i></span><span>?? points</span><span>19 hours ago</span>
                    </div>
                    <div className="QuestionHeader-countdown">
                        {this.state.lottery &&
                        <CountdownTimer date={new Date(this.state.lottery.endTime)}/>}
                    </div>
                </div>
                <div className="Question-stats">
                    <div className="stat">
                        <div className="number-circle"><span>{ this.props.forum.model.lottery.pool.toFixed(0) }</span></div>
                        <div className="stat-label-wrapper">
                            <span>Payout for Winning Answer</span>
                            <span>{ this.props.forum.model.lottery.pool.toFixed(0) } ONE Tokens</span>
                        </div>
                    </div>
                    <div className="stat">
                        <div className="number-circle"><span>{ this.state.messages.length }</span></div>
                        <div className="stat-label-wrapper">
                            <span>Activity</span>
                            <span>{ this.state.messages.length } Answer{ this.state.messages.length > 1 ? 's' : '' }</span>
                        </div>
                    </div>
                    <div className="stat">
                        <div className="stat-label-wrapper">
                            <span>Total Votes</span>
                            <span>
                            <i className="fa fa-fw fa-thumbs-up"></i>
                            { this.props.forum.model.winningVotes }
                            <i className="fa fa-fw fa-thumbs-down"></i>
                            {}
                        </span>
                        </div>
                    </div>
                </div>
                <div className="Question-wrapper left-side-wrapper">
                    <span className="small-heading">Question</span>
                    <p>
                        { this.props.forum.model.topic ? this.props.forum.model.topic.body : '...' }
                    </p>
                    <p>
                        <a href="">
                        <span className="Question-reply">
                            Answer
                        </span>
                        </a>
                        <a href="">
                        <span className="Question-permalink">
                            Permalink
                        </span>
                        </a>
                        <a href="">
                        </a>
                    </p>
                </div>
                <div className="left-side-wrapper townhall">
                    <div className="expert-reviews-1">
                        <div>
                            <div className="comments">
                                <div className="message-wrapper">
                                    <span className="small-heading">Townhall</span>
                                    <ul>
                                        {this.renderMessages()}

                                        {
                                            this.state.showCompose &&
                                            <li>
                                                <div className='reply-form'>
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
            </div>
        )
    }
}

export default withAcct(MessageBoard)

