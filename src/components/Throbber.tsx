import React, { Component } from 'react'
import './Throbber.scss'

class ThrobberProps {
}

interface ThrobberState {
}

export default class Throbber extends Component<ThrobberProps> {

    state : ThrobberState

    constructor(props : ThrobberProps, context) {
        super(props, context)
    }

    render() {

        return (
            <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        )
    }
}
