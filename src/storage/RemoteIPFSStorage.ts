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
import PromiseTimeout  from '../utils/PromiseTimeout'
import { CID, IPFSFile } from 'ipfs'


export class IPFSMessage {
    version: number = 1
    offset:  number = -1
    topic:   number = 0
    parent:  CID = ''
    author:  string = ''
    date:    number = 0
    body:    string = ''
}

export class IPFSTopic {
    version: number = 1
    offset:  number = -1
    author:  string = ''
    date:    number = 0
    title:   string = ''
    body:    string = ''
}

class RemoteIPFSStorage {

    private ipfs      : ipfs
    private ipfsMenlo : ipfs

    constructor() {
        this.ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
        this.ipfsMenlo = ipfsAPI('ipfs.menlo.one', '443', { protocol: 'https' })
    }

    async createMessage(message : IPFSMessage) : Promise<CID> {
        const file = {
            path: `/${message.topic}/${message.offset}.json`,
            content: Buffer.from(JSON.stringify(message))
        }
        const result = await this.ipfs.files.add([file], { pin: true })
        const hash = result[0].hash

        await (this.ipfsMenlo as any).pin.add(hash)

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

    async createTopic(topic : IPFSTopic) : Promise<CID> {
        const file = {
            path: `/${topic.offset}/Topic.json`,
            content: Buffer.from(JSON.stringify(topic))
        }
        const result = await this.ipfs.files.add([file], { pin: true })
        const hash = result[0].hash

        await (this.ipfsMenlo as any).pin.add(hash)

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

    async getMessage<T>(hash : CID) : Promise<T> {
        let tries = 4
        let files : IPFSFile[] | null = null
        let ipfs = this.ipfsMenlo

        do {

            try {
                files = await PromiseTimeout(10000, ipfs.files.get(hash))
            } catch (e) {
                if (tries-- === 0) {
                    throw (e)
                }

                ipfs = (ipfs === this.ipfsMenlo) ? this.ipfs : this.ipfsMenlo
            }
        } while (!files)

        let json
        try {
            json = JSON.parse(files![0].content!.toString())
        } catch (e) {
            console.log('Error parsing IPFS JSON', e)
            throw (e)
        }

        return json
    }

    async pin(hash : CID) {
        await (this.ipfs as any).pin.add(hash)
    }

    async unpin(hash : CID) {
        console.log(`Unpinning ${hash}`)
        await (this.ipfs as any).pin.rm(hash)
    }
}

export default RemoteIPFSStorage
