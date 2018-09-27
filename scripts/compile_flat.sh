#!/usr/bin/env bash
solidity_flattener --solc-paths="menlo-token=$(pwd)/node_modules/menlo-token" contracts.src/MenloFaucet.sol --out contracts/MenloFaucet.sol
solidity_flattener --solc-paths="menlo-token=$(pwd)/node_modules/menlo-token" contracts.src/MenloForum.sol --out contracts/MenloForum.sol
solidity_flattener --solc-paths="menlo-token=$(pwd)/node_modules/menlo-token" contracts.src/MenloTopics.sol --out contracts/MenloTopics.sol

truffle compile

./node_modules/.bin/typechain --force --outDir ./src/.contracts ./build/contracts/MenloToken.json
./node_modules/.bin/typechain --force --outDir ./src/.contracts ./build/contracts/MenloForum.json
./node_modules/.bin/typechain --force --outDir ./src/.contracts ./build/contracts/MenloTopics.json