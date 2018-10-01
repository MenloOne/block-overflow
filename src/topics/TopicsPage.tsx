import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import AnimateHeight from 'react-animate-height'

import TopNav from '../components/TopNav'

import TopicBoard from "../topics/TopicBoard";

import '../App.scss'

const twitter  = require('../images/twitter.svg')
const facebook = require('../images/facebook.svg')
const github   = require('../images/github.svg')
const telegram = require('../images/telegram.svg')

const arrowRight = require('../images/arrow-right.svg')
const globe      = require('../images/icon-globe.svg')
const paper      = require('../images/icon-paper.svg')

const userIm = require('../images/user-1.png')
const user2Im = require('../images/user-2.png')

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




class TopicsPage extends React.Component {

    state = {
        howToHeight: 0
    }

    constructor(props, context) {
        super(props, context)
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

    render() {
        const { howToHeight } = this.state;

        return (
            <div>
                <TopNav/>

                <AnimateHeight
                    duration={500}
                    height={howToHeight} // see props documentation bellow
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
                                    <a href="" className="btn btn-big btn-green">Sign Up</a>
                                    <a href="" className="btn btn-big btn-grey" >Close  </a>
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

                <div className="content-wrapper">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-8">
                                <p>
                                    <a href="">&laquo; Back to Topics</a>
                                </p>
                                {/* <div className="left-side">
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
                            </div> */}

                                <div className="team left-side" style={{display: 'none'}}>
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


                                <div className="reviews-and-comments expert-reviews left-side" style={{display: 'none'}}>
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
                                {/* <div className="left-side">
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
                                </div> */}


                                <TopicBoard />
                            </div>


                            <div className="col-md-4">
                                {this.renderUserStats()}

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
        )
    }
}

export default TopicsPage
