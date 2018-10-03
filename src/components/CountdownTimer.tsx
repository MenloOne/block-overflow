import React, { Component } from 'react'
import Countdown from 'react-countdown-now'

import './CountdownTimer.scss'

class CountdownTimerProps {
    date: Date
    renderCompleted?: () => void
}

export default class CountdownTimer extends Component<CountdownTimerProps> {

    constructor(props : CountdownTimerProps, context) {
        super(props, context)
        this.renderer = this.renderer.bind(this)
    }

    renderer({ days, hours, minutes, seconds, completed }) {
        if (completed) {
            if (this.props.renderCompleted) {
                return this.props.renderCompleted()
            }

            return null
        }

        return (
            <div className="time-watch">
                {parseInt(days, 10) > 0 && (
                    <span>
                        <div>{days}<span>Days</span></div>
                        <div className="dots">:</div>
                    </span>
                )}
                <div>{hours}<span>Hours</span></div>
                <div className="dots">:</div>
                <div>{minutes}<span>Minutes</span></div>
                <div className="dots">:</div>
                <div>{seconds}<span>Seconds</span></div>
            </div>
        )
    }

    render() {
        return (
            <Countdown date={ this.props.date } zeroPadLength={2} renderer={ this.renderer } />
        )
    }
}
