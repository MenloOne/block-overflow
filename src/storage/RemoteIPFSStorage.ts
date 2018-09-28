/*
 * Copyright 2018 Menlo One, Inc.
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

import ipfsAPI from 'ipfs-api'
import PromiseTimeout, { Timeout } from '../utils/PromiseTimeout'
import Message from "../services/Message";


export class IPFSMessage {
    version: number
    offset:  number
    topic:   number
    parent:  string
    author:  string
    date:    number
    body:    string
}

export class IPFSTopic {
    version: number
    offset:  number
    author:  string
    date:    number
    body:    string
}

class RemoteIPFSStorage {

    private ipfs : ipfs

    constructor() {
        // this.ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
        this.ipfs = ipfsAPI('ipfs.menlo.one', '443', { protocol: 'https' })
    }

    async createMessage(message : IPFSMessage) {
        const file = {
            path: `/${message.topic}/${message.offset}.json`,
            content: Buffer.from(JSON.stringify(message))
        }
        const result = await this.ipfs.files.add([file], { pin: true })
        const hash = result[0].hash

        /*
        console.log(`Created ${hash}`)

        const list = await this.ipfs.pin.ls()
        console.log(list.filter(l => l.hash === hash))

        const add = await this.ipfs.pin.add(hash)

        const list2 = await this.ipfs.pin.ls()
        console.log(list.filter(l => l.hash === hash))

        Test
        const hashSolidity = HashUtils.cidToSolidityHash(hash)
        const ipfsHash = HashUtils.solidityHashToCid(hashSolidity)

        let files = await this.ipfs.files.get(ipfsHash)
        let ipfsMessage = JSON.parse(files[0].content.toString('utf8'))
        console.log(`Stored ${ipfsMessage}`)
         */

        return hash
    }

    async createTopic(topic : IPFSTopic) {
        const file = {
            path: `/${topic.offset}/Topic.json`,
            content: Buffer.from(JSON.stringify(topic))
        }
        const result = await this.ipfs.files.add([file], { pin: true })
        const hash = result[0].hash

        /*
        console.log(`Created ${hash}`)

        const list = await this.ipfs.pin.ls()
        console.log(list.filter(l => l.hash === hash))

        const add = await this.ipfs.pin.add(hash)

        const list2 = await this.ipfs.pin.ls()
        console.log(list.filter(l => l.hash === hash))

        Test
        const hashSolidity = HashUtils.cidToSolidityHash(hash)
        const ipfsHash = HashUtils.solidityHashToCid(hashSolidity)

        let files = await this.ipfs.files.get(ipfsHash)
        let ipfsMessage = JSON.parse(files[0].content.toString('utf8'))
        console.log(`Stored ${ipfsMessage}`)
         */

        return hash
    }

    async get(hash) : Promise<IPFSTopic | IPFSMessage> {
        const files = await PromiseTimeout(10000, this.ipfs.files.get(hash))
        return JSON.parse(files[0].content.toString('utf8'))
    }

    async fillMessage(message : Message) {
        console.log(`IPFS Files Get ${message.id}`)
        try {
            const ipfsMessage = await this.get(message.id)

            Object.assign(message, ipfsMessage)

        } catch (e) {
            if (e instanceof Timeout) {
                // TODO: Kill outstanding connection
            }
            throw (e)
        }
    }

    async pin(hash : string) {
        await (this.ipfs as any).pin.add(hash)
    }

    async unpin(hash : string) {
        console.log(`Unpinning ${hash}`)
        await (this.ipfs as any).pin.rm(hash)
    }
}

export default RemoteIPFSStorage
