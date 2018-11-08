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


contract BytesDecode {

    function decodeUint(bytes b, uint index) internal pure returns (uint256 result, uint i) {
        uint c = 0;

        require(uint(b[index++]) == 34, "Expected \" for var"); // "

        for (i = index; i < b.length && uint(b[i]) != 34; i++) {
            c = uint(b[i]);
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
        i += 2;
    }

    function decodeAddress(bytes b, uint index) internal pure returns (address result, uint i) {
        uint c = 0;
        uint256 r = 0;

        require(b.length - index > 3, "Expected \"0x for var");
        require(uint(b[index++]) == 34, "Expected \" for var");  // "
        require(uint(b[index++]) == 48, "Expected 0 for var");  // 0
        require(uint(b[index++]) == 120, "Expected x for var"); // x

        for (i = index; i < b.length && uint(b[i]) != 34; i++) {
            c = uint(b[i]);

            if (c >= 48 && c <= 57) {
                r = r * 16 + (c - 48);
            } else
                if (c >= 65 && c <= 70) {
                    r = r * 16 + (c - 65 + 10);
                } else
                    if (c >= 97 && c <= 102) {
                        r = r * 16 + (c - 97 + 10);
                    }
        }
        i += 2;

        result = address(r);
    }

    function decodeBytes32(bytes b, uint index) internal pure returns (bytes32 result, uint i) {
        uint r = 0;
        uint c = 0;
        bytes32 b32;

        require(b.length - index > 3, "Expected \"0x for var");
        require(uint(b[index++]) == 34, "Expected \" for var");  // "
        require(uint(b[index++]) == 48, "Expected 0 for var");  // 0
        require(uint(b[index++]) == 120, "Expected x for var"); // x

        for (i = index; i < b.length && uint(b[i]) != 34; i++) {
            c = uint(b[i]);

            if (c >= 48 && c <= 57) {
                c = c - 48;
            } else
                if (c >= 65 && c <= 70) {
                    c = c - 65 + 10;
                } else
                    if (c >= 97 && c <= 102) {
                        c = c - 97 + 10;
                    }

            require (r <= 63, "byte32 can't be longer than 32 bytes");
            b32 |= bytes32(c & 0xF) << ((63-r++) * 4);
        }
        i += 2;

        result = b32;
    }
}