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
import { withAcct } from '../services/Account'
import SimpleMDE from 'react-simplemde-editor';
import "simplemde/dist/simplemde.min.css";


class TopicFormProps {
    onSubmit: (title: string, body: string) => void
    onCancel: () => void
}


class TopicForm extends React.Component<TopicFormProps> {
    
    state = {
        message: '',
        title: '',
        submitting: false,
        error: ''
    }

    constructor(props) {
        super(props)

        this.onChange = this.onChange.bind(this)
        this.onCancel = this.onCancel.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.onChangeTitle = this.onChangeTitle.bind(this)
    }

    componentWillReceiveProps(newProps) {
        this.refreshForum(newProps)
    }

    async refreshForum(newProps) {
    }

    async onSubmit(event) {
        event.preventDefault()
        this.setState({ submitting: true })

        try {
            await this.props.onSubmit(this.state.title, this.state.message)
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
                <div>Question</div>
                <textarea name="" className="field" id="" cols={30} rows={1} value={this.state.title} onChange={this.onChangeTitle}></textarea>
                <div>Details</div>
                <SimpleMDE
                    onChange={this.onChange}
                    value={this.state.message}
                    options={{
                        autofocus: true,
                        spellChecker: false,
                        // etc.
                    }}
                />
                <input type="submit" className="btn submit-btn" disabled={this.state.submitting} value='Post Question'/>
                <a className="btn cancel-btn" onClick={this.onCancel}>Cancel</a>
                {this.state.error && <p className="error new-message">{this.state.error}</p>}
            </form>
        )
    }
}

export default withAcct(TopicForm)
