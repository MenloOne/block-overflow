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
import "./BytesDecode.sol";
import "./Redeemer.sol";


contract MenloForumEvents {
    // the total ordering of all events on a smart contract is defined
    // a parent of 0x0 indicates root topic
    // by convention, the bytes32 is a keccak-256 content hash
    // the multihash prefix for this is 1b,20
    event Answer(bytes32 _parentHash, bytes32 contentHash);
    event Payout(address _user, uint256 _tokens);
    event Vote(uint256 _offset);
}


contract MenloForum is MenloTokenReceiver, MenloForumEvents, BytesDecode, Ownable, CanReclaimToken {

    uint public constant ACTION_POST     = 1;
    uint public constant ACTION_UPVOTE   = 2;
    uint public constant ACTION_DOWNVOTE = 3;

    bytes32 public topicHash;
    address public author;
    uint256 public voteCost;
    uint256 public postCost;

    uint256 public endTimestamp;
    uint256 public epochLength;

    mapping(uint256 => int256) public votes;
    mapping(uint256 => mapping(address => int8)) public voters;
    address[] public posters;
    address public winner;

    constructor(MenloToken _token, address _author, bytes32 _topicHash, uint256 _postCost, uint256 _voteCost, uint256 _epochLength) public MenloTokenReceiver(_token) {

        // Push 0 so empty memory (0) doesn't overlap with a voter
        posters.push(0);
        emit Answer(0, 0);

        // no author for root post 0
        author = _author;
        topicHash = _topicHash;
        voteCost = _voteCost;
        postCost = _postCost;
        epochLength = _epochLength;
        endTimestamp = now + epochLength;
    }

    function getVoters(uint256 i, address user) public view returns (int8) {
        return voters[i][user];
    }

    function postCount() public view returns (uint256) {
        return posters.length;
    }

    function votesCount() public view returns (uint256) {
        return posters.length;
    }

    function closeForum() public returns (bool) {
        if (now < endTimestamp) {
            return false;
        }

        if (winner != 0x0) {
            return true;
        }

        uint256 winnerPoster;
        int256  maxVotes;

        for(uint256 i = 1; i < posters.length; i++) {
            if (votes[i] == 0) {
                continue;
            }

            int256 current = votes[i];
            if (current > maxVotes) {
                maxVotes = current;
            }
        }

        if (winnerPoster != 0) {
            endTimestamp = now + epochLength;
            return false;
        }

        winner = posters[winnerPoster];
        return true;
    }

    function rewardPool() public view returns (uint256) {
        return token.balanceOf(this);
    }

    function claim() external {
        require(closeForum(), "Forum not closed");
        require(msg.sender == winner, "Only winner can claim");

        uint256 total = rewardPool();
        require(total > 0, "No tokens left to claim");

        token.transfer(msg.sender, total);
        emit Payout(msg.sender, total);
    }

    function vote(address _voter, uint256 _offset, int8 _direction) internal {
        int8 priorVote = voters[_offset][_voter];

        require (priorVote != _direction, "Can't vote for same comment more than 1 time");

        votes[_offset] += _direction;
        voters[_offset][_voter] = priorVote + _direction;
        endTimestamp = now + epochLength;

        emit Vote(_offset);
    }

    function pushPoster(address _poster) internal {
        posters.push(_poster);
    }

    function upvoteAndComment(address _voter, uint256 _offset, bytes32 _parentHash, bytes32 _contentHash) internal {
        vote(_voter, _offset, 1);
        if (_contentHash != 0) {
            post(_voter, _parentHash, _contentHash);
        }
    }

    function downvoteAndComment(address _voter, uint256 _offset, bytes32 _parentHash, bytes32 _contentHash) internal {
        vote(_voter, _offset, -1);
        if (_contentHash != 0) {
            post(_voter, _parentHash, _contentHash);
        }
    }

    function post(address _poster, bytes32 _parentHash, bytes32 _contentHash) internal {
        emit Answer(_parentHash, _contentHash);
        voters[posters.length][_poster] = 1;
        pushPoster(_poster);
        endTimestamp = now + epochLength;
    }

    modifier forumOpen() {
        require(closeForum(), "Forum is closed");
        _;
    }

    function usesONE(uint256 _value, uint256 _cost) internal pure returns (bool) {
        return (_cost == _value);
    }

    function onTokenReceived(
        address _from,
        uint256 _value,
        uint256 _action,
        bytes _data
    ) public onlyTokenContract forumOpen returns(bytes4) {

        uint offset;
        uint i;

        if (_action == ACTION_UPVOTE) {
            require(usesONE(_value, voteCost), "Voting tokens sent != cost");

            (offset, i)      = decodeUint(_data, 1);
            (parentHash, i)  = decodeBytes32(_data, i);
            (contentHash, i) = decodeBytes32(_data, i);

            upvoteAndComment(_from, offset, parentHash, contentHash);
            return ONE_RECEIVED;
        }

        if (_action == ACTION_DOWNVOTE) {
            require(usesONE(_value, voteCost), "Voting tokens sent != cost");

            (offset, i)      = decodeUint(_data, 1);
            (parentHash, i)  = decodeBytes32(_data, i);
            (contentHash, i) = decodeBytes32(_data, i);

            downvoteAndComment(_from, offset, parentHash, contentHash);
            return ONE_RECEIVED;
        }

        if (_action == ACTION_POST) {
            require(usesONE(_value, postCost), "Posting tokens sent != cost");

            bytes32 parentHash;
            bytes32 contentHash;

            (parentHash, i)  = decodeBytes32(_data, 1);
            (contentHash, i) = decodeBytes32(_data, i);

            post(_from, parentHash, contentHash);
            return ONE_RECEIVED;
        }

        return 0;
    }

    //
    // This exists purely for the case where Menlo ONE tokens need upgrading
    //

    function redeem(Redeemer _redeemer) external onlyOwner returns (MenloToken) {
        require(_redeemer.from() == token);

        token.approve(_redeemer, token.balanceOf(this));
        _redeemer.redeem();
        MenloToken to = _redeemer.to();
        token = to;
        return to;
    }

    function undo(Redeemer _redeemer) external onlyOwner returns (MenloToken) {
        require(_redeemer.to() == token);

        token.approve(_redeemer, token.balanceOf(this));
        _redeemer.undo();
        MenloToken from = _redeemer.from();
        token = from;
        return from;
    }
}
