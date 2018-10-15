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

import Message from './Message'
import { CID } from 'ipfs'
import { CIDZero } from '../storage/HashUtils'


class MessageGraph {

    messages : {}

    constructor(rootMessage: Message) {
        this.messages = {}
        this.add(rootMessage)
    }

    add(message : Message) {
        const parentID : CID = message.parent || CIDZero
        // console.log('adding :', message)

        if (typeof message.id === 'undefined') {
            throw new Error('Adding invalid node')
        }

        this.messages[message.id] = message

        if (parentID && parentID !== message.id) {
            let parent = this.messages[parentID]

            if (!parent) {
                parent = new Message(message.forum, parentID, CIDZero, -1)
                this.add(parent)
            }

            if (!parent.children.includes(message.id)) {
                parent.children.push(message.id)
            }
        }

        console.log(`Added ${message.id} w/ children ${message.children.map(id => `${id}, `)}`)
    }

    delete(message : Message) {
        delete this.messages[message.id]
    }

    get(id : CID) : Message {
        return this.messages[id]
    }
}

export default MessageGraph
