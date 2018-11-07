import React, { Component } from 'react'

const metamaskLogo = require('../images/metamask-logo.png')

import './MetamaskModal.scss'

interface MetamaskModalState {
    visible?: boolean,
}

class MetamaskModal extends Component {

    state: MetamaskModalState

    constructor(props, context) {
        super(props, context)

        this.state = {
            visible: false
        }
    }

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    public show() {
        this.setState({ visible: true })
    }

    public hide() {
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

export default MetamaskModal
