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
import MarkdownRenderer from 'react-markdown-renderer';

import Message from '../models/Message'
import { ForumContext } from '../models/Forum'

import AddressTag from '../components/AddressTag';

import MessageForm from './AnswerForm'

import '../App.scss'
import './Answers.scss'
import { CIDZero } from '../storage/HashUtils'


const voteTriangle = require('../images/vote-triangle.svg')


interface MessageViewProps {
    forum: ForumContext
    message: Message
    onChangeReplying?: (replying: boolean) => void
}

enum CommentFormState {
    Closed,
    OpenForUpvote,
    OpenForDownvote
}

interface MessageViewState {
    commentFormState: CommentFormState
    showReplies: boolean
    expanded: boolean
    children: any[]
    height: string | number
    originalHeight: string | number
}

export default class AnswerRow extends React.Component<MessageViewProps> {

    state : MessageViewState
    bodyElement : any
    commentMaxHeight: Number

    constructor(props: MessageViewProps) {
        super(props)

        this.state = {
            commentFormState: CommentFormState.Closed,
            showReplies: true,
            children: [],
            expanded: true,
            height: 'auto',
            originalHeight: 0
        }

        this.submitComment = this.submitComment.bind(this)
        this.upvote = this.upvote.bind(this)
        this.downvote = this.downvote.bind(this)

        this.commentMaxHeight = 210;
    }

    toggle = () => {
        const { height } = this.state;

        this.setState({
            height: height === this.commentMaxHeight ? 'auto' : this.commentMaxHeight,
        });
    };

    componentDidMount() {
        this.props.forum.svc.subscribeMessages(this.props.message.id, this.refreshMessages.bind(this))

        this.setState({
            height: this.bodyElement.clientHeight > this.commentMaxHeight ? this.commentMaxHeight : 'auto',
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

    onCancel() {
        this.setState({
            commentFormState: CommentFormState.Closed
        })

        if (this.props.onChangeReplying) {
            this.props.onChangeReplying(false)
        }
    }

    async submitComment(_body) {

        try {

            let body = _body.trim()
            if (body.length === 0) {
                body = null
            }

            if (this.state.commentFormState === CommentFormState.OpenForUpvote) {
                await this.props.forum.svc.upvoteAndComment(this.props.message.id, body)
            } else {
                await this.props.forum.svc.downvoteAndComment(this.props.message.id, body)
            }

            this.setState({
                commentFormState: CommentFormState.Closed
            })
            /*
    
            const child = (
                <Topic key={message.id}
                         message={message}
                         forumService={this.props.forum}/>
            )
    
            this.showReplies(true)
            this.setState({
                children: [...this.state.children, child],
                showCommentForm: false
            })
             */

            if (this.props.onChangeReplying) {
                this.props.onChangeReplying(false)
            }
            
        } catch (error) {
            throw error
        }
    }

    showReplies (show) {
        this.setState({ showReplies: show })
    }

    showCommentForm() {
        this.setState({showCommentForm: true})

        if (this.props.onChangeReplying) {
            this.props.onChangeReplying(true)
        }
    }

    async upvote() {
        this.setState({ commentFormState: CommentFormState.OpenForUpvote })
    }

    async downvote() {
        this.setState({ commentFormState: CommentFormState.OpenForDownvote })
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
                {
                    message.votes < 0 ?
                    <i className='fa fa-fw fa-thumbs-down'/>
                    :
                    <i className='fa fa-fw fa-thumbs-up'/>
                }
                { message.votes }
            </span>
        )
    }

    renderReplies() {
        return this.state.children.map(message => {
            return (
                <li key={message.id} className="borderis message">
                    <div className="user-img">
                        { message.author &&
                        <Blockies seed={message.author} size={ 12 } scale={ 4 }/>
                        }
                    </div>
                    <div className="content">
                        <MarkdownRenderer markdown={message.body}/>
                        <span><Moment fromNow>{message.date}</Moment></span>
                    </div>
                </li>
            )
        })
    }

    render() {
        const { height } = this.state;

        const message = this.props.message

        return (
            <li className="borderis message">
                {
                    this.props.forum.model.lottery.winningMessage && this.props.forum.model.lottery.winningMessage.id === message.id &&
                    <i className='fa fa-check winning-check' />
                }
                <div className="user-img">
                    { message.author &&
                    <Blockies seed={message.author} size={ 6 } scale={ 4 }/>
                    }
                </div>
                <div className="content">
                    {message && message.author && <AddressTag copy={true} link={true} address={message.author} /> }
                    <span className="points" style={{ display: 'none' }}>??? points </span>
                    <span className="time">
                        <Moment fromNow>{message.date}</Moment>
                    </span>
                    <AnimateHeight
                        duration={500}
                        height={height}
                    >
                        <div className={`comments-text ${(this.state.expanded ? "" : "limit")}`} ref={element => { this.bodyElement = element }}>
                            <MarkdownRenderer markdown={message.body}/>
                        </div>
                    </AnimateHeight>
                    {this.state.originalHeight > this.commentMaxHeight && this.state.height !== 'auto' &&
                    <button className="comments-readmore" onClick={ () => this.toggle() }>
                        Read More
                    </button>
                    }
                    {this.state.originalHeight > this.commentMaxHeight && this.state.height === 'auto' &&
                    <button className="comments-readmore" onClick={ () => this.toggle() }>
                        Collapse Comment
                    </button>
                    }
                    {(!this.props.message.upvoteDisabled() || !this.props.message.downvoteDisabled() || this.state.children.length > 0) && <div className="comments-votes">
                        { this.renderVotes() }
                        { (!this.props.message.upvoteDisabled() || !this.props.message.downvoteDisabled()) &&
                        <span >
                                <a onClick={this.upvote} disabled={this.props.message.upvoteDisabled() || this.state.commentFormState !== CommentFormState.Closed}><span className="Question-upvote"><img src={voteTriangle} className="icon-upvote" />Upvote</span></a>
                                <a onClick={this.downvote} disabled={this.props.message.downvoteDisabled() || this.state.commentFormState !== CommentFormState.Closed}>
                                    <span className="Question-downvote">
                                        <img src={voteTriangle} className="icon-downvote" />
                                        Downvote
                                    </span>
                                </a>
                            </span>
                        }
                        { (this.state.children.length > 0 || message.parent === CIDZero) &&
                        <span className='item'>
                            <a style={{display: 'none'}}>
                                <span className="Question-permalink">
                                    Permalink
                                </span>
                            </a>
                            <a style={{display: 'none'}}>
                                <span className="Question-report">
                                    Report
                                </span>
                            </a>
                            {this.state.children.length > 0 &&
                            <span>
                                {this.state.showReplies &&
                                <a className="hideReplies" onClick={() => this.showReplies(!this.state.showReplies)}> <em className="blue">Hide Comments </em></a>}
                                {!this.state.showReplies &&
                                <a className="showReplies" onClick={() => this.showReplies(!this.state.showReplies)}> <em className="blue">Show Comments</em> ({message.children.length})</a>}
                            </span>
                            }
                        </span>
                        }
                    </div>
                    }
                    <ul>
                        {this.state.showReplies && this.renderReplies()}
                    </ul>
                    {this.state.commentFormState !== CommentFormState.Closed &&
                        <MessageForm onSubmit={(message) => this.submitComment(message)}
                                     onCancel={() => this.onCancel()}
                                     rows={1}
                                     icon={ this.state.commentFormState === CommentFormState.OpenForUpvote ? 'fa-thumbs-up' : 'fa-thumbs-down' }/>
                    }
                </div>
            </li>
        )
    }
}
