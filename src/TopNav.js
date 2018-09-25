import React, {Component} from 'react'
import BigNumber from 'bignumber.js'

import 'bootstrap/dist/css/bootstrap.min.css'
import {withEth} from './EthContext'

import web3 from './web3_override'
import TruffleContract from 'truffle-contract'
import MenloFaucetContract from './truffle_artifacts/contracts/MenloFaucet.json'

import './css/sb-admin.css'

const logo = require('./images/logo.svg')

class TopNav extends Component {

    constructor() {
        super()
        this.onGetTokens = this.onGetTokens.bind(this)
    }

    async onGetTokens() {
        if (this.props.eth.status !== 'ok') {
            return
        }

        try {
            let faucetContract = TruffleContract(MenloFaucetContract)
            faucetContract.defaults({
                from: this.props.eth.account
            })
            faucetContract.setProvider(web3.currentProvider)

            let faucet = await faucetContract.deployed()
            await faucet.drip()

            this.props.eth.refreshBalance()
        } catch (e) {
            window.alert( e )
        }
    }

    renderONE() {
        let one = this.props.eth.balance

        if (one === 0) {
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
        console.log( 'STATUS: ', this.props.eth.status )

        if (this.props.eth.status === 'logged out') {
            return (
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item token-number">
                        <span className="token-one">YOU MUST SIGN INTO METAMASK TO TAKE PART IN DISCUSSIONS</span>
                    </li>
                </ul>
            )
        }

        if (this.props.eth.status === 'uninstalled') {
            return (
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item token-number">
                        <span className="token-one">YOU MUST USE CHROME WITH THE METAMASK EXTENSION TO TAKER PART IN DISCUSSIONS</span>
                    </li>
                </ul>
            )
        }

        if (this.props.eth.status === 'error') {
            return (
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item token-number">
                        <span className="token-one">{ this.props.eth.error }</span>
                    </li>
                </ul>
            )
        }

        if (this.props.eth.status === 'starting') {
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
                            {this.props.eth.avatar}
                        </span>
                        <span className="name">{ this.props.eth.account }</span>

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
                        <ul className="navbar-nav main ml-auto" style={{display: 'none'}}>
                            <li className="nav-item"><a href="/" title="Discover">Discover</a></li>
                            <li className="nav-item"><a href="/guild/" title="Guilds">Guilds</a></li>
                            <li className="nav-item"><a href="/wallet/" title="Wallet">Wallet</a></li>
                        </ul>

                        { this.renderAccountStatus(this.props.eth.status) }
                    </div>
                </div>
            </nav>
        )
    }
}

export default withEth(TopNav)
