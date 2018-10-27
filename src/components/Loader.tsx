import React, { Component } from 'react'

import { withAcct, AccountContext } from '../models/Account'

import './Loader.scss'

class LoaderProps {
    acct: AccountContext;
    size?: number;
    style?: object;
}

interface LoaderState {
    visible?: boolean,
}

class Loader extends Component<LoaderProps> {

    state: LoaderState
    account: Account

    constructor(props: LoaderProps, context) {
        super(props, context)
    }
    render() {
        return  (
            <div className="Loader" style={Object.assign({}, this.props.style, {height: this.props.size, width: this.props.size})}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        )
    }
}

export default withAcct(Loader)
