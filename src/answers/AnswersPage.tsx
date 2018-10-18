import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

import TopNav from '../components/TopNav'
import Loader from '../components/Loader'
import AddressTag from '../components/AddressTag'
import Sidebar from '../components/Sidebar'

import AnswersBoard from './AnswersBoard'
import { Forum, ForumContext } from '../models/Forum'
import { AccountContext, withAcct, MetamaskStatus } from "../models/Account";
import { history } from '../router'

import utils from '../utils'

import '../App.scss'


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

    async updateForum(nextProps : ForumProps) {
        if (nextProps.params.address !== this.props.params.address) {
            this.forum = new Forum(nextProps.params.address)
            this.prepForum(nextProps)
        }

        if (nextProps.acct.model.address !== this.props.acct.model.address) {
            this.prepForum(nextProps)
        }
    }

    render() {
        

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
                                    {this.state.forum.model.topic && this.state.forum.model.topic.title && <AddressTag link={true} etherscanTab="tokentxns" address={this.state.forum.model.contractAddress} />}
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
                                        {this.state.forum.model.lottery.winningVotes ? <div className="stat">
                                            <div className="stat-label-wrapper">
                                                <span className="number-circle">
                                                    {this.state.forum.model.lottery.winningVotes ? utils.formatNumber(this.state.forum.model.lottery.winningVotes) : 0}
                                                </span>
                                                <span>Total Votes</span>
                                                {/* {false &&
                                            <span>
                                                <i className="fa fa-fw fa-thumbs-down"></i>
                                                {this.state.forum.model.lottery.winningOffset && utils.formatNumber(this.state.forum.model.lottery.winningOffset)}
                                            </span>
                                        } */}
                                            </div>
                                        </div> : null}
                                        {(this.props.acct.model.status === MetamaskStatus.Ok && this.state.forum.svc.synced.isFulfilled()) ?
                                            <div className="stat">
                                                <div className="stat-label-wrapper">
                                                    <span className="number-circle">
                                                        {this.state.forum.model.messages.messages[0].children.length}
                                                    </span>
                                                    <span>Total Answers</span>
                                                </div>
                                            </div> : <Loader />}
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
