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

import '../App.scss'
import './Topic.css'
import TopicsService from "../services/TopicsService";
import Topic from "../services/Topic";

import { history } from '../config'

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

        this.onClickTopic = this.onClickTopic.bind(this)

        this.state = {
            showReplyForm: false,
            showReplies: true
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    onClickTopic() {
        history.push(`/topic/${ this.props.topic.forumAddress }`)
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


    render() {
        const message = this.props.topic

        return (
            <li className="borderis message">
                <a onClick={ this.onClickTopic } >
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
                    </div>
                </a>
            </li>
        )
    }
}

export default TopicComponent
