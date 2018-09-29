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

import multihash from 'multihashes'
import multihashing from 'multihashing-async'
import CID from 'cids'
import ipldDagCbor from 'ipld-dag-cbor'
import waterfall from 'async/waterfall'

let thisExport = {}

thisExport.cidToSolidityHash = (cid) => {
    if (cid === '0x0') {
        return '0x0000000000000000000000000000000000000000000000000000000000000000'
    }

    let _cid = new CID(cid)
    let _multihash = _cid.multihash
    let _hex = '0x' + multihash.decode(_multihash).digest.toString('hex')
    return _hex
}

thisExport.solidityHashToCid = (_hash) => {
    if (_hash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return '0x0'
    }

    let hash = _hash
    if (hash.length === 66) {
        hash = hash.slice(2, 66)
    }

    let encodedHash = multihash.encode(multihash.fromHexString(hash), 'sha2-256')
    let _cid = new CID(0, 'dag-pb', encodedHash)
    let cid = _cid.toBaseEncodedString()
    return cid
}

thisExport.nodeToCID = (node, callback) => {
    return waterfall([
        (cb) => ipldDagCbor.util.serialize(node, cb),
        (serialized, cb) => multihashing(serialized, 'keccak-256', cb),
        (mh, cb) => cb(null, new CID(1, 'dag-cbor', mh))
    ], callback)
}

export default thisExport
