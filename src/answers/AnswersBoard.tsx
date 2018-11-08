import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Blockies from 'react-blockies'
import MarkDown from 'react-markdown-renderer'
import Moment from 'react-moment'

import { AccountContext, withAcct } from '../models/Account'
import { Forum, ForumContext } from '../models/Forum'
import { CIDZero } from '../storage/HashUtils'

import CountdownTimer from '../components/CountdownTimer'
import Loader from '../components/Loader'
import AddressTag from '../components/AddressTag'


import utils from '../utils'

import AnswerRow from './AnswerRow'
import AnswerForm from './AnswerForm'

import '../App.scss'
import './Answers.scss'

// const ONElogo = require('../images/menlo/menlo-one-logo-dark.svg')

interface MessageBoardProps {
    acct: AccountContext,
    forum: ForumContext
}

interface MessageBoardState {
    messages: any[],
    topFive: boolean,
    isCommenting: boolean,
    url?: string,
    topicAvatar: Element | null
}

class AnswersBoard extends React.Component<MessageBoardProps> {

    state : MessageBoardState

    constructor(props: MessageBoardProps, context: any) {
        super(props, context)

        this.onSubmitMessage = this.onSubmitMessage.bind(this)
        this.onChangeReplying = this.onChangeReplying.bind(this)
        this.claimWinnings = this.claimWinnings.bind(this)
        this.refreshMessages = this.refreshMessages.bind(this)
        this.clickClaimTokens = this.clickClaimTokens.bind(this)

        this.state = {
            messages: [],
            topFive: false,
            isCommenting: false,
            topicAvatar: null
        }
    }

    componentWillMount() {
        this.updateForum(this.props.forum)
        this.subscribe(this.props.forum.svc)
    }

    componentDidMount() {
        const url = this.props.acct.svc.getEtherscanUrl(this.props.forum.model.contractAddress)
        this.setState({ url })
    }

    componentWillUnmount() {
        this.unsubscribe(this.props.forum.svc)
    }

    subscribe(forum: Forum) {
        forum.subscribeMessages(CIDZero, this.refreshMessages)
        this.refreshMessages()
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
        await this.props.forum.svc.claimWinnings()
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

    claimWinnings() {
        this.props.forum.svc.claimWinnings()
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
        if (this.state.messages.length === 0) {
            if (this.props.forum.model.hasEnded) {
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
                                this.props.forum.model.hasEnded &&
                                <span>
                                    <span className="QuestionHeader-annotation">QUESTION CLOSED</span>
                                    {!this.state.messages.length && <span className="QuestionHeader-annotation">NO ANSWER</span>}
                                    {
                                        this.props.forum.model.iWon && this.props.forum.model.winner === this.props.acct.model.address && !this.props.forum.model.claimed &&
                                        <a className='main-btn btn-claim' onClick={this.clickClaimTokens}>CLAIM TOKENS</a>
                                    }
                                    {
                                        this.props.forum.model.iWon && this.props.forum.model.winner !== this.props.acct.model.address && !this.props.forum.model.claimed &&
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
                        {/* <a href={''}>
                            <span className="Question-ipfsSource">
                                IPFS Source
                            </span>
                        </a> */}
                        <a target="_blank" href={this.state.url}>
                            <span className="Question-ethereumTx">
                                Ethereum Tx
                            </span>
                        </a>
                    </div>
                    <div className="Question-wrapper left-side-wrapper">
                        {
                            <h6>
                                {this.props.forum.model.topic && this.props.forum.model.topic.title}
                            </h6>
                        }
                        {this.props.forum.model.topic && this.props.forum.model.topic.body ? <MarkDown markdown={this.props.forum.model.topic.body} /> : null}

                        <div className="Question-urgency">
                            <div>
                                {!this.props.forum.model.hasEnded && <span><span className="small-subtitle">BOUNTY</span><br /></span>}
                                {this.props.forum.model.pool ? (<span className="Question-payout">
                                    {utils.formatNumber((this.props.forum.model.pool / 10 ** 18).toFixed(0))} ONE
                                    {/* <span className="one-icon"><img src={ONElogo} alt="" /></span> */}
                                </span>) : (<Loader size={22} />)}
                                {this.props.forum.model.hasEnded &&  this.props.forum.model.claimed && (this.props.forum.model.author !== this.props.forum.model.winner) && <span><br /><span className="small-subtitle">REWARDED TO WINNER</span></span>}
                                {this.props.forum.model.hasEnded &&  this.props.forum.model.claimed && (this.props.forum.model.author === this.props.forum.model.winner) && <span><br /><span className="small-subtitle">BOUNTY RECLAIMED BY AUTHOR</span></span>}
                                {this.props.forum.model.hasEnded && !this.props.forum.model.claimed ? <span><br /><span className="small-subtitle">TO BE CLAIMED</span></span> : null}
                            </div>
                            {(this.state && this.props.forum.model.endTimestamp && this.props.forum.model.endTimestamp !== 0 && this.props.forum.model.endTimestamp > Date.now()) ?
                            (
                            <div>
                                <div className="Question-countdownWrapper">
                                    <span className="small-subtitle">TIME LEFT</span>
                                    <CountdownTimer date={new Date(this.props.forum.model.endTimestamp)} />
                                </div>
                            </div>
                            ) : (null)
                            }
                        </div>

                        <p className="Question-actionWrapper">
                            {
                                !this.props.forum.model.hasEnded &&
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
                                        !this.state.isCommenting && !this.props.forum.model.hasEnded &&
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

