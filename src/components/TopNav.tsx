import * as React from  'react'
import BigNumber from 'bignumber.js'

import 'bootstrap/dist/css/bootstrap.min.css'
import web3 from '../services/web3_override'
import { AccountService, MetamaskStatus, withAcct } from '../services/AccountService'

import TruffleContract from 'truffle-contract'

const MenloFaucetContract = require('../build-contracts/MenloFaucet.json')
import '../App.scss'


const logo = require('../images/logo.svg')

interface TopNavProps {
    acct: AccountService
}

class TopNav extends React.Component<TopNavProps> {

    constructor(props, context) {
        super(props, context)
        this.onGetTokens = this.onGetTokens.bind(this)
    }

    async onGetTokens() {
        if (this.props.acct.status !== MetamaskStatus.Ok) {
            return
        }

        try {
            const faucetContract = TruffleContract(MenloFaucetContract)
            faucetContract.defaults({
                from: this.props.acct.address
            })
            faucetContract.setProvider(web3.currentProvider)

            const faucet = await faucetContract.deployed()
            await faucet.drip()

            this.props.acct.refreshBalance()
        } catch (e) {
            window.alert( e )
        }
    }

    renderONE() {
        const one = this.props.acct.balance

        if (one < 5) {
            return (
                <li className="nav-item token-number">
                    <button className='btn faucet-btn' onClick={ this.onGetTokens }>GET ONE TOKENS FROM KOVAN FAUCET</button>
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
        console.log( 'STATUS: ', this.props.acct.status )

        if (this.props.acct.status === MetamaskStatus.LoggedOut) {
            return (
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item token-number">
                        <span className="token-one">YOU MUST SIGN INTO METAMASK TO TAKE PART IN DISCUSSIONS</span>
                    </li>
                </ul>
            )
        }

        if (this.props.acct.status === MetamaskStatus.Uninstalled) {
            return (
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item token-number">
                        <span className="token-one">YOU MUST USE CHROME WITH THE METAMASK EXTENSION TO TAKER PART IN DISCUSSIONS</span>
                    </li>
                </ul>
            )
        }

        if (this.props.acct.status === MetamaskStatus.Error) {
            return (
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item token-number">
                        <span className="token-one">{ this.props.acct.error }</span>
                    </li>
                </ul>
            )
        }

        if (this.props.acct.status === MetamaskStatus.Starting) {
            return (
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item token-number">
                        <span className="token-one">...</span>
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
                            {this.props.acct.avatar}
                        </span>
                        <span className="name">{ this.props.acct.address }</span>

                        { false &&
                        <span className="avatar-indicator text-primary d-none d-lg-block">
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
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="mainNav">
                <div className="container">
                    <a className="navbar-brand" href="index.html">
                        <img src={logo} title="Menlo One" alt="Menlo One"/>
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

                        { this.renderAccountStatus() }
                    </div>
                </div>
            </nav>
        )
    }
}

export default withAcct(TopNav)
