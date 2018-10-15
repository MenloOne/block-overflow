import React, { Component } from 'react'
import './MetamaskModal.scss'

class MetamaskModalProps {
}

interface MetamaskModalState {
    visible?: boolean
}

class MetamaskModal extends Component<MetamaskModalProps> {

    state: MetamaskModalState

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

        return this.state.visible ? (
            <div>
            123123123
            </div>
        ) : null
    }
}

const modal = <MetamaskModal />;

export default modal
