import React, { Component } from 'react'

import { AccountContext } from '../models/Account'

const metamaskLogo = require('../images/metamask-logo.png')

import './MetamaskModal.scss'

class MetamaskModalProps {
    acct: AccountContext
}

interface MetamaskModalState {
    visible?: boolean,
}

class MetamaskModal extends Component<MetamaskModalProps> {

    state: MetamaskModalState
    account: Account

    constructor(props: MetamaskModalProps, context) {
        super(props, context)

        this.state = {
            visible: false
        }
    }

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    show() {
        this.setState({ visible: true })
    }

    hide() {
        this.setState({ visible: false })
    }

    render() {
        return this.props.acct.model.status === "logged out" || this.props.acct.model.status === "uninstalled" ? (
            <div className="MetamaskModal-container">
                <div className="MetamaskModal-wrapper">
                    <img className="MetamaskModal-logo" src={metamaskLogo} alt=""/>
                    {this.props.acct.model.status === "logged out" ? (
                        <div>
                            <h4>Sign into MetaMask</h4>
                            <p>
                                You are logged out.
                            </p>
                        </div>
                    ) : null}
                    {this.props.acct.model.status === "uninstalled" ? (
                        <div>
                            <h4>Open in Chrome and install MetaMask</h4>
                            <p>
                                You can <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en">install MetaMask</a> from the Chrome Browser Extensions store!
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
        ) : null
    }
}

export default MetamaskModal
