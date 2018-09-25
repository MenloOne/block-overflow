#!/usr/bin/env bash
solidity_flattener --solc-paths="menlo-token=$(pwd)/node_modules/menlo-token" contracts.src/MenloForum.sol --out contracts/MenloForum.sol
solidity_flattener --solc-paths="menlo-token=$(pwd)/node_modules/menlo-token" contracts.src/MenloFaucet.sol --out contracts/MenloFaucet.sol
solidity_flattener --solc-paths="menlo-token=$(pwd)/node_modules/menlo-token" contracts.src/MenloReputation.sol --out contracts/MenloReputation.sol
