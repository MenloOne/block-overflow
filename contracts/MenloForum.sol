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

pragma solidity^0.4.13;

import "menlo-token/contracts/MenloToken.sol";
import "./BytesDecode.sol";
import "./Redeemer.sol";


contract MenloForumEvents {
    event Answer(bytes32 _contentHash);
    event Comment(bytes32 _parentHash, bytes32 _contentHash);
    event Payout(address _user, uint256 _tokens);
    event Vote(uint32 _offset, int32 _direction);
}


interface MenloForumCallback {
    function onForumClosed(address _forum, uint256 _tokens, int32 _votes, address _winner) external;
}


contract MenloForum is MenloTokenReceiver, MenloForumEvents, BytesDecode, Ownable, CanReclaimToken {

    uint public constant ACTION_POST     = 1;
    uint public constant ACTION_UPVOTE   = 2;
    uint public constant ACTION_DOWNVOTE = 3;

    MenloForumCallback callback;

    bytes32 public topicHash;
    address public author;
    uint256 public voteCost;
    uint256 public postCost;

    uint256 public endTimestamp;
    uint256 public epochLength;

    mapping(uint32 => int32) public votes;
    mapping(uint32 => mapping(address => int8)) public voters;
    address[] public posters;
    bytes32[] public messages;

    int32   public winningVotes;
    uint32  public winningOffset;
    bool    private closed;
    uint256 public pool;


    constructor(MenloToken _token, MenloForumCallback _callback, address _author, bytes32 _topicHash, uint256 _bounty, uint256 _postCost, uint256 _voteCost, uint256 _epochLength) public MenloTokenReceiver(_token) {

        // Push 0 so empty memory (0) doesn't overlap with a voter
        posters.push(0);
        emit Answer(0);

        // no author for root post 0
        callback = _callback;
        author = _author;
        topicHash = _topicHash;
        voteCost = _voteCost;
        postCost = _postCost;
        epochLength = _epochLength;
        endTimestamp = now + epochLength;
        pool = _bounty;
    }

    function getVoters(uint32 i, address user) public view returns (int8) {
        return voters[i][user];
    }

    function postCount() public view returns (uint256) {
        return posters.length;
    }

    function votesCount() public view returns (uint256) {
        return posters.length;
    }

    function claimed() external view returns (bool) {
        return token.balanceOf(this) == 0 && pool != 0;
    }

    function winner() public view returns (address) {
        if (winningOffset == 0) {
            return author;
        }

        return posters[winningOffset];
    }



    function vote(address _voter, uint32 _offset, int8 _direction) internal {
        int8 priorVote = voters[_offset][_voter];

        require (priorVote != _direction, "Can't vote for same comment more than 1 time");

        votes[_offset] += _direction;
        voters[_offset][_voter] = priorVote + _direction;
        endTimestamp = now + epochLength;

        emit Vote(_offset, _direction);

        if (votes[_offset] > winningVotes) {
            winningVotes = votes[_offset];
            winningOffset = _offset;
            return;
        }

        if (votes[_offset] == winningVotes && _offset < winningOffset) {
            winningVotes = votes[_offset];
            winningOffset = _offset;
            return;
        }
    }

    function pushMessage(bytes32 _message, address _poster) internal {
        messages.push(_message);
        posters.push(_poster);
    }

    function upvoteAndComment(address _voter, uint32 _offset, bytes32 _parentHash, bytes32 _contentHash) internal {
        vote(_voter, _offset, 1);
        if (_contentHash != 0) {
            post(_voter, _parentHash, _contentHash);
        }
    }

    function downvoteAndComment(address _voter, uint32 _offset, bytes32 _parentHash, bytes32 _contentHash) internal {
        vote(_voter, _offset, -1);
        if (_contentHash != 0) {
            post(_voter, _parentHash, _contentHash);
        }
    }

    function post(address _poster, bytes32 _parentHash, bytes32 _contentHash) internal {
        endTimestamp = now + epochLength;

        if (_parentHash != 0) {
            emit Comment(_parentHash, _contentHash);
            return;
        }

        emit Answer(_contentHash);
        voters[uint32(posters.length)][_poster] = 1;
        pushMessage(_contentHash, _poster);
    }

    function closeForum() internal returns (bool) {
        if (closed) {
            return true;
        }

        if (now < endTimestamp) {
            return false;
        }

        if (winner() == author) {
            callback.onForumClosed(this, pool, 0, 0);
        } else {
            callback.onForumClosed(this, pool, winningVotes, winner());
        }

        closed = true;
        return true;
    }

    modifier forumOpen() {
        require(!closeForum(), "Forum is closed");
        _;
    }

    modifier forumClosed() {
        require(closeForum(), "Forum is open");
        _;
    }

    function usesONE(uint256 _value, uint256 _cost) internal pure returns (bool) {
        return (_value >= _cost);
    }

    function claim() forumClosed external {
        require(closeForum(), "Forum not closed");
        require(msg.sender == winner(), "Only winner can claim");
        require(pool > 0, "No tokens left to claim");

        token.transfer(msg.sender, pool);
        emit Payout(msg.sender, pool);
    }

    function onTokenReceived(
        address _from,
        uint256 _value,
        uint256 _action,
        bytes _data
    ) public onlyTokenContract forumOpen returns(bytes4) {

        uint offset;
        uint i;

        pool = token.balanceOf(this);

        if (_action == ACTION_UPVOTE) {
            require(usesONE(_value, voteCost), "Voting tokens sent != cost");

            (offset, i)      = decodeUint(_data, 1);
            (parentHash, i)  = decodeBytes32(_data, i);
            (contentHash, i) = decodeBytes32(_data, i);

            upvoteAndComment(_from, uint32(offset), parentHash, contentHash);
            return ONE_RECEIVED;
        }

        if (_action == ACTION_DOWNVOTE) {
            require(usesONE(_value, voteCost), "Voting tokens sent != cost");

            (offset, i)      = decodeUint(_data, 1);
            (parentHash, i)  = decodeBytes32(_data, i);
            (contentHash, i) = decodeBytes32(_data, i);

            downvoteAndComment(_from, uint32(offset), parentHash, contentHash);
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
