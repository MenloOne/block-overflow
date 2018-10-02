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
import Blockies from 'react-blockies'

import { TopicsContext, withTopics } from "../services/Topics";
import Topic from "../services/Topic";
import CountdownTimer from '../components/CountdownTimer'

import '../App.scss'
import './Questions.scss'


import { history } from '../router'

interface TopicViewProps {
    topic: Topic,
    topics: TopicsContext,
    onChangeReplying: (bool) => void
}

interface TopicViewState {
    showReplyForm: boolean,
    showReplies: boolean,
}


class QuestionView extends React.Component<TopicViewProps> {

    state : TopicViewState

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
        return this.props.topics.svc.getTopic(this.props.topic.id) ? 'complete' : 'pending'
    }

    messageComplete() {
        return this.messageStatus() === 'complete'
    }

    messagePending() {
        return this.messageStatus() === 'pending'
    }


    render() {
        const topic = this.props.topic

        return (
            <li className='question'>
                <a onClick={ this.onClickTopic } >
                    <div className='user-img'>
                        <Blockies size={10} scale={6} seed={topic.author}/>
                    </div>
                    <div className="content">
                        <div className="title">
                            {topic.title}
                        </div>
                        <h3 className="tag-name">
                            <span className="points" style={ { display: 'none' } }>??? points </span>
                            <span className="time">
                                <Moment fromNow>{ topic.date }</Moment>
                            </span>
                        </h3>
                    </div>
                    <div className='stats' style={{ display: 'none' }}>
                        <CountdownTimer date={ new Date(0 /*topic.forumEndTime*/ ) } />
                    </div>
                </a>
            </li>
        )
    }
}

export default withTopics(QuestionView)
