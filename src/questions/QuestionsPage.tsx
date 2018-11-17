import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import AnimateHeight from 'react-animate-height'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'

import { AccountContext, withAcct } from '../models/Account'
import { Topics, TopicsContext, TopicsCtxtComponent } from '../models/Topics'

import TopNav from '../components/TopNav'
import Sidebar from '../components/Sidebar'

import QuestionsBoard from "./QuestionsBoard";

import TopicForm from './QuestionForm'

import '../App.scss'
import Topic from '../models/Topic'
import { withSockets } from '../SocketContext'

const BlockOverflowIcon = require('../images/menlo-logo.svg')
const how1 = require('../images/how-1.svg')
const how2 = require('../images/how-2.svg')
const how3 = require('../images/how-3.svg')
const how4 = require('../images/how-4.svg')
const how5 = require('../images/how-5.svg')
const how6 = require('../images/how-6.svg')


class QuestionsPageProps {
    acct: AccountContext
    socket: SocketIOClient.Socket
}

class QuestionsPageState {
    topics: TopicsContext
    searchQuery: string
    howToHeight: string | number | undefined
    showCompose: boolean
    showInstructions: boolean
    activeFilter: Function;
}


class QuestionsPage extends React.Component<QuestionsPageProps> {

    static topics: Topics = new Topics()

    state : QuestionsPageState
    filters: { name: string; fn: Function }[] = [
        { name: 'Most Recent', fn: (topics) => {
            return topics.sort((top, top2) => {
                console.log(top);
                
                return top2.date - top.date;
            }); 
        } },
        { name: 'Most Active', fn: (topics) => {
            return topics.sort((top, top2) => {

                return top2.totalAnswers - top.totalAnswers;
            }); 
        }
        },
        {
            name: 'Highest Stakes', fn: (topics) => {
                return topics.sort((top, top2) => {

                    return top2.pool - top.pool;
                });
            }
        },
        {
            name: 'No Answers', fn: (topics) => {
                return topics.filter((top) => {

                    return top.totalAnswers === 0;
                });
            }
        }];

    constructor(props: QuestionsPageProps, context) {
        super(props, context)

        this.topicsChanged = this.topicsChanged.bind(this)
        this.clickAsk = this.clickAsk.bind(this)
        this.onSubmitQuestion = this.onSubmitQuestion.bind(this)
        this.onCancelQuestion = this.onCancelQuestion.bind(this)
        this.clickCloseInstructions = this.clickCloseInstructions.bind(this)
        this.clickSignIn = this.clickSignIn.bind(this)
        this.onChangeSearch = this.onChangeSearch.bind(this)
        this._onSelect = this._onSelect.bind(this)

        this.state = {
            howToHeight: localStorage.getItem('HowTo-Toggle') || 'auto',
            showCompose: false,
            showInstructions: true,
            topics: { model: Object.assign({}, this.topics), svc: this.topics },
            searchQuery: '',
            activeFilter: this.filters[0].fn
        }

        this.topics.setSocket(props.socket)

        QuestionsPage.topics.setCallback(this.topicsChanged)
        this.prepTopics(props)
    }

    async prepTopics(props: QuestionsPageProps) {
        this.topics.setWeb3Account(props.acct.svc)
    }

    componentWillReceiveProps(newProps: QuestionsPageProps) {
        this.topics.setSocket(newProps.socket)

        if (newProps.acct.model !== this.props.acct.model) {
            this.prepTopics(newProps)
        }
    }

    onChangeSearch(evt) {
        const query = evt.target.value
        this.setState({ searchQuery: query })
        this.topics.setFilter(query)
    }

    get topics() : Topics {
        return QuestionsPage.topics
    }

    async topicsChanged(_topic: Topic) {
        this.setState({ topics: { model: Object.assign({}, this.topics), svc: this.topics } })
    }

    clickSignIn() {
        this.props.acct.svc.signIn()
    }

    clickCloseInstructions() {
        this.setState({ showInstructions: false })
    }

    onCancelQuestion() {
        this.setState({ showCompose: false })
    }

    async onSubmitQuestion(title: string, body: string, tokenBounty: number) {
        await this.state.topics.svc.createTopic(title, body, tokenBounty)
        this.setState({ showCompose: false })
    }

    clickAsk() {
        this.setState({ showCompose: true })
    }

    renderUserStats() {
        return (
            <div className="user-stats right-side-box white-bg">
                <div className="block-header">
                    <h4>User Metrics</h4>
                </div>
                <div className="block-padding">
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
                </div>
            </div>
        )
    }


    toggleHowTo = () => {
        const { howToHeight } = this.state;
        const newHeight = howToHeight === "0" ? 'auto' : '0';

        console.log(123, howToHeight, howToHeight === '0' );
        

        localStorage.setItem('HowTo-Toggle', newHeight)

        this.setState({
            howToHeight: newHeight
        });
    };


    renderInstructions() {
        const { howToHeight } = this.state;

        if (localStorage.getItem('HowTo-Toggle') && howToHeight === 0) {
            return null;
        }

        return (
            <AnimateHeight
                duration={500}
                height={howToHeight}
            >
                <div className="game-token shadow-sm">
                    <div className="container">
                        <div className="col-md-5 game-detail-wrapper">
                            <div className="hero-logo-wrapper">
                                <img className="hero-logo" src={BlockOverflowIcon} />
                                <div className="hero-logo-text-wrapper">
                                    <h1>Block Overflow</h1>
                                    <h3>Share Knowledge,<br />Earn Tokens</h3>
                                    <h4>Built with Menlo One</h4>
                                </div>
                            </div>
                            <div className="">
                                <p>Block Overflow is a question and answer site for blockchain programmers and other people from the Menlo One community where users get paid in ONE tokens for providing correct answers.</p>
                                <div className="btn-wrapper">
                                    <a className="btn btn-grey" onClick={this.toggleHowTo}>Close</a>
                                </div>
                            </div>
                        </div>
                        <div className="game-action-wrapper">
                            <div className="row">
                                <div className="col-12 text-center">
                                    <h6>How Block Overflow Works</h6>
                                </div>
                                <div className="col-4">
                                    <img src={how1} />
                                    <h4>Ask a question</h4>
                                    <p>
                                        Asking a question costs ONE tokens, which goes into a pool to pay the person with the best answer. Then, a 24 hour countdown timer starts.
                                    </p>
                                </div>
                                <div className="col-4">
                                    <img src={how2} />
                                    <h4>Users post answers</h4>
                                    <p>
                                        When someone replies with an answer, they place ONE tokens into the pool too, in hopes they have the right answer.
                                    </p>
                                </div>
                                <div className="col-4">
                                    <img src={how3} />
                                    <h4>The pool grows</h4>
                                    <p>
                                        With every answer the pool grows larger, and the 24 hour clock resets.
                                    </p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-4">
                                    <img src={how4} />
                                    <h4>Users vote on answers</h4>
                                    <p>
                                        Users vote on answers. They can leave a comments too. If the answer they voted on wins, they get Reputation points.
                                    </p>
                                </div>
                                <div className="col-4">
                                    <img src={how5} />
                                    <h4>Top answers win tokens</h4>
                                    <p>
                                        When people stop providing answers, the most up-voted answer is the winner. All of the ONE tokens go to the winner.
                                    </p>
                                </div>
                                <div className="col-4">
                                    <img src={how6} />
                                    <h4>Plus, totally decentralized</h4>
                                    <p>
                                        Furthermore, all of Block Overflow is decentralized. All of the data on this website was read from the blockchain.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimateHeight>
        )
    }

    _onSelect(newOption) {
        this.setState({ activeFilter: this.filters.filter((filters) => filters.name === newOption.value)[0].fn})
    }

    render() {
        return (
            <TopicsCtxtComponent.Provider value={this.state.topics}>
                <div>
                    <TopNav>
                        <li className="nav-item"><a onClick={this.toggleHowTo} title="Info">Info</a></li>
                    </TopNav>

                    { this.renderInstructions() }

                    <div className="content-wrapper">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-8">
                                    <div className="row">
                                        <div className="col-4">
                                                <a className='btn ask-btn' onClick={this.clickAsk}>Ask a Question</a>
                                        </div>
                                        <div style={{ display: 'none' }}>
                                            <div className="col-4 offset-4">
                                                <span>Sort By:</span>
                                            <Dropdown options={this.filters.map((f) => { return f.name })} onChange={this._onSelect} value={this.filters[0].name} placeholder="Select an option" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='left-side'>
                                        <div className="left-side-wrapper">
                                            <input className='search' placeholder='Search...' value={this.state.searchQuery} onChange={this.onChangeSearch} />
                                        </div>
                                        <QuestionsBoard />
                                    </div>
                                    {
                                        this.state.showCompose &&
                                        <TopicForm onSubmit={this.onSubmitQuestion} onCancel={this.onCancelQuestion} />
                                    }
                                </div>

                                <div className="col-md-4">
                                    {/* {this.renderUserStats()} */}
                                    {(this.state.howToHeight === '0') && (
                                        <a href="#" onClick={this.toggleHowTo} className="btn-instructions btn btn-green text-center mb-1">
                                            Show Instructions
                                        </a>
                                    )}
                                    <Sidebar />

                                    {/* <div className="token-metrics right-side-box white-bg">
                                    <div className="block-header">
                                        <h4>Token Metrics</h4>
                                    </div>
                                    <div className="block-padding">
                                        <ul>
                                            <li>
                                                <div className="name">Tokens in circulation</div>
                                                <div className="detail">354,000,000</div>
                                            </li>
                                            <li>
                                                <div className="name">Price</div>
                                                <div className="detail">$0.03</div>
                                            </li>
                                            <li>
                                                <div className="name">Volume</div>
                                                <div className="detail">34,241</div>
                                            </li>
                                            <li>
                                                <div className="name">Token Supply</div>
                                                <div className="detail">50% discount</div>
                                            </li>
                                        </ul>
                                    </div>
                                </div> */}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TopicsCtxtComponent.Provider>
        )
    }
}

export default withAcct(withSockets(QuestionsPage))
