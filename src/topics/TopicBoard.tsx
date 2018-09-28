import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

import { AccountService, MetamaskStatus, withAcct } from '../services/AccountService'
import TopicsService from '../services/TopicsService'

import TopicComponent from './Topic'
import TopicForm from './TopicForm'

import Topic from "../services/Topic";
import '../App.scss'


interface TopicBoardProps {
    acct: AccountService
}

interface TopicBoardState {
    messages: Topic[],
    topFive: boolean,
    showCompose: boolean,
    topics?: TopicsService,
}

class TopicBoard extends React.Component<TopicBoardProps> {

    topics: TopicsService
    state : TopicBoardState = {
        messages: [],
        topFive: false,
        showCompose: true
    }
    

    constructor(props: any, context: any) {
        super(props, context)

        this.onSubmitMessage = this.onSubmitMessage.bind(this)
        this.onChangeReplying = this.onChangeReplying.bind(this)
        this.claimWinnings = this.claimWinnings.bind(this)
        this.topicsChanged = this.topicsChanged.bind(this)
        
        this.topics = new TopicsService()
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.updateTopics(nextProps)
    }

    async updateTopics(nextProps) {
        if (nextProps.acct !== this.props.acct) {
            try {
                await this.topics!.setAccount(nextProps.acct)
            } catch (e) {
                nextProps.acct.contractError(e)
            }
        }
    }

    componentDidMount() {
        this.topics.subscribeTopics(this.topicsChanged)
        this.topicsChanged()
    }

    componentWillUnmount() {
        this.topics.subscribeTopics(null)
    }

    async topicsChanged() {
        const messages = await this.topics.getTopics()

        this.setState({
            topics: Object.assign({}, this.topics),
            messages
        })
    }

    claimWinnings() {
    }

    onSubmitMessage(body) {
        return this.topics.createTopic(body, 15)
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
        if (this.state.messages.length === 0 && (this.props.acct.status !== MetamaskStatus.Ok || !this.topics.synced.isFulfilled())) {
            return (<li className='borderis'>
                <div style={{ paddingBottom: '3em' }}>
                    Loading Discussion...
                </div>
            </li>)
        }

        if (this.state.messages.length === 0) {
            return (<li className='borderis'>
                <div style={{ paddingBottom: '3em' }}>
                    Be the first to ask a question...
                </div>
            </li>)
        }

        return this.state.messages.map((m, index) => {
            return (
                <div key={index} className='row'>
                    <div className='col-12'>
                        <TopicComponent key={m.id}
                               service={this.state.topics!}
                               topic={m}
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
                                                    <TopicForm onSubmit={this.onSubmitMessage}/>
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
                    </div>
                </div>
            </div>
        )
    }
}

export default withAcct(TopicBoard)

