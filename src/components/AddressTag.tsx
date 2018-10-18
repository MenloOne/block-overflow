import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'

import utils from '../utils'

import './AddressTag.scss'

class AddressTagProps {
    address: String;
    etherscanTab?: String;
    link?: boolean;
    copy?: boolean;
}

interface AddressTagState {
    commandDown: boolean;
    url?: string;
}

export default class AddressTag extends Component<AddressTagProps> {

    state : AddressTagState

    constructor(props : AddressTagProps, context) {
        super(props, context)

        this.state = {
            commandDown: false
        }

        this.onKeyPressedDown = this.onKeyPressedDown.bind(this);
        this.onKeyPressedUp = this.onKeyPressedUp.bind(this);
    }

    componentWillMount() {
        utils.getUrl(this.props).then((url) => {
            this.setState({ url })
        });

        document.addEventListener("keydown", this.onKeyPressedDown.bind(this));
        document.addEventListener("keyup", this.onKeyPressedUp.bind(this));
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyPressedDown.bind(this));
        document.removeEventListener("keyup", this.onKeyPressedUp.bind(this));
    }

    onKeyPressedDown(e) {
        if (e.keyCode === 91) {
            this.setState({
                commandDown: true
            })
        }
    }

    onKeyPressedUp(e) {
        if (e.keyCode === 91) {
            this.setState({
                commandDown: false
            })
        }
    }

    onClick(e) {

        if (this.props.link === false) {
            e.preventDefault(true)
            return;
        }
        
        if (this.state.commandDown && this.props.copy !== false) {
            this.copyTextToClipboard(this.props.address)
            e.preventDefault(true)
            return
        }
    }

    copyTextToClipboard(text) {

        const textField = document.createElement('textarea')
        textField.innerText = text
        document.body.appendChild(textField)
        textField.select()
        document.execCommand('copy')
        textField.remove()

        localStorage.setItem('Tooltip-CtrlClickToCopy', `${Date.now()}`)

    }

    render() {
        const { address } = this.props;

        const actionKey = utils.isMacintosh() ? 'Cmd' : 'Ctrl'
        
        const { url } = this.state

        const renderContents = () => (
            <span className="AddressTag-container">
                <div className="AddressTag-wrapper">
                    <span className="AddressTag-name-0x">0x</span>
                    <span className="AddressTag-name">{address ? address.slice(2, address.length) : ''}</span>
                    <span className="AddressTag-name-dots">…</span>
                </div>
                {!localStorage.getItem('Tooltip-CtrlClickToCopy') && (
                    <span>
                        {this.props.copy && <i className="Tooltip-icon" data-tip={`${actionKey}+Click to Copy`}>?</i>}
                        <ReactTooltip />
                    </span>
                )}
            </span>)

        return this.props.link ? (
            <a className="AddressTag-link" href={this.props.link ? url : ''} disabled={!this.props.copy && !this.props.link} target="_blank" onClick={(e) => this.onClick(e)}>
                {renderContents()}
            </a>
        ) : (
            <button className="btn-blank AddressTag-link" disabled={!this.props.copy && !this.props.link} onClick={(e) => this.onClick(e)}>
                {renderContents()}
            </button>
        )
    }
}
