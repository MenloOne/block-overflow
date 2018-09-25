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
import MessageForm from './MessageForm'

describe('MessageForm', () => {
  it('renders a form to submit a message', () => {
    const onSubmit = jest.fn(() => Promise.resolve())
    const messageForm = shallow(<MessageForm onSubmit={onSubmit}/>)

    const input = messageForm.find('input[type="text"]')
    input.simulate('change', {target: {value: 'example message'}})

    expect(messageForm.state().message).toEqual('example message')

    const submitEvent = {preventDefault: jest.fn()}
    messageForm.find('form').simulate('submit', submitEvent)

    expect(submitEvent.preventDefault).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledWith('example message')
  })
})
