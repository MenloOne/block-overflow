import * as React from 'react'
import BigNumber from 'bignumber.js'
import Blockies from 'react-blockies'
import { toast, ToastContainer } from 'react-toastify'

import { MenloFaucet } from '../contracts/MenloFaucet'

import web3 from '../models/Web3'
import { AccountContext, MetamaskStatus, NetworkName, ToastType, withAcct } from '../models/Account'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../App.scss'
import A from './A'


const logo = require('../images/BlockOverflow-logo.svg')


interface TopNavProps {
    acct: AccountContext;
    children?: Element;
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
        const url = this.props.acct.svc.getEtherscanUrl()
        this.setState({ url })
    }

    async onGetTokens() {
        if (this.props.acct.model.status !== MetamaskStatus.Ok || !this.props.acct.model.contractAddresses.MenloFaucet) {
            return
        }

        try {
            const faucet = await MenloFaucet.createAndValidate(web3, this.props.acct.model.contractAddresses.MenloFaucet)
            await faucet.dripTx().send({})

            this.props.acct.svc.refreshBalance()
        } catch (e) {
            toast(e, {
                toastId: ToastType.Account,
                autoClose: false
            })
        }
    }

    renderONE() {
        const one = this.props.acct.model.oneBalance

        if (one < 5 && this.props.acct.model.networkName !== NetworkName.Mainnet) {
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

    renderAccountStatus() {
        // console.log( 'STATUS: ', this.props.acct.model.status )

        if (this.props.acct.model.status === MetamaskStatus.LoggedOut) {
            toast('You must first sign into Metamask to take part in discussions.', {
                toastId: ToastType.Account,
                autoClose: false
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
                autoClose: false
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
            toast(`Oops, you’re on the ${this.props.acct.model.networkName} Network.  Please switch to the ${process.env.NODE_ENV === 'production' ? NetworkName.Mainnet : NetworkName.Rinkeby} Network.`, {
                toastId: ToastType.Account,
                autoClose: false
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
                autoClose: false
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

    render() {
        return (
            <div className="nav-wrapper fixed-top">
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark" id="mainNav">
                    <div className="container">
                        <A className="navbar-brand" href="/">
                            <img src={logo} title="Menlo One" alt="Menlo One" />
                        </A>
                        <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse"
                            data-target="#navbarResponsive"
                            aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarResponsive">
                            <ul className="navbar-nav main ml-auto">
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
            </div>
        )
    }
}

export default withAcct(TopNav)
