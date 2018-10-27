import * as React from 'react'

const bitmart = require('../images/bitmart.svg')
const menlo = require('../images/menlo-logo.png')
const metal = require('../images/metal-pay.svg')
const shapeshift = require('../images/shapeshift.svg')
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
                    <div>
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


            { this.renderMoreInfo() }
        </div>
        )
    }
}

export default Sidebar
