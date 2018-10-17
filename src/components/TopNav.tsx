import * as React from  'react'
import BigNumber from 'bignumber.js'
import Blockies from 'react-blockies'
import { ToastContainer, toast } from 'react-toastify';

import { MenloFaucet } from '../contracts/MenloFaucet'

import web3 from '../models/Web3'
import { AccountContext, MetamaskStatus, NetworkName, ToastType, withAcct } from '../models/Account'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../App.scss'


const logo = require('../images/BlockOverflow-logo.svg')


interface TopNavProps {
    acct: AccountContext;
}

interface TopNavState {
    url?: string;
}

class TopNav extends React.Component<TopNavProps> {

    state: TopNavState

    constructor(props, context) {
        super(props, context)
        this.onGetTokens = this.onGetTokens.bind(this)

        this.state = {
            url: ''
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
                    <a className="nav-link dropdown-toggle mr-lg-2"
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
                    </a>
                </li>
            </ul>
        )
    }

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
                            <ul className="navbar-nav main ml-auto" style={{ display: 'none' }}>
                                <li className="nav-item"><a href="/" title="Discover">Discover</a></li>
                                <li className="nav-item"><a href="/guild/" title="Guilds">Guilds</a></li>
                                <li className="nav-item"><a href="/wallet/" title="Wallet">Wallet</a></li>
                            </ul>

                            {this.renderAccountStatus()}
                        </div>
                    </div>
                </nav>
                <ToastContainer position={toast.POSITION.TOP_CENTER} />
            </div>
        )
    }
}

export default withAcct(TopNav)
