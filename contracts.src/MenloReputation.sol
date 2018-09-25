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


contract MenloReputation is Ownable {

    mapping(address => string) public alias;
    mapping(address => uint256) public reputation;
    mapping(address => bool) public forums;

    constructor(MenloForum _forum) public {
        if (_forum != address(0)) {
            forums[_forum] = true;
        }
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
}