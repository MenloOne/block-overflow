import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import AnimateHeight from 'react-animate-height'

import { AccountContext, withAcct } from '../models/Account'
import { Topics, TopicsContext, TopicsCtxtComponent } from '../models/Topics'

import TopNav from '../components/TopNav'

import QuestionsBoard from "./QuestionsBoard";

import TopicForm from './QuestionForm'

import '../App.scss'
import Topic from '../models/Topic'



const twitter  = require('../images/twitter.svg')
const facebook = require('../images/facebook.svg')
const github   = require('../images/github.svg')
const telegram = require('../images/telegram.svg')

const arrowRight = require('../images/arrow-right.svg')
const globe      = require('../images/icon-globe.svg')
const paper      = require('../images/icon-paper.svg')

const bitmart = require('../images/bitmart.svg')
const BlockOverflowIcon = require('../images/BlockOverflow-icon.svg')
const how1 = require('../images/how-1.svg')
const how2 = require('../images/how-2.svg')
const how3 = require('../images/how-3.svg')
const how4 = require('../images/how-4.svg')
const how5 = require('../images/how-5.svg')
const how6 = require('../images/how-6.svg')
const menlo = require('../images/menlo-logo.png')
const metal = require('../images/metal-pay.svg')
const shapeshift = require('../images/shapeshift.svg')


class QuestionsPageProps {
    acct: AccountContext
}

class QuestionsPageState {
    topics: TopicsContext
    howToHeight: string | number
    showCompose: boolean
    showInstructions: boolean
}


class QuestionsPage extends React.Component<QuestionsPageProps> {

    static topics : Topics = new Topics()
    state : QuestionsPageState

    constructor(props: QuestionsPageProps, context) {
        super(props, context)

        this.topicsChanged = this.topicsChanged.bind(this)
        this.clickAsk = this.clickAsk.bind(this)
        this.onSubmitQuestion = this.onSubmitQuestion.bind(this)
        this.onCancelQuestion = this.onCancelQuestion.bind(this)
        this.clickCloseInstructions = this.clickCloseInstructions.bind(this)
        this.clickSignIn = this.clickSignIn.bind(this)

        this.state = {
            howToHeight: 'auto',
            showCompose: false,
            showInstructions: true,
            topics: { model: Object.assign({}, this.topics), svc: this.topics }
        }

        QuestionsPage.topics.setCallback(this.topicsChanged)
        this.prepTopics(props)
    }

    async prepTopics(props: QuestionsPageProps) {
        this.topics.setAccount(props.acct.svc)
    }

    componentWillReceiveProps(newProps: QuestionsPageProps) {
        if (newProps.acct.model !== this.props.acct.model) {
            this.prepTopics(newProps)
        }
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


    renderMoreInfo() {
        return (
            <div className="user-stats right-side-box white-bg">
                <div className="block-header">
                    <h4>More Info</h4>
                </div>
                <div className="block-padding">
                    <div className="moreinfo-btns-wrapper">
                        <a href="http://menlo.one" target="_blank">
                            <div className="moreinfo-btn">
                                <img src={paper} className="icon-paper" />
                                <div className="moreinfo-btn-textwrapper">
                                    <span>White Paper</span>
                                </div>
                                <img src={arrowRight} className="arrow-right" />
                            </div>
                        </a>
                        <a href="http://menlo.one" target="_blank">
                            <div className="moreinfo-btn">
                                <img src={globe} className="icon-globe" />
                                <div className="moreinfo-btn-textwrapper">
                                    <span>Website</span>
                                    <span>http://menlo.one</span>
                                </div>
                                <img src={arrowRight} className="arrow-right" />
                            </div>
                        </a>
                    </div>
                    <div className="moreinfo-social-wrapper">
                        <ul>
                            <li>
                                <a href="https://twitter.com/menloone?lang=en" target="_blank">
                                    <img src={twitter} alt="Menlo One Twitter" />
                                </a>
                            </li>
                            <li>
                                <a href="https://www.facebook.com/menloone/" target="_blank">
                                    <img src={facebook} alt="Menlo One Facebook" />
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/MenloOne" target="_blank">
                                    <img src={github} alt="Menlo One Github" />
                                </a>
                            </li>
                            <li>
                                <a href="https://t.me/Menloone" target="_blank">
                                    <img src={telegram} alt="Menlo One Telegram" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
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

    renderInstructions() {
        const { howToHeight } = this.state;

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
                                    <h3>Share Knowlege,<br />Earn Tokens</h3>
                                    <h4>Built with Menlo One</h4>
                                </div>
                            </div>
                            <div className="">
                                <p>Block Overflow is a question and answer site for blockchain programmers and other people from the Menlo One community where users get paid in ONE tokens for providing correct answers.</p>
                                <div className="btn-wrapper" style={{display: 'none'}}>
                                    <a className="btn btn-big btn-green" onClick={this.clickSignIn}>Sign In</a>
                                    <a className="btn btn-big btn-grey" onClick={this.clickCloseInstructions}>Close  </a>
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

    render() {
        return (
            <TopicsCtxtComponent.Provider value={this.state.topics}>
                <div>
                    <TopNav/>

                    { this.renderInstructions() }

                    <div className="content-wrapper">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-8">
                                    {
                                        !this.state.showCompose &&
                                        <a className='btn btn-big ask-btn' onClick={ this.clickAsk }>Ask a Question</a>
                                    }
                                    {
                                        this.state.showCompose &&
                                        <TopicForm onSubmit={this.onSubmitQuestion} onCancel={this.onCancelQuestion}/>
                                    }
                                    <div className='left-side-wrapper left-side'>
                                        <QuestionsBoard />
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    {/* {this.renderUserStats()} */}

                                    <div className="right-side-box">
                                        <div className="green-bg">
                                            <div className="block-header">
                                                <h4>ONE Token Metrics</h4>
                                            </div>
                                            <div className="block-padding">
                                                <table className="stats">
                                                    <tbody>
                                                    <tr>
                                                        <td>
                                                            Circulating Supply
                                                        </td>
                                                        <td>
                                                            354,000,000
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            Total Supply
                                                        </td>
                                                        <td>
                                                            1,000,000,000 ONE
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            Volume (24h)
                                                        </td>
                                                        <td>
                                                            N/A
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            Market Cap
                                                        </td>
                                                        <td>
                                                            $16,000,000
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            Price
                                                        </td>
                                                        <td>
                                                            $0.018083
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="white-bg content-node">
                                            <div className="block-header">
                                                <h4>Buy ONE Token</h4>
                                            </div>
                                            <div className="block-padding">
                                                <div className="moreinfo-btns-wrapper">
                                                    <a href="http://menlo.one" target="_blank">
                                                        <div className="moreinfo-btn">
                                                            <img src={menlo} className="icon-paper" />
                                                            <div className="moreinfo-btn-textwrapper">
                                                                <span>Menlo One Token Sale</span>
                                                                <span>https://tokensale.menlo.one</span>
                                                            </div>
                                                            <img src={arrowRight} className="arrow-right" />
                                                        </div>
                                                    </a>
                                                    <a href="https://www.bitmart.com" target="_blank">
                                                        <div className="moreinfo-btn">
                                                            <img src={bitmart} className="icon-globe" />
                                                            <div className="moreinfo-btn-textwrapper">
                                                                <span>Bitmart</span>
                                                                <span>https://www.bitmart.com</span>
                                                            </div>
                                                            <img src={arrowRight} className="arrow-right" />
                                                        </div>
                                                    </a>
                                                    <a href="http://shapeshift.io" target="_blank">
                                                        <div className="moreinfo-btn">
                                                            <img src={shapeshift} className="icon-globe" />
                                                            <div className="moreinfo-btn-textwrapper">
                                                                <span>ShapeShift</span>
                                                                <span>http://shapeshift.io</span>
                                                            </div>
                                                            <img src={arrowRight} className="arrow-right" />
                                                        </div>
                                                    </a>
                                                    <a href="https://metalpay.com" target="_blank">
                                                        <div className="moreinfo-btn">
                                                            <img src={metal} className="icon-globe" />
                                                            <div className="moreinfo-btn-textwrapper">
                                                                <span>Metal Pay</span>
                                                                <span>https://metalpay.com</span>
                                                            </div>
                                                            <img src={arrowRight} className="arrow-right" />
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

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

                                    {this.renderMoreInfo()}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TopicsCtxtComponent.Provider>
        )
    }
}

export default withAcct(QuestionsPage)
