#!/bin/bash

parity --config dev --unlock 0x004ccE088463Eb2DC7ab23952d5744413C60A5e3 --password scripts/parity.passwords --force-ui  --jsonrpc-cors all -lrpc=trace --jsonrpc-apis web3,eth,net,personal,parity,parity_set,traces,rpc,parity_accounts  --no-persistent-txqueue
