/*
 * Copyright 2018 Menlo One, Inc.
 * Parts Copyright 2018 Vulcanize, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import { withAcct } from '../models/Account'
import SimpleMDE from 'react-simplemde-editor';
import "simplemde/dist/simplemde.min.css";


class TopicFormProps {
    onSubmit: (title: string, body: string, tokenBounty: number) => void
    onCancel: () => void
}

const MIN_BOUNTY = 10

class QuestionForm extends React.Component<TopicFormProps> {

    state = {
        message: '',
        title: '',
        submitting: false,
        error: '',
        bounty: MIN_BOUNTY.toString()
    }

    constructor(props) {
        super(props)

        this.onChange = this.onChange.bind(this)
        this.onCancel = this.onCancel.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.onChangeTitle = this.onChangeTitle.bind(this)
        this.onChangeBounty = this.onChangeBounty.bind(this)
        this.onBlurBounty = this.onBlurBounty.bind(this)
    }

    componentWillReceiveProps(newProps) {
        this.refreshForum(newProps)
    }

    onBlurBounty(evt) {
        let bounty = parseInt(evt.target.value, 10)
        if (bounty < MIN_BOUNTY) {
            bounty = MIN_BOUNTY
        }
        this.setState({ bounty: bounty.toString() })
    }

    onChangeBounty(evt) {
        this.setState({ bounty: evt.target.value })
    }

    async refreshForum(newProps) {
    }

    async onSubmit(event) {
        event.preventDefault()
        this.setState({ submitting: true })

        try {
            await this.props.onSubmit(this.state.title, this.state.message, parseInt(this.state.bounty, 10))
            this.setState({
                title: '',
                message: '',
                submitting: false,
                error: null
            })
        } catch (e) {
            this.setState({
                error: e.message,
                submitting: false,
            })
        }
    }

    onChange(value) {
        this.setState({ message: value })
    }

    onChangeTitle(event) {
        this.setState({ title: event.target.value })
    }

    onCancel() {
        this.setState({ title: '', message: '' })
        this.props.onCancel()
    }

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <div>Bounty</div>
                <input className='field' onChange={this.onChangeBounty} value={this.state.bounty} onBlur={this.onBlurBounty}/>
                <div>Question</div>
                <input className="field" id="" value={this.state.title} onChange={this.onChangeTitle} />
                <div>Details</div>
                <SimpleMDE
                    onChange={this.onChange}
                    value={this.state.message}
                    options={{
                        autofocus: true,
                        spellChecker: false,
                    }}
                />
                <div className="askquestion-button-wrapper">
                    <input type="submit" className="btn submit-btn" disabled={this.state.submitting} value='Post Question' />
                    <a className="btn cancel-btn" onClick={this.onCancel}>Cancel</a>
                </div>
                {this.state.error && <p className="error new-message">{this.state.error}</p>}
            </form>
        )
    }
}

export default withAcct(QuestionForm)
