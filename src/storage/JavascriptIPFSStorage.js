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

import IPFS from 'ipfs'
import promiseTimeout from '../promiseTimeout'
import HashUtils from '../HashUtils'

class JavascriptIPFSStorage {
    constructor() {
        this.ipfs = new IPFS()
        this.connectedToPeer = false
    }

    createMessage(message) {
        return new Promise((resolve, reject) => {
            HashUtils.nodeToCID(message, (cidErr, cid) => {
                this.ipfs.dag.put(message, {cid: cid}, (putErr, result) => {
                    resolve(result.toBaseEncodedString())
                })
            })
        })
    }

    rm(message) {
    }

    async fillMessage(message) {
        let result = await promiseTimeout(15000, this.ipfs.dag.get(message.id))
        let ipfsMessage = result.value

        Object.assign(message, ipfsMessage)
    }

    connectPeer(remote) {
        try {
            this.ipfs.on('ready', async () => {

                // The Menlo NGINX proxy converts WSS:4002 to WS:8081
                let result = await this.ipfs.swarm.connect('/dns4/ipfs.menlo.one/tcp/4002/wss/ipfs/QmQP5wZGuFEF5Vxb6UmvwKuS9DVNCGz975aRXVLFHK1z3s')
                console.log('Remote IPFS connected! ', result)
                this.connectedToPeer = true
            })
        } catch (e) {
            console.error('IPFS Connection Error', e)
            throw (e)
        }
    }

    isOnline() {
        return this.ipfs.isOnline() && this.connectedToPeer
    }
}

export default JavascriptIPFSStorage
