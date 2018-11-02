import * as React from 'react'
import moment from 'moment'

import TopNav from '../components/TopNav'
import AnswersBoard from './AnswersBoard'
import { Forum, ForumContext } from '../models/Forum'
import { AccountContext, MetamaskStatus, withAcct } from '../models/Account'
import { history } from '../router'
import A from '../components/A'
import Sidebar from '../components/Sidebar'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../App.scss'
import Moment from 'react-moment'
import Loader from '../components/Loader'
import utils from '../utils'


interface ForumProps {
    params: { address: string },
    acct: AccountContext
}

interface ForumState {
    forum: ForumContext
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
        
        this.prepForum(props)
    }

    async prepForum(props: ForumProps) {
        try {
            await this.forum.setWeb3Account(props.acct.svc)
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

    async updateForum(nextProps : ForumProps) {
        if (nextProps.params.address !== this.props.params.address) {
            this.forum = new Forum(nextProps.params.address)
            this.prepForum(nextProps)
            return
        }

        if (nextProps.acct.model.address !== this.props.acct.model.address) {
            this.prepForum(nextProps)
        }
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
                                    <A href='/'>Topics</A>
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

                                        {(this.props.acct.model.status === MetamaskStatus.Ok && this.state.forum.svc.ready.isFulfilled()) ? <div className="stat"><div className="stat-label-wrapper">
                                                <span className="number-circle">
                                                    {this.state.forum.model.messages.messages[0].children.length}
                                                </span>
                                            <div className="stat-labels">
                                                <span>Total Answers</span>
                                            </div>
                                        </div>
                                        </div> : <div className="stat"><div className="stat-label-wrapper"><Loader /></div></div>}

                                        {(this.state.forum.model.pool !== 0 && this.props.acct.model.status === MetamaskStatus.Ok && this.state.forum.svc.ready.isFulfilled()) ? (<div className="stat">
                                            <div className="stat-label-wrapper">
                                                    <span className="number-circle">
                                                        {utils.formatNumber((this.state.forum.model.pool / 10 ** 18).toFixed(0))}
                                                    </span>
                                                <div className="stat-labels">
                                                    {this.state.forum.model.endTimestamp < Date.now() &&  this.state.forum.model.claimed && (this.state.forum.model.author !== this.state.forum.model.winner) && <span>ONE rewarded</span>}
                                                    {this.state.forum.model.endTimestamp < Date.now() &&  this.state.forum.model.claimed && (this.state.forum.model.author === this.state.forum.model.winner) && <span>ONE reclaimed</span>}
                                                    {this.state.forum.model.endTimestamp < Date.now() && !this.state.forum.model.claimed ? <span>to be claimed</span> : null}
                                                    {this.state.forum.model.endTimestamp > Date.now() && !this.state.forum.model.claimed ? <span>ONE bounty</span> : null}
                                                    {/* <span>($11 USD)</span> */}
                                                </div>
                                            </div>
                                        </div>) : <div className="stat"><div className="stat-label-wrapper"><Loader /></div></div>}
                                        {(this.props.acct.model.status === MetamaskStatus.Ok && this.state.forum.svc.ready.isFulfilled()) ? <div className="stat">
                                            <div className="stat-label-wrapper">
                                                <span className="number-circle">
                                                    {this.state.forum.model.winningVotes ? utils.formatNumber(this.state.forum.model.winningVotes) : 0}
                                                </span>
                                                <div className="stat-labels">
                                                    <span>Winning Votes</span>
                                                </div>
                                            </div>
                                        </div> : <div className="stat"><div className="stat-label-wrapper"><Loader /></div></div>}
                                        {(this.props.acct.model.status === MetamaskStatus.Ok && this.state.forum.svc.ready.isFulfilled()) && this.state.forum.model.endTimestamp ? <div className="stat">
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
