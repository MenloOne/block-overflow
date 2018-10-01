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
import AnimateHeight from 'react-animate-height';
import Blockies from 'react-blockies'
import Moment from 'react-moment'

import Message from '../services/Message'
import { ForumContext } from '../services/Forum'

import MessageForm from './MessageForm'

import '../App.scss'
import './Message.css'


const voteTriangle = require('../images/vote-triangle.svg')


interface MessageViewProps {
    forum: ForumContext
    message: Message
    onChangeReplying?: (replying: boolean) => void
}

interface MessageViewState {
    showReplyForm: boolean
    showReplies: boolean
    expanded: boolean
    children: any[]
    height: string | number
    originalHeight: string | number
}

export default class MessageView extends React.Component<MessageViewProps> {

    state : MessageViewState
    bodyElement : any

    constructor(props: MessageViewProps) {
        super(props)

        this.state = {
            showReplyForm: false,
            showReplies: true,
            children: [],
            expanded: true,
            height: 'auto',
            originalHeight: 0
        }

        this.upvote = this.upvote.bind(this)
        this.downvote = this.downvote.bind(this)
    }

    toggle = () => {
        const { height } = this.state;

        this.setState({
            height: height === 200 ? 'auto' : 200,
        });
    };

    componentDidMount() {
        this.props.forum.svc.subscribeMessages(this.props.message.id, this.refreshMessages.bind(this))

        this.setState({
            height: this.bodyElement.clientHeight > 200 ? 200 : 'auto',
            originalHeight: this.bodyElement.clientHeight
        })
    }

    componentWillUnmount() {
        this.props.forum.svc.subscribeMessages(this.props.message.id, null);
    }

    componentWillReceiveProps(newProps) {
        this.refreshMessages()
    }

    async refreshMessages() {
        const message = this.props.message

        const replies = await this.props.forum.svc.getChildrenMessages(message.id)
        this.setState({ children: replies })
    }

    async reply(body) {
        this.setState({ showReplyForm: false })

        await this.props.forum.svc.createMessage(body, this.props.message.id)
        /*

        const child = (
            <Topic key={message.id}
                     message={message}
                     forumService={this.props.forum}/>
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

    async upvote() {
        this.props.forum.svc.upvote(this.props.message.id, null, null)
    }

    async downvote() {
        this.props.forum.svc.downvote(this.props.message.id, null, null)
    }

    messageStatus() {
        return this.props.forum.svc.getMessage(this.props.message.id) ? 'complete' : 'pending'
    }

    messageComplete() {
        return this.messageStatus() === 'complete'
    }

    messagePending() {
        return this.messageStatus() === 'pending'
    }

    renderVotes() {
        const message = this.props.message
        if (message.votes === 0) {
            return null
        }

        return (
            <span className="votes-indicator item text-primary d-lg-block" negative={(message.votes < 0) ? 'true' : 'false'}>
                <div className='circle left'/>
                <div className='circle mid'>
                    {message.votes < 0 ?
                        <span><i className='fa fa-fw fa-thumbs-down'/>{message.votes}</span>
                        :
                        <span><i className='fa fa-fw fa-thumbs-up'/>{message.votes}</span>
                    }
                </div>
                <div className='circle right'/>
            </span>
        )
    }

    renderReplies() {
        return this.state.children.map(m => {
            return (
                <MessageView key={m.id}
                             message={m}
                             forum={this.props.forum}/>
            )
        })
    }

    render() {
        const { height } = this.state;

        const message = this.props.message

        return (
            <li className="borderis message">
                <div className="user-img">
                    <Blockies seed={message.author} size={ 9 } />
                </div>
                <div className="content">
                    <span className="alias">
                        { message.author }
                    </span>
                    <span className="points" style={{ display: 'none' }}>??? points </span>
                    <span className="time">
                        <Moment fromNow>{message.date}</Moment>
                    </span>
                    <AnimateHeight
                        duration={500}
                        height={height} // see props documentation bellow
                    >
                        <div className={`comments-text ${(this.state.expanded ? "" : "limit")}`} ref={element => {
                            this.bodyElement = element;
                        }}>
                            {message.body}
                        </div>
                    </AnimateHeight>
                    {this.state.originalHeight > 200 && this.state.height !== 'auto' &&
                    <button className="comments-readmore" onClick={ () => this.toggle() }>
                        Read More
                    </button>
                    }
                    {this.state.originalHeight > 200 && this.state.height === 'auto' &&
                    <button className="comments-readmore" onClick={ () => this.toggle() }>
                        Collapse Comment
                    </button>
                    }
                    <div className="comments-votes">
                        <span>{ this.renderVotes() }</span>
                        { (!this.props.message.upvoteDisabled() || !this.props.message.downvoteDisabled()) &&
                        <span >
                                <a onClick={this.upvote}   disabled={this.props.message.upvoteDisabled()}><span className="Question-upvote"><img src={voteTriangle} className="icon-upvote" />Upvote</span></a>
                                <a onClick={this.downvote} disabled={this.props.message.downvoteDisabled()}>
                                    <span className="Question-downvote">
                                        <img src={voteTriangle} className="icon-downvote" />
                                        Downvote
                                    </span>
                                </a>
                            </span>
                        }
                        { (this.state.children.length > 0 || message.parent === '0x0') &&
                        <span className='item'>
                            {message.parent === '0x0' && <a className="reply" onClick={this.showReplyForm.bind(this)}>
                                <span className="Question-reply">
                                    Reply
                                    </span></a>}
                            <a href="">
                                    <span className="Question-permalink">
                                        Permalink
                                    </span>
                                </a>
                                <a href="">
                                    <span className="Question-report">
                                        Report
                                    </span>
                                </a>
                            {this.state.children.length > 0 &&
                            <span>
                                {this.state.showReplies &&
                                <a className="hideReplies" onClick={() => this.showReplies(!this.state.showReplies)}> <em className="blue">Hide
                                    Replies </em></a>}
                                {!this.state.showReplies &&
                                <a className="showReplies" onClick={() => this.showReplies(!this.state.showReplies)}> <em className="blue">Show
                                    Replies</em> ({message.children.length})</a>}
                                </span>
                            }
                        </span>
                        }
                    </div>
                    <ul>
                        {this.state.showReplies && this.renderReplies()}
                    </ul>
                    {this.state.showReplyForm &&
                    <MessageForm onSubmit={(message) => this.reply(message)}/>
                    }
                </div>
            </li>
        )
    }
}
