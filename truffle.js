require('babel-polyfill');
const readline = require('readline');
const fs = require('fs')
const path = require('path');

var NonceTrackerSubprovider = require("web3-provider-engine/subproviders/nonce-tracker")

// var HDWalletProvider = require('truffle-hdwallet-provider');
// require('dotenv').config({ path: './.mnemonic.env' })
// const mnemonic = process.env.MNEMONIC

var HDWalletProvider = require('truffle-hdwallet-provider-privkey');

function noncedWallet(wallet) {
    var nonceTracker = new NonceTrackerSubprovider()
    wallet.engine._providers.unshift(nonceTracker)
    nonceTracker.setEngine(wallet.engine)
    return wallet
}

var addresses = []

function readAddresses(network) {

    if (addresses.length > 0) {
        return addresses
    }

    var lines = fs.readFileSync(`./network/${network}.privkeys.csv`, 'utf-8')
        .split('\n')
        .filter(Boolean);

    for (i = 0; i < lines.length; i++) {
        let line = lines[i]
        let items = line.split(',')
        if (items.length != 3) {
            throw Error('Input must be list of:  address,key')
        }
        addresses.push({name: items[0], address: items[1].toLowerCase(), key: items[2].toLowerCase()});
    }

    return addresses
}

function getPrivKeys(network) {
    const keys = readAddresses(network).map((a) => a.key)
    return keys
}


module.exports = {
    contracts_build_directory: path.join(__dirname, 'src/artifacts'),
    networks: {
        live: {
            provider: function() {
                return noncedWallet(new HDWalletProvider(getPrivKeys('live'), 'https://mainnet.infura.io/v3/1b81fcc6e29d459ca28861e0901aba99'))
            },
            network_id: '1',
            gas: 2000000,
            gasPrice: 99000000000,
            from: '0xEADf4eECEdE7E07a1Bb53510CBd1ACE191B2Fd7f'
        },
        kovan: {
            provider: function() {
                return noncedWallet(new HDWalletProvider(getPrivKeys('kovan'), 'https://kovan.infura.io/v3/1b81fcc6e29d459ca28861e0901aba99'))
            },
            network_id: 42,
            gas: 6000000,
            gasPrice: 10000000000
        },
        rinkeby: {
            provider: function() {
                return noncedWallet(new HDWalletProvider(getPrivKeys('rinkeby'), 'https://rinkeby.infura.io/v3/1b81fcc6e29d459ca28861e0901aba99'))
            },
            network_id: 4,
            gas: 6000000,
            gasPrice: 10000000000,
            from: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
        },
        develop: {
            host: '127.0.0.1',
            port: 9545,
            network_id: '*'
        },
        ganache: {
            host: '127.0.0.1',
            port: 8545,
            network_id: '*',
            gas: 6721975
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01
        },
        test: {
            host: "localhost",
            network_id: "*",
            port: 8545,
            gas: 0xfffffffffff,
            gasPrice: 0x01
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};
