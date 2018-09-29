import React, {Component} from 'react'
import TopNav from './TopNav.tsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../App.scss'
import '../styles/guild.css'

const smallIm = require('./images/guild/small-img.png')
const logo = require('./images/logo.jpg')
const userIm = require('./images/user-1.png')
const user2Im = require('./images/user-2.png')
const iconIm = require('./images/icon.png')
const starsIm = require('./images/guild/stars.png')
const smallImroot = require('./images/small-img.png')

// USER IMAGES
const imuser1 = require('./images/guild/members/mem1.png')
const imuser2 = require('./images/guild/members/mem2.png')
const imuser3 = require('./images/guild/members/mem3.png')
const imuser4 = require('./images/guild/members/mem4.png')
const imuser5 = require('./images/guild/members/mem5.png')
const imuser6 = require('./images/guild/members/mem6.png')
const imuser7 = require('./images/guild/members/mem7.png')

class Guild extends Component {
  render() {
    return (
      <div>
        <TopNav/>

        <div className="game-token shadow-sm">
          <div className="container">
            <span className="game-img"><img src={smallIm} alt=""/></span>
            <div className="game-detail">
              <h2>Blockchain Devs HashGuild</h2>
              <p>We review awesome, intelligent and groundbreaking projects.</p>
              <div className="locaton-tag">
                <span className="location"><i className="fa fa-map-marker"></i> San Francisco</span>
                <span className="tag"><i className="fa fa-tag"></i> Tech, Business</span>
              </div>
            </div>
            <div className="btn-top-right">
              <a href="#" className="circle-btn" title=""><img src={iconIm} alt=""/></a>
              <a href="#" className="btn border-button" title="Watch">Watch</a>
            </div>

            <div className="total-comments">
              <span className="user-img"><img src={userIm} title="user" alt="user"/></span>
              <span className="user-img"><img src={user2Im} title="user" alt="user"/></span>
              <span className="user-img"><img src={userIm} title="user" alt="user"/></span>
              <a href="#">3 friends</a> and 2,599 others watching
            </div>
          </div>
        </div>

        <div className="content-wrapper">
          <div className="container">
            <div className="row">
              <div className="col-md-12 members-main-wrapper">
                <div className="left-side">
                  <div className="members-top-title">
                    <h2>Members (12)</h2>
                    <a href="#" className="more-members-cto">See All Members</a>
                    <div className="clearfix"></div>
                  </div>
                  <ul className="members-list">
                    <li>
                      <div className="im-holder"
                           style={{background: 'url("' + imuser1 + '")'}}></div>
                      <span className="member-name">@matta</span>
                      <p>
                        0x92763
                        <br/>
                        Rep: 1,248
                      </p>
                    </li>
                    <li>
                      <div className="im-holder"
                           style={{background: 'url("' + imuser2 + '")'}}></div>
                      <span className="member-name">@matta</span>
                      <p>
                        0x92763
                        <br/>
                        Rep: 1,248
                      </p>
                    </li>
                    <li>
                      <div className="im-holder"
                           style={{background: 'url("' + imuser3 + '")'}}></div>
                      <span className="member-name">@matta</span>
                      <p>
                        0x92763
                        <br/>
                        Rep: 1,248
                      </p>
                    </li>
                    <li>
                      <div className="im-holder"
                           style={{background: 'url("' + imuser4 + '")'}}></div>
                      <span className="member-name">@matta</span>
                      <p>
                        0x92763
                        <br/>
                        Rep: 1,248
                      </p>
                    </li>
                    <li>
                      <div className="im-holder"
                           style={{background: 'url("' + imuser5 + '")'}}></div>
                      <span className="member-name">@matta</span>
                      <p>
                        0x92763
                        <br/>
                        Rep: 1,248
                      </p>
                    </li>
                    <li>
                      <div className="im-holder"
                           style={{background: 'url("' + imuser6 + '")'}}></div>
                      <span className="member-name">@matta</span>
                      <p>
                        0x92763
                        <br/>
                        Rep: 1,248
                      </p>
                    </li>
                    <li>
                      <div className="im-holder"
                           style={{background: 'url("' + imuser7 + '")'}}></div>
                      <span className="member-name">@matta</span>
                      <p>
                        0x92763
                        <br/>
                        Rep: 1,248
                      </p>
                    </li>
                  </ul>

                </div>
                <div className="members-bottom-sec">
                  <div className="row">
                    <div className="col-md-6 stats-main-wrapper">
                      <ul className="guild-stats stats-left">
                        <li><h4>Guild Stats</h4></li>
                        <li><p>Reivews: 237</p></li>
                        <li><p>Avg Grade: 72%</p></li>
                        <li><p>Avg Payout: 42 ONE</p></li>
                      </ul>
                      <ul className="guild-stats stats-right">
                        <li><p>Rep:<img src={starsIm}/></p></li>
                        <li><p>Status: Crypto-Boss</p></li>
                        <li><p>Categories: <a href="#">Tech</a>, <a href="#">Business</a></p>
                        </li>
                      </ul>
                      <div className="clearfix"></div>
                    </div>
                    <div className="col-md-6 members-apply">
                      <p>Currently accepting new members!</p>
                      <a href="#" className="blue-btn">Apply to Join</a>
                    </div>
                  </div>

                </div>
              </div>
              <div className="col-md-12 main-bottom-list-wrapper">
                <ul className="top-panels-menu">
                  <li><a href="#" className="active">Open Sales (3)</a></li>
                  <li><a href="#">Past (234)</a></li>
                  <li><a href="#">Scam List (18)</a></li>
                </ul>
                <div className="game-token shadow-sm">
                  <a href='/menlo/'>

                    <div className="container">
                      <span className="game-img"><img src={smallImroot} alt=""/></span>
                      <div className="game-detail">
                        <h2>BitKitties</h2>
                        <p>A game where users win tokens for catching mice</p>
                        <div className="total-comments">
                                                    <span className="user-img"><img src={userIm} title="user"
                                                                                    alt="user"/></span>
                          <span className="user-img"><img src={user2Im} title="user"
                                                          alt="user"/></span>
                          <span className="user-img"><img src={userIm} title="user"
                                                          alt="user"/></span>
                          <a href="#">6 friends</a> and 1,353 others committed to buying when
                          sale opens
                        </div>
                      </div>
                      <div className="btn-top-right">
                        <a href="#" className="circle-btn" title=""><img src={iconIm}
                                                                         alt=""/></a>
                        <a href="#" className="btn border-button" title="Watch">Allocated</a>
                      </div>


                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Guild
