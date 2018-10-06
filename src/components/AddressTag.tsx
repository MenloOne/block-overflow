import React, { Component } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import ReactTooltip from 'react-tooltip'

import web3 from '../models/Web3'

import utils from '../utils'

import './AddressTag.scss'

class AddressTagProps {
    address: String;
    etherscanTab?: String;
}

interface AddressTagState {
    commandDown: boolean
}

export default class AddressTag extends Component<AddressTagProps> {

    state : AddressTagState

    constructor(props : AddressTagProps, context) {
        super(props, context)

        this.state = {
            commandDown: false,
        }

        this.onCopy = this.onCopy.bind(this);
        this.onKeyPressed = this.onKeyPressed.bind(this);
    }

    componentWillMount() {
        document.addEventListener("keydown", this.onKeyPressed.bind(this));
        document.addEventListener("keyup", this.onKeyPressed.bind(this));
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyPressed.bind(this));
        document.removeEventListener("keyup", this.onKeyPressed.bind(this));
    }

    onKeyPressed(e) {
        if (e.keyCode === 91) {
            const opposite = !Object.assign({}, this.state).commandDown;
            this.setState({
                commandDown: opposite
            })
        }
    }

    onCopy() {

        if (this.state.commandDown) {

            web3.version.getNetwork((err, netId) => {

                const { address, etherscanTab } = this.props;
                let url;
                const targetId = etherscanTab ? `#${etherscanTab}` : '';

                switch (netId) {
                    case "42":
                        url = 'https://kovan.etherscan.io'
                        break
                    default:
                        url = 'https://etherscan.io'
                }
                
                
                window.open(`${url}/address/${address}${targetId}`, '_blank');
                localStorage.setItem('ctrlClick', `${Date.now()}`)
            })
        }
    }

    render() {
        const { address } = this.props;

        const actionKey = utils.isMacintosh() ? 'Cmd' : 'Ctrl'

        return (
            <CopyToClipboard text={address} onCopy={this.onCopy.bind(this)}>
                <span>
                    <div className="AddressTag-wrapper">
                        <span className="AddressTag-name-0x">0x</span>
                        <span className="AddressTag-name">{address ? address.slice(2, address.length) : ''}</span>
                        <span className="AddressTag-name-dots">…</span>
                    </div>
                    {!localStorage.getItem('ctrlClick') && (
                        <span>
                            <i className="Tooltip-icon" data-tip={`${actionKey}+Click to open in Etherscan`}>?</i>
                            <ReactTooltip />
                        </span>
                    )}
                </span>
            </CopyToClipboard>
        )
    }
}
