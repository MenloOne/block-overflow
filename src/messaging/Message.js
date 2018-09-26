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
import Blockies from 'react-blockies'
import Moment from 'react-moment'

import MessageForm from './MessageForm'

import '../styles/app.scss'
import './Message.css'

class Message extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            showReplyForm: false,
            showReplies: true,
            children: [],
        }
    }

    componentDidMount() {
        this.props.forumService.subscribeMessages(this.props.message.id, this.refreshMessages.bind(this))
    }

    componentWillUnmount() {
        this.props.forumService.subscribeMessages(this.props.message.id, null);
    }

    componentWillReceiveProps(newProps) {
        this.refreshMessages()
    }

    async refreshMessages() {
        let message = this.props.message

        let replies = await this.props.forumService.getChildrenMessages(message.id)
        this.setState({ children: replies })
    }

    async reply(body) {
        this.setState({ showReplyForm: false })

        let message = await this.props.forumService.createMessage(body, this.props.message.id)
        /*

        const child = (
            <Message key={message.id}
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

    async upvote() {
        await this.props.forumService.upvote(this.props.message.id)
    }

    async downvote() {
        await this.props.forumService.downvote(this.props.message.id)
    }

    messageStatus() {
        return this.props.forumService.getMessage(this.props.message.id) ? 'complete' : 'pending'
    }

    messageComplete() {
        return this.messageStatus() === 'complete'
    }

    messagePending() {
        return this.messageStatus() === 'pending'
    }

    renderVotes() {
        let message = this.props.message
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
                <Message key={m.id}
                         message={m}
                         forumService={this.props.forumService}/>
            )
        })
    }

    render() {
        let message = this.props.message

        return (
            <li className="borderis message">
                <div className="comments user-img">
                    <Blockies seed={message.author} size={ 9 } />
                </div>
                <div className="content">
                    <h3 className="tag-name">
                        {message.author}
                        <span className="points" style={ { display: 'none' } }>??? points </span>
                        <span className="time">
                            <Moment fromNow>{ message.date }</Moment>
                        </span>
                    </h3>
                    <div className="comments-text">
                        {message.body}
                    </div>
                    <div className="comments-votes">
                        <span>{ this.renderVotes() }</span>
                        { (!this.props.message.upvoteDisabled() || !this.props.message.downvoteDisabled()) &&
                            <span >
                                    <a onClick={this.downvote.bind(this)}  disabled={this.props.message.downvoteDisabled()}><span className='item'><i className="fa fa-thumbs-down fa-lg"></i></span></a>
                                    <a onClick={this.upvote.bind(this)}    disabled={this.props.message.upvoteDisabled()}><span className='item'><i className="fa fa-thumbs-up fa-lg" ></i></span></a>
                                </span>
                        }
                        { (this.state.children.length > 0 || message.parent === '0x0') &&
                        <span className='item'>
                            { message.parent === '0x0' &&  <a className="reply" onClick={this.showReplyForm.bind(this)}><span>Reply</span></a> }
                            {this.state.children.length > 0 &&
                            <span>
                                {this.state.showReplies &&
                                <a onClick={() => this.showReplies(!this.state.showReplies)}> <em className="blue">Hide
                                    Replies </em></a>}
                                {!this.state.showReplies &&
                                <a onClick={() => this.showReplies(!this.state.showReplies)}> <em className="blue">Show
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

export default Message
