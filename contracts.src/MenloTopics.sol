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


import "./MenloForum.sol";


contract MenloTopicEvents {
    event NewTopic(address _forum, bytes32 _topicHash);
    event ClosedTopic(address _forum, uint256 _tokens, int32 _votes, address _winner);
}


contract MenloTopics is MenloTokenReceiver, MenloForumCallback, MenloTopicEvents, BytesDecode, Ownable, CanReclaimToken {
    uint public constant ACTION_NEWTOPIC = 1;

    mapping(address => string)  public alias;
    mapping(address => uint256) public reputation;
    mapping(address => bytes32) public forums;

    uint32  public topicsCount;
    uint256 public topicCost;


    constructor(MenloToken _token, uint256 _topicCost) public MenloTokenReceiver(_token) {
        topicCost = _topicCost;
    }

    function getToken() public view returns (address) {
        return token;
    }

    modifier isForum() {
        require(forums[msg.sender] != 0, "Sender must be forum");
        _;
    }

    function usesONE(uint256 _value, uint256 _cost) internal pure returns (bool) {
        return (_cost <= _value);
    }

    function createForum(address _from, bytes32 _topicHash, uint256 _bounty, uint256 _length) public {
        MenloForum forum = new MenloForum( token, this, _from, _topicHash, _bounty, 5 * 10**18, 0, _length);
        forums[address(forum)] = _topicHash;
        topicsCount += 1;
        token.transfer(address(forum), _bounty);
        emit NewTopic( address(forum), _topicHash );
    }

    function addForum(address _forum, bytes32 _topicHash) public onlyOwner {
        forums[_forum] = _topicHash;
        topicsCount += 1;
        emit NewTopic( _forum, _topicHash );
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

    function onForumClosed(address _forum, uint256 _tokens, int32 _votes, address _winner) public isForum {
        emit ClosedTopic(_forum, _tokens, _votes, _winner);
    }
}