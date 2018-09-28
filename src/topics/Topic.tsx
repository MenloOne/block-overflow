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
import Moment from 'react-moment'

import TopicForm from './TopicForm'

import '../App.scss'
import './Topic.css'
import TopicsService from "../services/TopicsService";
import Topic from "../services/Topic";


interface TopicComponentProps {
    topic: Topic,
    service: TopicsService,
    onChangeReplying: (bool) => void
}

interface TopicComponentState {
    showReplyForm: boolean,
    showReplies: boolean,
}


class TopicComponent extends React.Component<TopicComponentProps> {

    state : TopicComponentState

    constructor(props) {
        super(props)

        this.state = {
            showReplyForm: false,
            showReplies: true
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    async reply(body) {
        this.setState({ showReplyForm: false })

        await this.props.service.createTopic(body, 5)
        /*

        const child = (
            <Topic key={message.id}
                     message={message}
                     forumService={this.props.forumService}/>
        )

        this.showReplies(true)
        this.setState({
            children: [...this.state.children, child],
            showReplyForm: false
        })
         */

        this.setState({
            showReplyForm: false
        })

        if (this.props.onChangeReplying) {
            this.props.onChangeReplying(false)
        }
    }

    showReplies (show) {
        this.setState({ showReplies: show })
    }

    showReplyForm() {
        this.setState({showReplyForm: true})

        if (this.props.onChangeReplying) {
            this.props.onChangeReplying(true)
        }
    }

    messageStatus() {
        return this.props.service.getTopic(this.props.topic.id) ? 'complete' : 'pending'
    }

    messageComplete() {
        return this.messageStatus() === 'complete'
    }

    messagePending() {
        return this.messageStatus() === 'pending'
    }

    renderVotes() {
        const message = this.props.topic
        const metadata = message.metadata
        if (!metadata || metadata.votes === 0) {
            return null
        }

        return (
            // tslint:disable-next-line
            <span className="votes-indicator item text-primary d-lg-block" negative={(metadata.votes < 0) ? 'true' : 'false'}>
                <div className='circle left'/>
                <div className='circle mid'>
                    {metadata.votes < 0 ?
                        <span><i className='fa fa-fw fa-thumbs-down'/>{metadata.votes}</span>
                        :
                        <span><i className='fa fa-fw fa-thumbs-up'/>{metadata.votes}</span>
                    }
                </div>
                <div className='circle right'/>
            </span>
        )
    }

    render() {
        const message = this.props.topic

        return (
            <li className="borderis message">
                <div className="content">
                    <h3 className="tag-name">
                        <span className="points" style={ { display: 'none' } }>??? points </span>
                        <span className="time">
                            <Moment fromNow>{ message.date }</Moment>
                        </span>
                    </h3>
                    <div className="comments-text">
                        {message.body}
                    </div>
                    {this.state.showReplyForm &&
                        <TopicForm onSubmit={(message) => this.reply(message)}/>
                    }
                </div>
            </li>
        )
    }
}

export default TopicComponent
