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
import {shallow} from 'enzyme'
import Message from './Message'
import MessageForm from './MessageForm'
import MessagesContainer from './MessagesContainer'

describe('MessagesContainer', () => {
  const messages = ['message1', 'message2']
  let client, messagesContainer

  beforeEach(() => {
    client = {
      getLocalMessages: jest.fn(() => Promise.resolve(['message1', 'message2'])),
      createMessage: jest.fn(() => Promise.resolve('someMessageHash')),
      subscribeMessages: jest.fn(),
      getVotes: jest.fn(0)
    }

    messagesContainer = shallow(<MessagesContainer client={client}/>)
  })

  it('renders a placeholder if there are no messages retrieved from the client', () => {
    client = {
      getLocalMessages: jest.fn(() => Promise.resolve([])),
      subscribeMessages: jest.fn()
    }

    messagesContainer = shallow(<MessagesContainer client={client}/>)

    const components = messagesContainer.find(Message)
    expect(components.exists()).toEqual(false)
    expect(messagesContainer.text()).toContain('There are no messages.')
  })

  it('renders a Topic for each message retrieved from the client', () => {
    messagesContainer.update()

    const components = messagesContainer.find(Message)

    expect(components.length).toEqual(messages.length)
  })

  it('renders a MessageForm', () => {
    const instance = messagesContainer.instance()
    instance.setState = jest.fn()

    const messageForm = messagesContainer.find(MessageForm)

    expect(messageForm.exists()).toEqual(true)
    expect(messageForm.props()).toEqual({onSubmit: expect.any(Function)})

    return messageForm.props().onSubmit('someMessageBody')
      .then(() => {
        expect(client.createMessage).toHaveBeenCalledWith('someMessageBody')
      })
  })
})
