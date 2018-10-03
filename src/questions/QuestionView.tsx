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

import { TopicsContext, withTopics } from "../models/Topics";
import Topic from "../models/Topic";
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
        this.renderClosed = this.renderClosed.bind(this)

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

    renderClosed() {
        if (!this.props.topic.isAnswered && this.props.topic.metadata!.isClosed) {
            return <span className='closed'>NO ANSWER</span>
        }

        if (this.props.topic.iWon) {
            return <span className='closed'>YOU WON!</span>
        }

        return <span className='closed'>CLOSED</span>
    }

    render() {
        const topic = this.props.topic

        return (
            <li className='question'>
                <a onClick={ this.onClickTopic } >
                    <div className='user-img'>
                        <Blockies size={12} scale={4} seed={topic.author}/>
                    </div>
                    <div className="content">
                        <span className="title">
                            { (topic.title && topic.title.length > 4) ?
                                topic.title
                                :
                                topic.body.substr(0, 100)
                            }
                        </span>
                        <div>
                            <div className="tag-name-wrapper">
                                <span className="tag-name-0x">0x</span>
                                <span className="tag-name">{topic ? topic.author.slice(2, topic.author.length) : '...'}</span>
                                <span className="tag-name-dots">…</span>
                            </div>
                            <span>
                                <span className="points" style={{ display: 'none' }}>??? points </span>
                            </span>
                            <Moment fromNow>{topic.date}</Moment>
                        </div>
                    </div>
                    <div className='stats'>
                        { topic.totalAnswers }
                        <span>ANSWERS</span>
                    </div>
                    <div className='stats'>
                        { topic.winningVotes }
                        <span>VOTES</span>
                    </div>
                    <div className='stats stats-timer'>
                        <CountdownTimer date={ new Date(topic.endTime) } renderCompleted={ this.renderClosed }/>
                    </div>
                </a>
            </li>
        )
    }
}

export default withTopics(QuestionView)
