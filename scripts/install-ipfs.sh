#!/bin/bash

echo "Installing IPFS"
brew install ipfs
echo "Initializng IPFS"
ipfs init

echo "Configuring IPFS"
ipfs config --json Addresses.Swarm "[\"/ip4/0.0.0.0/tcp/4001\",\"/ip6/::/tcp/4001\",\"/ip4/127.0.0.1/tcp/9999/ws\"]"
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"*\"]"
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"

echo "IPFS setup"
