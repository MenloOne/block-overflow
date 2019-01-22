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


contract MenloFaucet is Ownable, CanReclaimToken {

    MenloToken token;
    uint256 tokens;
    uint256 delay;
    mapping(address => uint256) public lastDrip;

    constructor(MenloToken _token, uint256 _tokens, uint256 _delay ) public {
        token = _token;
        tokens = _tokens;
        delay = _delay;
    }

    function drip() public returns (bool) {
        if (lastDrip[msg.sender] > 0) {
            require(block.timestamp - lastDrip[msg.sender] > delay, "Not enough time elapsed since last drip");
        }

        lastDrip[msg.sender] = block.timestamp;
        token.transfer(msg.sender, tokens);

        return true;
    }
}