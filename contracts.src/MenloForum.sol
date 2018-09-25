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
    event Topic(bytes32 _parentHash, bytes32 contentHash);
    event Payout(uint256 _lottery, address _user, uint256 _tokens);
    event Vote(uint256 _offset);
}


contract MenloForum is MenloTokenReceiver, MenloForumEvents, BytesDecode, Ownable, CanReclaimToken {

    uint public constant ACTION_POST     = 1;
    uint public constant ACTION_UPVOTE   = 2;
    uint public constant ACTION_DOWNVOTE = 3;


    uint256 public currentLottery;
    uint256 public endTimestamp;
    uint256 public rewardPool;

    uint256 public epochLength;
    uint256 public epochPrior;
    uint256 public epochCurrent;

    mapping(uint256 => int256) public votes;
    mapping(uint256 => mapping(address => int8)) public voters;
    address[] public posters;

    uint256 public voteCost;
    uint256 public postCost;
    uint256 public nextPostCost;

    address[5] public payouts;

    constructor(MenloToken _token, uint256 _postCost, uint256 _voteCost, uint256 _epochLength) public MenloTokenReceiver(_token) {
        // Push 0 so empty memory (0) doesn't overlap with a voter
        posters.push(0);
        emit Topic(0, 0);

        // no author for root post 0
        voteCost = _voteCost;
        postCost = _postCost;
        nextPostCost = _postCost;
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

    function endEpoch(uint256 _tokensForNextEpoch) public returns (bool) {
        if (now < endTimestamp) {
            return false;
        }

        uint256[5] memory winners;
        int256[5]  memory topVotes;
        bool hasVotes = false;

        // get top 5 posts
        for(uint256 i = posters.length; i-- > epochCurrent; ) {
            if (votes[i] == 0) {
                continue;
            }
            hasVotes = true;

            int256 current = votes[i];
            if (current > topVotes[4]) {
                // insert it

                /*
                uint8 j = 4;
                while (topVotes[j-1] < current) {
                    topVotes[j] = topVotes[j-1];
                    winners[j] = winners[j-1];
                    j--;
                    if (j == 0) {
                        break;
                    }
                }
                topVotes[j] = current;
                winners[j] = i;
                */

                // the code below is equivalent to the commented code above
                if (current > topVotes[2]) {
                    topVotes[4] = topVotes[3];
                    topVotes[3] = topVotes[2];
                    winners[4] = winners[3];
                    winners[3] = winners[2];
                    if (current > topVotes[1]) {
                        topVotes[2] = topVotes[1];
                        winners[2] = winners[1];
                        if (current > topVotes[0]) {
                            topVotes[1] = topVotes[0];
                            topVotes[0] = current;
                            winners[1] = winners[0];
                            winners[0] = i;
                        } else {
                            topVotes[1] = current;
                            winners[1] = i;
                        }
                    } else {
                        topVotes[2] = current;
                        winners[2] = i;
                    }
                } else {
                    if (current > topVotes[3]) {
                        topVotes[4] = topVotes[3];
                        topVotes[3] = current;
                        winners[4] = winners[3];
                        winners[3] = i;
                    } else {
                        topVotes[4] = current;
                        winners[4] = i;
                    }
                }
            }

            // votes[i] = 0 Should clean up memory?
        }

        endTimestamp = now + epochLength;

        if (!hasVotes) {
            return false;
        }

        // write the new winners
        for (i = 0; i < 5; i++) {
            payouts[i] = posters[winners[i]];
        }

        // refresh the pool
        rewardPool = token.balanceOf(this) - _tokensForNextEpoch;

        epochPrior = epochCurrent;
        epochCurrent = posters.length;
        currentLottery++;
        if (nextPostCost != postCost) {
            postCost = nextPostCost;
        }

        return true;
    }

    function nextRewardPool() public view returns (uint256) {
        return token.balanceOf(this) - rewardPool;
    }

    function reward(uint8 _payout) public view returns (uint256) {
        if (_payout == 0) {
            return rewardPool * 2 / 5;
        } else if (_payout == 1) {
            return rewardPool / 4;
        } else if (_payout == 2) {
            return rewardPool / 5;
        } else if (_payout == 3) {
            return rewardPool / 10;
        } else if (_payout == 4) {
            return rewardPool / 20;
        }
        return 0;
    }

    function claim() external {
        endEpoch(0);

        if (rewardPool == 0) {
            return;
        }

        uint256 total = 0;
        for (uint8 i = 0; i < 5; i++) {
            if (payouts[i] == msg.sender) {
                uint256 rewardi = reward(i);
                total += rewardi;
                payouts[i] = 0;
            }
        }

        require(total > 0, "No tokens left to claim");

        emit Payout(currentLottery-1, msg.sender, total);
        token.transfer(msg.sender, total);
    }

    function setNextPostCost(uint256 _nextPostCost) external onlyOwner {
        nextPostCost = _nextPostCost;
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

    function upvote(address _voter, uint256 _offset) internal {
        vote(_voter, _offset, 1);
    }

    function downvote(address _voter, uint256 _offset) internal {
        vote(_voter, _offset, -1);
    }

    function post(address _poster, bytes32 _parentHash, bytes32 _contentHash) internal {
        emit Topic(_parentHash, _contentHash);
        voters[posters.length][_poster] = 1;
        pushPoster(_poster);
        endTimestamp = now + epochLength;
    }

    modifier forumOpen() {
        // require(now < endTimestamp);
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

        endEpoch(_value);

        if (_action == ACTION_UPVOTE) {
            require(usesONE(_value, voteCost), "Voting tokens sent != cost");

            (offset, i) = decodeUint(_data, 1);
            upvote(_from, offset);
            return ONE_RECEIVED;
        }

        if (_action == ACTION_DOWNVOTE) {
            require(usesONE(_value, voteCost), "Voting tokens sent != cost");

            (offset, i) = decodeUint(_data, 1);
            downvote(_from, offset);
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
