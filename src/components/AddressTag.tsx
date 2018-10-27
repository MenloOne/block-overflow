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
    statusTip?: string;
}

export default class AddressTag extends Component<AddressTagProps> {

    state : AddressTagState

    constructor(props : AddressTagProps, context) {
        super(props, context)

        this.state = {
            commandDown: false,
            statusTip: ''
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
        document.addEventListener("mousemove", this.onMouseMove.bind(this));

    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyPressedDown.bind(this));
        document.removeEventListener("keyup", this.onKeyPressedUp.bind(this));
        document.removeEventListener("mousemove", this.onMouseMove.bind(this));
    }

    onMouseMove(e) {
        if (e.metaKey) {
            if (!this.state.commandDown) {
                this.setState({
                    commandDown: true,
                    statusTip: 'Copied!'
                })
            }
        } else {
            if (this.state.commandDown) {
                this.setState({
                    commandDown: false,
                    statusTip: ''
                })
            }
        }
    }

    onKeyPressedDown(e) {
        if (e.keyCode === 91) {
            this.setState({
                commandDown: true,
                statusTip: 'Copied!'
            })
        }
    }

    onKeyPressedUp(e) {
        if (e.keyCode === 91) {
            this.setState({
                commandDown: false,
                statusTip: ''
            })
        }
    }

    onClick(e) {

        if (this.state.commandDown && this.props.copy !== false) {
            localStorage.setItem('Tooltip-CtrlClickToCopy', `${Date.now()}`)
            this.copyTextToClipboard(this.props.address)
            e.preventDefault(true)
            return
        } else {
            window.focus();
            e.stopPropagation();
            localStorage.setItem('Tooltip-ClickToCopy', `${Date.now()}`)
        }
    }

    copyTextToClipboard(text) {

        const textField = document.createElement('textarea')
        textField.innerText = text
        document.body.appendChild(textField)
        textField.select()
        document.execCommand('copy')
        textField.remove()

    }

    render() {
        const { address } = this.props;
        
        const { url, statusTip } = this.state

        const renderContents = () => (
            <span className="AddressTag-container">
                <div className="AddressTag-wrapper">
                    <span className="AddressTag-name-0x">0x</span>
                    <span className="AddressTag-name">{address ? address.slice(2, address.length) : ''}</span>
                    <span className="AddressTag-name-dots">…</span>
                    <ReactTooltip effect="solid" delayHide={1000} placement='top' event={'focus'} eventOff={'focus'} />
                </div>
            </span>)

        return this.props.link ? (
            <a className="AddressTag-link" data-tip={statusTip} href={this.props.link ? url : ''} disabled={!this.props.copy && !this.props.link} target="_blank" onClick={(e) => this.onClick(e)}>
                {renderContents()}
            </a>
        ) : (
            <button className="btn-blank AddressTag-link" data-tip={statusTip} disabled={!this.props.copy && !this.props.link} onClick={(e) => this.onClick(e)}>
                {renderContents()}
            </button>
        )
    }
}
