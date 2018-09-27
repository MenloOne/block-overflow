import * as React from 'react'
import TopNav from '../components/TopNav'
import MessageBoard from '../messaging/MessageBoard'
import ResponsiveEmbed from 'react-responsive-embed'
import ForumService from '../services/ForumService'

import 'bootstrap/dist/css/bootstrap.min.css'

import '../styles/app.scss'
import assets from '../assets'

const arrowRight = require('../images/arrow-right.svg')
const globe = require('../images/icon-globe.svg')
const paper = require('../images/icon-paper.svg')


const twitter = require('../images/twitter.svg')
const facebook = require('../images/facebook.svg')
const github = require('../images/github.svg')
// const slack = require('../images/slack.svg')
const telegram = require('../images/telegram.svg')

// const screenshot = require('../images/screenshot.png')
const userIm = require('../images/user-1.png')
const user2Im = require('../images/user-2.png')
const iconIm = require('../images/icon.png')
const computer = require('../images/ICO_profile_page_svg.svg')
// const whitePaperIm = require('../images/white-paper.png')
// const globe = require('../images/globe.png')
const townhall = require('../images/Townhall_valued_comment_svg.svg')


interface ForumProps {
    address: string
}

interface ForumState {
    eth: number,
    tokens: number
    forum?: ForumService
}


class Forum extends React.Component<ForumProps> {

    state : ForumState

    constructor(props, context) {
        super(props, context)

        this.onEditEth = this.onEditEth.bind(this)
        this.onEditTokens = this.onEditTokens.bind(this)

        this.state = {
            eth: 1,
            tokens: 0,
            forum: new ForumService(props.address)
        }
    }

    componentDidMount() {
        this.onEditEth(null)
    }

    componentWillMount() {
    }


    onEditEth(evt) {
        let eth = 1
        if (evt) {
            eth = evt.target.value
        }
        const tokens = Math.round((eth * 12000) * 100) / 100
        this.setState({ eth, tokens })
    }

    onEditTokens(evt) {
        const tokens = evt.target.value
        const eth = Math.round((tokens / (12000)) * 100) / 100
        this.setState({ eth, tokens })
    }

    renderMoreInfo() {
        return (
            <div className="user-stats right-side-box white-bg">
                <h4>More Info</h4>
                <div className="moreinfo-btns-wrapper">
                    <a href="http://menlo.one">
                        <div className="moreinfo-btn">
                            <img src={paper} className="icon-paper" />
                            <div className="moreinfo-btn-textwrapper">
                                <span>White Paper</span>
                            </div>
                            <img src={arrowRight} className="arrow-right" />
                        </div>
                    </a>
                    <a href="http://menlo.one">
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
                        {/* <li>
                            <a href="" target="_blank">
                                <img src={slack} alt="Menlo One Slack" />
                            </a>
                        </li> */}
                        <li>
                            <a href="https://t.me/Menloone" target="_blank">
                                <img src={telegram} alt="Menlo One Telegram" />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div>
                <TopNav/>

                <div className="game-token shadow-sm">
                    <div className="container">
                        <div className="col-md-8 game-detail-wrapper">
                            <img className="game-img" src={assets.menloFB} alt="" style={{ scale: 2 }}/>
                            <div className="game-detail">
                                <h2>Menlo One</h2>
                                <p>Menlo One is a powerful framework for building decentralized applications with the speed of a traditional web app. Our decentralized database and Proof-of-Reputation incentive system is the infrastructure that enables the Web 3.0 generation of marketplaces, social media platforms, and future apps to be as fast and performant as their centralized predecessors.</p>
                                <div className="locaton-tag">
                                    <span className="location"><i className="fa fa-map-marker"></i> New Jersey</span>
                                    <span className="tag"><i className="fa fa-tag"></i> Utility Token</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 game-action-wrapper">
                            <div className="header-buttons">
                                <a href="" className="btn">Watch</a>
                                <a href="" className="btn">Recommend</a>
                            </div>
                            <div className="committed">
                                <p className="total-comments">
                                    <a className="circle-btn" title=""><img src={iconIm} alt="" /></a>
                                    <span>103 accounts</span>&nbsp;currently hold Menlo ONE tokens&nbsp;</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content-wrapper">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-8">
                                <div className="left-side">
                                    <div className="left-side-wrapper">
                                        <div className="top-users" style={{ display: 'none' }}>
                                            <div className="members">
                                                <h3>MEMBERS 12 (3)</h3>
                                                <div className="member-users">
                                                <span className="user-img"><img src={userIm} title="user"
                                                                                alt="user"/></span>
                                                    <span className="user-img"><img src={user2Im} title="user" alt="user"/></span>
                                                    <span className="user-img"><img src={userIm} title="user"
                                                                                    alt="user"/></span>
                                                </div>
                                                <div className="top-names"><a >@david</a>, <a >@jenny</a>,
                                                    and <a >@bobNYC</a></div>
                                            </div>

                                            <div className="backers">
                                                <h3>Other Backers (1,322)</h3>
                                                <div className="member-users">
                                                <span className="user-img"><img src={userIm} title="user"
                                                                                alt="user"/></span>
                                                    <span className="user-img"><img src={user2Im} title="user" alt="user"/></span>
                                                    <span className="user-img"><img src={userIm} title="user"
                                                                                    alt="user"/></span>
                                                </div>
                                                <div className="top-names"><a >@BlockchainCapital</a>, <a >@RogerVer</a> and 1,322 others
                                                </div>
                                            </div>

                                            <hr/>
                                        </div>


                                        <h2>The next generation of the web</h2>
                                        <h6>All of the data on this page was pulled from<br />a blockchain, but is as fast as the cloud.</h6>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p>This page is different from any other webpage you’ve ever used. While it may not seem like it, all of the information here was pulled in from several blockchains and decentralized systems, and there is a built in protocol for you the user to verify that. The goal of Menlo One is to make dApps as fast and easy to use as their centralized predecessors, and this page is a demonstrtion of the alpha release of our framework in action.</p>
                                            </div>
                                            <div className="col-md-6 text-center">
                                                <img src={computer} />
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="left-side-wrapper">
                                        <ResponsiveEmbed src='https://www.youtube.com/embed/yuohXyDP1pk?rel=0' allowFullScreen />
                                    </div>
                                </div>

                                <div className="team left-side" style={{ display: 'none' }}>
                                    <h2>Team</h2>
                                    <div className="team-member">
                                        <span className="user-img"><img src={userIm} title="user" alt="user"/></span>
                                        <div className="user-detail">
                                            <div className="team-member-name"><a >@wethefuture</a></div>
                                            <div className="designation">CTO</div>
                                        </div>
                                    </div>
                                    <div className="team-member">
                                        <span className="user-img"><img src={user2Im} title="user" alt="user"/></span>
                                        <div className="user-detail">
                                            <div className="team-member-name"><a >@greatthings</a></div>
                                            <div className="designation">COO</div>
                                        </div>
                                    </div>
                                </div>


                                <div className="reviews-and-comments expert-reviews left-side" style={{ display: 'none' }}>
                                    <div className="Expert-Reviews">
                                        <h3> Expert Reviews </h3>
                                        <div className="boxinner">
                                            <span className="oval-1">84%</span>
                                            <div className="boxinner-text"> Blockchain Architect Guild<span>3,812 Reviews</span>
                                            </div>
                                        </div>
                                        <div className="boxinner">
                                            <span className="oval-2">92%</span>
                                            <div className="boxinner-text">Startup MBA Guild<span>401 Reviews</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="User-Reviews">
                                        <h3>User Reviews</h3>
                                        <div className="Profile">
                                            <i className="fa fa-thumbs-up"></i>
                                            12
                                        </div>
                                        <div className="Profile">
                                            <i className="fa fa-thumbs-down"></i>
                                            109
                                        </div>

                                    </div>
                                    <div className="awesome-product-aw">
                                        “Love what these guys are doing.” <br/>
                                        <span className="name">- Blockchain Architect Guild</span>
                                    </div>

                                </div>
                                <div className="left-side">
                                    <div className="left-side-wrapper">
                                        <h2>Build reputation, earn tokens</h2>
                                        <h6>You know it’s secure, because you validate it yourself.</h6>
                                        <div style={{ display: 'flex' }}>
                                            <img src={townhall} style={{ marginRight: '1rem' }} />
                                            <div className="paragraph-details-wrapper">
                                                <p>EXPLAIN WHY REPUTATION IS IMPORTANT HERE - Vallidate this page and begin earning tokens. ———Meow up on this idea, since if we built this game on the blockchain everything would’ve been easier to create. So here we are, the decentralized way to make games a </p>
                                                <div className="points-wrapper">
                                                    <div className="point">
                                                        <span className="points-label">
                                                            REPUTATION
                                                </span>
                                                        <span className="points-stat">
                                                            2
                                                </span>
                                                    </div>
                                                    <div className="point">
                                                        <span className="points-label">
                                                            REWARD
                                                </span>
                                                        <span className="points-stat">
                                                            2 ONE
                                                </span>
                                                    </div>
                                                    <div className="point">
                                                        <span className="points-label">
                                                            VALIDATION COST
                                                </span>
                                                        <span className="points-stat">
                                                            0.00013 ETH
                                                </span>
                                                    </div>
                                                    <div className="point">
                                                        <span className="points-label">
                                                            PROFIT
                                                </span>
                                                        <span className="points-stat">
                                                            13%
                                                </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="right-side-box">

                                    <div className="green-bg">
                                        <div className="start-in">CONTENT NODE STATS</div>
                                        <table className="stats">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        Node Earnings (In ONE)
                                                    </td>
                                                    <td>
                                                        34,233  ONE
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        Node Earnings (In USD)
                                                    </td>
                                                    <td>
                                                        $220
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        Content Node Cost (mo)
                                                    </td>
                                                    <td>
                                                        $19
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        Content Node Reputation
                                                    </td>
                                                    <td>
                                                        440 (A+ Grade)
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        Node Uptime
                                                    </td>
                                                    <td>
                                                        99%
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        Annual ROI
                                                    </td>
                                                    <td>
                                                        91.4%
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="white-bg content-node">
                                        <a href="https://tokensale.menlo.one" className="green-btn" title="Buy Tokens">Apply to run a Content Node</a>
                                        <div>
                                            <p>
                                                Menlo One Content Nodes are an<br />alpha stage project. If you would like to run a<br />Content Node, please contact us.
                                            </p>
                                        </div>
                                    </div>

                                </div>



                                <div className="token-metrics right-side-box white-bg">
                                    <h4>Token Metrics</h4>
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

                                {this.renderMoreInfo()}

                            </div>

                        </div>


                        <MessageBoard/>
                    </div>
                </div>
            </div>
        )
    }
}

export default Forum
