/*
 * Copyright 2018 Vulcanize, Inc.
 * Copyright 2018 Menlo One, Inc.
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
import CID from 'cids'



export class SolidityHash extends String {}


export const SolidityHashZero : SolidityHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const CIDZero : CID = '0'


export function cidToSolidityHash(cid : CID) : SolidityHash {
    if (cid === CIDZero) {
        return SolidityHashZero
    }

    const _cid = new CID(cid)
    const _multihash = _cid.multihash
    const _hex = `0x${multihash.decode(_multihash).digest.toString('hex')}`
    return _hex
}


export function solidityHashToCid(_hash : SolidityHash) : CID {
    if (_hash === SolidityHashZero) {
        return CIDZero
    }

    let hash = _hash
    if (hash.length === 66) {
        hash = hash.slice(2, 66)
    }

    const encodedHash = multihash.encode(multihash.fromHexString(hash), 'sha2-256')
    const _cid = new CID(0, 'dag-pb', encodedHash)
    const cid = _cid.toBaseEncodedString()
    return cid
}



export default {
    solidityHashToCid,
    cidToSolidityHash
}
