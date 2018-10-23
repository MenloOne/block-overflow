import * as React from  'react'
import BigNumber from 'bignumber.js'
import Blockies from 'react-blockies'
import { ToastContainer, toast } from 'react-toastify';
import AnimateHeight from 'react-animate-height'

import { MenloFaucet } from '../contracts/MenloFaucet'

import web3 from '../models/Web3'
import { AccountContext, MetamaskStatus, NetworkName, ToastType, withAcct } from '../models/Account'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../App.scss'

const BlockOverflowIcon = require('../images/menlo-logo.svg')
const how1 = require('../images/how-1.svg')
const how2 = require('../images/how-2.svg')
const how3 = require('../images/how-3.svg')
const how4 = require('../images/how-4.svg')
const how5 = require('../images/how-5.svg')
const how6 = require('../images/how-6.svg')


const logo = require('../images/BlockOverflow-logo.svg')


interface TopNavProps {
    acct: AccountContext;
    children?: Element;
}

interface TopNavState {
    url?: string;
    howToHeight: string | number | undefined;
}

class TopNav extends React.Component<TopNavProps> {

    state: TopNavState

    constructor(props, context) {
        super(props, context)
        this.onGetTokens = this.onGetTokens.bind(this)

        this.state = {
            url: '',
            howToHeight: localStorage.getItem('HowTo-Toggle') || 'auto',
        }
    }

    componentWillMount() {
        this.getUrl().then((url) => {
            this.setState({ url })
        });
    }

    async onGetTokens() {
        if (this.props.acct.model.status !== MetamaskStatus.Ok) {
            return
        }

        try {
            const faucet = await MenloFaucet.createAndValidate(web3, this.props.acct.model.contractAddresses.MenloFaucet)
            await faucet.dripTx().send({})

            this.props.acct.svc.refreshBalance()
        } catch (e) {
            toast(e, {
                toastId: ToastType.Account,
                autoClose: false,
                closeButton: false
            })
        }
    }

    renderONE() {
        const one = this.props.acct.model.oneBalance

        if (one < 5) {
            return (
                <li className="nav-item token-number">
                    <button className='btn faucet-btn' onClick={ this.onGetTokens }>GET ONE TOKENS FROM TEST FAUCET</button>
                </li>
            )
        }

        return (
            <li className="nav-item token-number">
                <span>{ new BigNumber(one).toFormat(0) }</span>
                <span className="token-one">&nbsp;ONE</span>
            </li>
        )
    }


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
                                    <h4>Built with <span className="menloOneLogo" /></h4>
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

    async getUrl() : Promise<string> {

        let url = ''

        if (!web3 || !web3.version) {
            return 'https://etherscan.io'
        }

        return new Promise<string>((resolve, reject) => {

            web3.version.getNetwork((err, netId) => {

                switch (netId) {
                    case '4':
                        url = 'https://rinkeby.etherscan.io'
                        break
                    case "42":
                        url = 'https://kovan.etherscan.io'
                        break
                    default:
                        url = 'https://etherscan.io'
                }

                resolve(`${url}/address/${this.props.acct.model.address}`);
            })
        })

    }

    renderAccountStatus() {
        // console.log( 'STATUS: ', this.props.acct.model.status )

        if (this.props.acct.model.status === MetamaskStatus.LoggedOut) {
            toast('You must first sign into Metamask to take part in discussions.', {
                toastId: ToastType.Account,
                autoClose: false,
                closeButton: false
            })

            return (
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item token-number">
                        <span className="token-one">Not logged in</span>
                    </li>
                </ul>
            )
        }

        if (this.props.acct.model.status === MetamaskStatus.Uninstalled) {
            toast('Unsupported Browser: Please use Chrome or Brave with the MetaMask browser extension to log in.', {
                toastId: ToastType.Account,
                autoClose: false,
                closeButton: false
            })

            return (
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item token-number">
                        <span className="token-one">No Metamask Extension</span>
                    </li>
                </ul>
            )
        }

        if (this.props.acct.model.status === MetamaskStatus.InvalidNetwork) {
            toast(`Oops, you’re on the ${this.props.acct.model.networkName} Network.  Please switch to the ${NetworkName.Kovan} or ${NetworkName.Rinkeby} Network.`, {
                toastId: ToastType.Account,
                autoClose: false,
                closeButton: false
            })

            return (
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item token-number">
                        <span className="token-one">Wrong Network</span>
                    </li>
                </ul>
            )
        }
        if (this.props.acct.model.status === MetamaskStatus.Error) {
            toast(this.props.acct.model.error, {
                toastId: ToastType.Account,
                autoClose: false,
                closeButton: false
            })

            return (
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item token-number">
                        <span className="token-one">Blockchain Network Error</span>
                    </li>
                </ul>
            )
        }

        if (this.props.acct.model.status === MetamaskStatus.Starting) {
            return (
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item token-number">
                        <span className="token-one">Connecting...</span>
                    </li>
                </ul>
            )
        }

        return (
            <ul className="navbar-nav ml-auto">
                { this.renderONE() }

                <li className="nav-item dropdown">
                    <div className="nav-link dropdown-toggle mr-lg-2"
                       id="messagesDropdown"

                       data-toggle="dropdown"
                       aria-haspopup="true"
                       aria-expanded="false">

                        <span className="user-img">
                            { this.props.acct.model.address &&
                                <Blockies seed={this.props.acct.model.address} size={7} />
                            }
                        </span>
                        <a target="_blank" href={this.state.url} className="name">{ this.props.acct.model.address }</a>

                        { false &&
                        <span className="avatar-indicator text-primary d-none d-lg-blocka">
                            <i className="fa fa-fw fa-circle">3</i>
                        </span>
                        }
                    </div>
                </li>
            </ul>
        )
    }

    toggleHowTo = () => {
        const { howToHeight } = this.state;
        const newHeight = howToHeight === "0" ? 'auto' : '0';

        console.log(123, howToHeight, howToHeight === '0');


        localStorage.setItem('HowTo-Toggle', newHeight)

        this.setState({
            howToHeight: newHeight
        });
    };

    render() {
        return (
            <div className="nav-wrapper fixed-top">
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark" id="mainNav">
                    <div className="container">
                        <a className="navbar-brand" href="/">
                            <img src={logo} title="Menlo One" alt="Menlo One" />
                        </a>
                        <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse"
                            data-target="#navbarResponsive"
                            aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarResponsive">
                            <ul className="navbar-nav main ml-auto">
                                <li className="nav-item"><a onClick={this.toggleHowTo}>Intro</a></li>
                                <li className="nav-item"><a href="https://menlo.one/" target="_blank">Menlo One</a></li>
                                {/* <li className="nav-item"><a href="/" title="Discover">Discover</a></li>
                                <li className="nav-item"><a href="/guild/" title="Guilds">Guilds</a></li>
                                <li className="nav-item"><a href="/wallet/" title="Wallet">Wallet</a></li> */}
                                {this.props.children}
                            </ul>

                            {this.renderAccountStatus()}
                        </div>
                    </div>
                </nav>
                <ToastContainer position={toast.POSITION.TOP_CENTER} />
                {this.renderInstructions()}
            </div>
        )
    }
}

export default withAcct(TopNav)
