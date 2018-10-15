pragma solidity ^0.4.23;

import "../../contracts/MenloTopics.sol";

contract MenloTopicsMock is MenloTopics {
  uint256 public timeStamp = block.timestamp;

  constructor(MenloToken _token, uint256 _topicCost) public
    MenloTopics(_token, _topicCost) {
  }

  function setBlockTimestamp(uint256 _timeStamp) public {
    timeStamp = _timeStamp;
  }

  function getBlockTimestamp() internal constant returns (uint256) {
    return timeStamp;
  }
}
