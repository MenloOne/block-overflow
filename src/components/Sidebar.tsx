import * as React from 'react'

const bitmart = require('../images/bitmart.svg')
const metal = require('../images/metal-pay.svg')
const arrowRight = require('../images/arrow-right.svg')

const twitter = require('../images/twitter.svg')
const facebook = require('../images/facebook.svg')
const github = require('../images/github.svg')
const telegram = require('../images/telegram.svg')

const globe = require('../images/icon-globe.svg')
const paper = require('../images/icon-paper.svg')


interface SidebarProps {
}

interface SidebarState {
}

class Sidebar extends React.Component<SidebarProps> {

    state: SidebarState

    constructor(props, context) {
        super(props, context)
    }

    componentWillMount() {
    }

    renderMoreInfo() {
        return (
            <div className="user-stats right-side-box white-bg">
                <div className="block-header">
                    <h4>More Info</h4>
                </div>
                <div className="block-padding">
                    <div className="moreinfo-btns-wrapper">
                        <a href="https://menloone.docsend.com/view/zgf6d4e" target="_blank">
                            <div className="moreinfo-btn">
                                <img src={paper} className="icon-paper" />
                                <div className="moreinfo-btn-textwrapper">
                                    <span>Whitepaper</span>
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

    render() {
        return (
            <div>
                <div className="right-side-box">
                    <div className="white-bg content-node">
                        <div className="block-header">
                            <h4>Buy ONE Token</h4>
                        </div>
                        <div className="block-padding">
                            <div className="moreinfo-btns-wrapper">
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
                                <a href="https://idex.market/eth/one" target="_blank">
                                    <div className="moreinfo-btn">
                                        <img src={metal} className="icon-globe" />
                                        <div className="moreinfo-btn-textwrapper">
                                            <span>IDEX</span>
                                            <span>https://idex.market</span>
                                        </div>
                                        <img src={arrowRight} className="arrow-right" />
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>


            { this.renderMoreInfo() }
        </div>
        )
    }
}

export default Sidebar
