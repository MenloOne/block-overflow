import * as React from 'react'
import Moment from 'react-moment'
import moment from 'moment'
import 'bootstrap/dist/css/bootstrap.min.css'

import TopNav from '../components/TopNav'
import Loader from '../components/Loader'
import Sidebar from '../components/Sidebar'

import AnswersBoard from './AnswersBoard'
import { Forum, ForumContext } from '../models/Forum'
import { AccountContext, withAcct, MetamaskStatus } from "../models/Account";
import { history } from '../router'

import Lottery from '../models/Lottery'
import { CIDZero } from '../storage/HashUtils'

import utils from '../utils'

import '../App.scss'


interface ForumProps {
    params: { address: string },
    acct: AccountContext
}

interface ForumState {
    forum: ForumContext
    lottery?: Lottery,
}


class AnswersPage extends React.Component<ForumProps> {

    state : ForumState
    forum : Forum

    constructor(props : ForumProps, context) {
        super(props, context)

        this.forum = new Forum(props.params.address)

        this.state = {
            forum: { model: this.forum, svc: this.forum}
        }

        this.refreshLotteries = this.refreshLotteries.bind(this)
        this.refreshMessages = this.refreshMessages.bind(this)

        this.prepForum(props)

        this.updateForum(props)
    }

    componentWillMount() {
        this.subscribe(this.state.forum.svc)
    }

    componentWillUnmount() {
        this.unsubscribe(this.state.forum.svc)
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

    async refreshMessages() {
        const messages = await this.state.forum.svc.getChildrenMessages(CIDZero)
        this.setState({ messages })
    }

    async refreshLotteries() {
        const lottery = await this.state.forum.model.lottery
        this.setState({ lottery })
    }


    async prepForum(props: ForumProps) {
        try {
            await this.forum.setAccount(props.acct.svc)
        } catch (e) {
            // If this fails we probably got a bad forum address
            console.log('Error setting up forum ', e)
            history.push('/')
        }
        this.setState({ forum: { model: Object.assign({}, this.forum), svc: this.forum }  })
    }

    componentWillReceiveProps(nextProps : ForumProps, nextContext) {
        this.updateForum(nextProps)
    }

    async updateForum(nextProps: ForumProps) {

        if (nextProps.params.address !== this.props.params.address) {
            this.forum = new Forum(nextProps.params.address)
            this.prepForum(nextProps)
        }

        if (nextProps.acct.model.address !== this.props.acct.model.address) {
            this.prepForum(nextProps)
        }

        await this.state.forum.svc.ready
        this.subscribe(this.state.forum.svc)

    }

    render() {

        let hours;

        hours = false;
        
        if (this.state.forum.model.topic && this.state.forum.model.topic.date && this.state.forum.model.topic.date !== 0) {
            const end = moment(this.state.forum.model.topic.date)
            const now = moment(Date.now())

            const duration = moment.duration(now.diff(end));
            hours = duration.asHours() < 0 ? (duration.asHours() * -1).toFixed(0) : duration.asHours().toFixed(0);
        }

        return (
            
            <div>
                <TopNav/>

                <div className="content-wrapper">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <p className="Page-permalink">
                                    <a href="/">Topics</a>
                                    {this.state.forum.model.topic && this.state.forum.model.topic.title && <span> &bull; </span>}
                                    {this.state.forum.model.topic && this.state.forum.model.topic.title && <span>{this.state.forum.model.topic.title}</span>}
                                </p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-8">
                                <AnswersBoard forum={this.state.forum} />
                            </div>
                            <div className="col-4 sidebar">

                                <div className="user-stats right-side-box white-bg">
                                    <div className="block-header">
                                        <h4>Thread Metrics</h4>
                                    </div>
                                    <div className="block-padding">

                                        {(this.props.acct.model.status === MetamaskStatus.Ok && this.state.forum.svc.synced.isFulfilled()) ? <div className="stat"><div className="stat-label-wrapper">
                                                <span className="number-circle">
                                                    {this.state.forum.model.messages.messages[0].children.length}
                                                </span>
                                                <div className="stat-labels">
                                                    <span>Total Answers</span>
                                                </div>
                                            </div>
                                        </div> : <div className="stat"><div className="stat-label-wrapper"><Loader /></div></div>}

                                        {(this.state.lottery && this.state.lottery.pool !== 0 && this.props.acct.model.status === MetamaskStatus.Ok && this.state.forum.svc.synced.isFulfilled()) ? (<div className="stat">
                                                <div className="stat-label-wrapper">
                                                    <span className="number-circle">
                                                        {utils.formatNumber(this.state.lottery.pool.toFixed(0))}
                                                    </span>
                                                    <div className="stat-labels">
                                                        {this.state.lottery && this.state.lottery.endTime < Date.now() && this.state.lottery && this.state.lottery.claimed && (this.state.lottery.author !== this.state.lottery.winner) && <span>ONE rewarded</span>}
                                                        {this.state.lottery && this.state.lottery.endTime < Date.now() && this.state.lottery && this.state.lottery.claimed && (this.state.lottery.author === this.state.lottery.winner) && <span>ONE reclaimed</span>}
                                                        {this.state.lottery && this.state.lottery.endTime < Date.now() && this.state.lottery && !this.state.lottery.claimed ? <span>to be claimed</span> : null}
                                                        {this.state.lottery && this.state.lottery.endTime > Date.now() && this.state.lottery && !this.state.lottery.claimed ? <span>ONE bounty</span> : null}
                                                        {/* <span>($11 USD)</span> */}
                                                    </div>
                                                </div>
                                        </div>) : <div className="stat"><div className="stat-label-wrapper"><Loader /></div></div>}
                                        {(this.props.acct.model.status === MetamaskStatus.Ok && this.state.forum.svc.synced.isFulfilled()) ? <div className="stat">
                                            <div className="stat-label-wrapper">
                                                <span className="number-circle">
                                                    {this.state.lottery && this.state.lottery.winningVotes ? utils.formatNumber(this.state.lottery.winningVotes) : 0}
                                                </span>
                                                <div className="stat-labels">
                                                    <span>Winning Votes</span>
                                                </div>
                                            </div>
                                        </div> : <div className="stat"><div className="stat-label-wrapper"><Loader /></div></div>}
                                        {(this.props.acct.model.status === MetamaskStatus.Ok && this.state.forum.svc.synced.isFulfilled()) && this.state.lottery && this.state.lottery.endTime ? <div className="stat">
                                            <div className="stat-label-wrapper">
                                                <span className="number-circle">
                                                    {hours}
                                                </span>
                                                <span className="stat-labels">
                                                    <span>Question Age (hours)</span>
                                                    <span> <Moment format="MMM D, YYYY h:MMa">{this.state.forum.model.topic ? this.state.forum.model.topic.date : ''}</Moment></span>
                                                </span>
                                            </div>
                                        </div> : <div className="stat"><div className="stat-label-wrapper"><Loader /></div></div>}
                                    </div>
                                </div>
                                <Sidebar />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withAcct(AnswersPage)
