import React, { Component } from 'react'

import { withAcct, AccountContext } from '../models/Account'

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
        return  (
            <div className="MetamaskModal-container">
                <div className="MetamaskModal-wrapper">
                    <img className="MetamaskModal-logo" src={metamaskLogo} alt=""/>
                    <div>
                        <h4>Confirm MetaMask</h4>
                        <p>
                            MetaMask will open momentarily.
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}

export default withAcct(MetamaskModal)
