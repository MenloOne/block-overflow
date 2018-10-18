import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Blockies from 'react-blockies'
import MarkDown from 'react-markdown-renderer'
import Moment from 'react-moment'

import { AccountContext, MetamaskStatus, withAcct } from '../models/Account'
import { Forum, ForumContext } from '../models/Forum'
import Lottery from '../models/Lottery'
import { CIDZero } from '../storage/HashUtils'

import CountdownTimer from '../components/CountdownTimer'
import Loader from '../components/Loader'
import AddressTag from '../components/AddressTag'


import utils from '../utils'

import AnswerRow from './AnswerRow'
import AnswerForm from './AnswerForm'

import '../App.scss'
import './Answers.scss'

interface MessageBoardProps {
    acct: AccountContext,
    forum: ForumContext
}

interface MessageBoardState {
    messages: any[],
    topFive: boolean,
    isCommenting: boolean,
    lottery?: Lottery,
    topicAvatar: Element | null
}

class AnswersBoard extends React.Component<MessageBoardProps> {

    state : MessageBoardState

    constructor(props: MessageBoardProps, context: any) {
        super(props, context)

        this.onSubmitMessage = this.onSubmitMessage.bind(this)
        this.onChangeReplying = this.onChangeReplying.bind(this)
        this.claimWinnings = this.claimWinnings.bind(this)
        this.refreshLotteries = this.refreshLotteries.bind(this)
        this.refreshMessages = this.refreshMessages.bind(this)
        this.clickClaimTokens = this.clickClaimTokens.bind(this)

        this.state = {
            messages: [],
            topFive: false,
            isCommenting: false,
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
        forum.subscribeMessages(CIDZero, this.refreshMessages)
        this.refreshMessages()

        forum.subscribeLotteries(this.refreshLotteries)
        this.refreshLotteries()
    }

    unsubscribe(forum: Forum) {
        forum.subscribeMessages(CIDZero, null)
        forum.subscribeLotteries(null)
    }

    componentWillReceiveProps(newProps : MessageBoardProps) {
        // TODO: Redirect home if Forum isn't valid on account change
        if ( newProps.forum.svc !== this.props.forum.svc) {
            this.unsubscribe(this.props.forum.svc)
            this.updateForum(newProps.forum)
        }
    }

    async clickClaimTokens() {
        await this.props.forum.svc.lottery.claimWinnings()
    }

    async updateForum(forum : ForumContext) {
        await forum.svc.ready
        this.subscribe(forum.svc)

        if (forum.model.topic) {
            this.setState({ topicAvatar: <Blockies seed={ forum.model.topic.author } size={ 7 } scale={4} /> })
        } else {
            this.setState({ topicAvatar: null })
        }
    }

    async refreshMessages() {
        const messages = await this.props.forum.svc.getChildrenMessages(CIDZero)
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

    async onSubmitMessage(body) {
        await this.props.forum.svc.postMessage(body, null)
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

    onChangeReplying(commenting : boolean) {
        this.setState({ isCommenting: commenting })
    }

    renderMessages() {
        if (this.state.messages.length === 0 && (this.props.acct.model.status !== MetamaskStatus.Ok || !this.props.forum.svc.synced.isFulfilled())) {
            return (
                <li className='borderis message'>
                    <div style={{ paddingBottom: '3em' }}>
                        <Loader size={22} />
                    </div>
                </li>)
        }

        if (this.state.messages.length === 0) {
            if (this.props.forum.model.lottery.hasEnded) {
                return (
                    <li className='borderis message'>
                        <div style={{ paddingBottom: '3em' }}>
                            Nobody answered this question before the discussion closed.
                        </div>
                    </li>)
            }

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
                        <AnswerRow key={m.id}
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
            <div>
                <div className="left-side">
                    <div className="QuestionHeader">
                        <span className="user-img">
                            {this.state.topicAvatar}
                        </span>
                        {this.props.forum.model.topic && this.props.forum.model.topic.author && <AddressTag link={true} copy={true} address={this.props.forum.model.topic.author} />}
                        <span style={{ display: 'none' }}>?? points</span>
                        {this.props.forum.model.topic && <Moment fromNow>{this.props.forum.model.topic ? this.props.forum.model.topic.date : ''}</Moment>}
                        <div>
                            {
                                this.props.forum.model.lottery.hasEnded &&
                                <span>
                                    <span className="QuestionHeader-annotation">QUESTION CLOSED</span>
                                    {
                                        this.props.forum.model.lottery.iWon && this.props.forum.model.lottery.winner === this.props.acct.model.address && this.props.forum.model.lottery.tokenBalance > 0 &&
                                        <a className='main-btn btn-claim' onClick={this.clickClaimTokens}>CLAIM TOKENS</a>
                                    }
                                    {
                                        this.props.forum.model.lottery.iWon && this.props.forum.model.lottery.winner !== this.props.acct.model.address && this.props.forum.model.lottery.tokenBalance > 0 &&
                                        <a className='btn main-btn btn-claim' onClick={this.clickClaimTokens}>CLAIM WON TOKENS</a>
                                    }
                                </span>
                            }
                        </div>
                        <a href="">
                            <span className="Question-permalink">
                                Permalink
                            </span>
                        </a>
                    </div>
                    {/* {this.renderStats()} */}
                    <div className="Question-wrapper left-side-wrapper">
                        {
                            this.props.forum.model.topic ? (
                                <h6>
                                    {this.props.forum.model.topic && this.props.forum.model.topic.title}
                                </h6>
                            ) : (
                                    <Loader size={22} style={{ margin: '0 1rem 0 0' }} />
                                )
                        }
                        {this.props.forum.model.topic && this.props.forum.model.topic.body ? <MarkDown markdown={this.props.forum.model.topic.body} /> : null}

                        <div className="Question-urgency">
                            <div>
                                {!this.props.forum.model.lottery.hasEnded && <span><span className="small-subtitle">BOUNTY</span><br /></span>}
                                {this.props.forum.model.lottery.pool ? (<span className="Question-payout">
                                    {utils.formatNumber(this.props.forum.model.lottery.pool.toFixed(0))} ONE
                                </span>) : (<Loader size={22} />)}
                                {this.props.forum.model.lottery.hasEnded && this.state.lottery && this.state.lottery.claimed && <span><br /><span className="small-subtitle">REWARDED TO WINNER</span></span>}
                                {this.props.forum.model.lottery.hasEnded && this.state.lottery && !this.state.lottery.claimed ? <span><br /><span className="small-subtitle">TO BE CLAIMED</span></span> : null}
                            </div>
                            {(this.state.lottery && this.state.lottery.endTime && this.state.lottery.endTime !== 0 && this.state.lottery.endTime > Date.now()) ?
                            (
                            <div>
                                <div className="Question-countdownWrapper">
                                    <span className="small-subtitle">TIME LEFT</span>
                                    <CountdownTimer date={new Date(this.state.lottery.endTime)} />
                                </div>
                            </div>
                            ) : (null)
                            }
                        </div>

                        <p className="Question-actionWrapper">
                            {
                                !this.props.forum.model.lottery.hasEnded &&
                                <a href='#answerForm'>
                                    <span className="Question-reply">
                                        Answer
                                    </span>
                                </a>
                            }
                            <a href="">
                            </a>
                        </p>
                    </div>
                    <div className="left-side-wrapper townhall">
                        <div className="comments">
                            <div className="message-wrapper">
                                <span className="small-heading">Answers</span>
                                <ul>
                                    {this.renderMessages()}
                                    {
                                        !this.state.isCommenting && !this.props.forum.model.lottery.hasEnded &&
                                        <li>
                                            <a id='answerForm' />
                                            <div className='reply-form'>
                                                <AnswerForm onSubmit={this.onSubmitMessage} rows={10} />
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

export default withAcct(AnswersBoard)

