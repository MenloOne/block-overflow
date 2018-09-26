/*
    Copyright 2018 Menlo, Inc.

    Licensed under the Apache License, Version 2.0 (the “License”);
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an “AS IS” BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
pragma solidity^0.4.24;

import "menlo-token/contracts/MenloToken.sol";
import "./MenloForum.sol";
import "./BytesDecode.sol";
import "./Redeemer.sol";


contract MenloTopicEvents {
    // the total ordering of all events on a smart contract is defined
    // a parent of 0x0 indicates root topic
    // by convention, the bytes32 is a keccak-256 content hash
    // the multihash prefix for this is 1b,20
    event Topic(bytes32 _topicHash, MenloForum _forum);
}


contract MenloTopics is MenloTokenReceiver, MenloTopicEvents, BytesDecode, Ownable, CanReclaimToken {

    uint public constant ACTION_NEWTOPIC = 1;

    MenloToken public token;
    uint256 public topicCost;

    mapping(address => string) public alias;
    mapping(address => uint256) public reputation;
    mapping(address => bool) public forums;

    constructor(MenloToken _token, uint256 _topicCost) public {
        token = _token;
        topicCost = _topicCost;
    }

    function setAlias(string _alias) public {
        alias[msg.sender] = _alias;
    }

    modifier isForum() {
        require(forums[msg.sender] == true);
        _;
    }

    function addReputation(address _user, uint _rep) public isForum {
        reputation[_user] += _rep;
    }

    function usesONE(uint256 _value, uint256 _cost) internal pure returns (bool) {
        return (_cost <= _value);
    }

    function createForum(address _from, bytes32 _topicHash, uint256 _bounty, uint256 _length) private {
        MenloForum forum = new MenloForum( token, _from, _topicHash, 5 * 10**18 /*postCost*/, 0 /*voteCost*/, _length);
        forums[forum] = true;
        token.transfer(forum, _bounty);
        emit Topic( _topicHash, forum);
    }

    function onTokenReceived(
        address _from,
        uint256 _value,
        uint256 _action,
        bytes _data
    ) public onlyTokenContract returns(bytes4) {
        uint i;

        if (_action == ACTION_NEWTOPIC) {
            require(usesONE(_value, topicCost), "New topic tokens sent < cost");

            bytes32 topicHash;
            uint256 length;

            (topicHash, i) = decodeBytes32(_data, 1);
            (length, i)    = decodeUint(_data, i);

            createForum(_from, topicHash, _value, length);
            return ONE_RECEIVED;
        }

        return 0;
    }
}