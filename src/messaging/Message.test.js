/*
 * Copyright 2018 Vulcanize, Inc.
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
import {shallow} from 'enzyme'
import Message from './MessageView'
import MessageForm from './MessageForm'

describe('Message', () => {
  let message, client

  beforeEach(() => {
    client = {
      createMessage: jest.fn(() => Promise.resolve('newMessageHash')),
      getVotes: jest.fn(() => Promise.resolve(1)),
      countReplies: jest.fn(() => 0),
      getLocalMessages: jest.fn(() => Promise.resolve([])),
      topicOffset: jest.fn(() => 1)
    }
  })

  describe('parent message', () => {
    beforeEach(() => {
      message = shallow(<Message type={'parent'}
                                 client={client}
                                 body={'someMessageBody'}
                                 hash={'parentHash'}/>)
    })

    it('renders the message body and reply action', () => {
      expect(message.find('.text').text()).toContain('someMessageBody')

      const reply = message.find('.actions .reply')
      expect(reply.exists()).toEqual(true)
      expect(reply.text()).toEqual('reply')
    })

    it('renders a MessageForm on clicking the reply link', () => {
      expect(message.find(MessageForm).exists()).toEqual(false)

      message.find('.actions .reply').simulate('click')

      const messageForm = message.find(MessageForm)
      expect(messageForm.exists()).toEqual(true)
      expect(messageForm.props()).toEqual({
        id: 'parentHash',
        type: 'Response',
        onSubmit: expect.any(Function)
      })
    })

    it('uses the client to create a message when submitting the MessageForm', () => {
      message.find('.actions .reply').simulate('click')
      const messageForm = message.find(MessageForm)
      const submit = messageForm.props().onSubmit

      submit('someNewMessage')

      expect(client.createMessage).toHaveBeenCalledWith('someNewMessage', 'parentHash')
    })
  })

  describe('child message', () => {
    beforeEach(() => {
      message = shallow(<Message type={'child'}
                                 client={client}
                                 body={'someMessageBody'}
                                 hash={'childHash'}/>)
    })

    it('only renders the message body', () => {
      expect(message.find('.text').text()).toContain('someMessageBody')
      expect(message.find('.actions .reply').exists()).toEqual(false)
    })
  })
})
