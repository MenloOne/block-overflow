# Menlo One Block-Overflow
## Discussion site built on the Townhall Layer

Expo is the first application built on top of the Townhall technology.  It uses the 
publicly deployed Menlo One Token as the utility token with which to post messages
and win lottery rewards for contributing the most upvoted content.

To use BlockOverflow on the Kovan Test Network, visit the site curerntly running here: [https://expo.menlo.one](https://expo.menlo.one)
which includes a Menlo One Kovan Faucet for those who don't have Menlo ONE tokens.
 
Menlo One is about to have a Public Token Sale.  Find out more here:

#[https://www.menlo.one/](https://www.menlo.one/)


#For Developers:
## Local "Develop" Environment

To develop and run Expo locally, install the following prerequisites and
dependencies before running the app.

### Prerequisites

#### Brew

We assume `brew` for package management to install `IPFS` and other dependencies:

    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

#### IPFS

TownHall uses [IPFS](https://ipfs.io/) for storage of messages.

Menlo specific setup of IPFS can be installed and configured via:

        ./scripts/install-ipfs.sh

#### Metamask

Metamask should be used for interacting with the town hall dApp.

Install Metamask extensions into your browser of choice, Chrome or Brave supported: [http://metamask.io](http://metamask.io)


### Install app and dependencies

1. Install nvm and node: `brew install nvm && nvm install`
2. Clone the repo: `git clone git@github.com:MenloOne/expo-demo.git`
3. Install dependencies: `cd expo-demo && nvm use && yarn install`

### Run the application

Run a local dev blockchain in a separate window:

```truffle develop```

Run IPFS daemon in a separate window: 

```ipfs daemon```

Deploy the contracts: 

```truffle deploy --network develop --reset```

Run the app: 

```yarn start```

### Interact with Metamask

Import this private key into MetaMask for use with `truffle develop`:

        388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418

![MetaMask Import](https://www.dropbox.com/s/aqmmv5xk67haqwn/import-account.png?raw=1)

If you see in the Chrome Console Metamask RPC Errors - it means your contract deploys didn't work.

### Interact with Expo

A browser window should open after starting: `http://localhost:3000/`

Ensure you are logged into MetaMask and switch to your imported account.

Add a Custom RPC in MetaMask with URL `http://127.0.0.1:9545/`:

![MetaMaskNetwork](https://www.dropbox.com/s/gtjut6mz97owleo/MetaMaskNetwork.png?raw=1)



# Using other Environments

If for some reason Truffle doesn't work for you or you want a different environment the first thing you will
need is to fill out the `.env` file with the following accounts that you create in your chain.  For Ganache, 
you can just copy some of the precreated accounts:


    - MENLO_ROOT: Address of pre-configured account on chain.

Menlo Root should be the first created account w/ some ETH which we can then use to
create the accounts below on chains such as Parity.
     
    - MENLO_TENET_1: Address for first tenet account.
    - MENLO_TENET_2: Address for second tenet account.
    - MENLO_TENET_3: Address for third tenet account.
    - MENLO_ROOT: Address for the account used to interact with town hall.



### Getting ETH

To get ETH in your account once on Ropsten, go to the [Ropsten ETH Faucet](http://faucet.ropsten.be:3001/)

### Running with Kovan contracts

`yarn start kovan`



### To deploy Kovan contracts


1. Install Parity `brew install parity`
2. Run Parity `parity --geth --chain kovan`
3. Install and Run Parity UI
4. Create a Root Parity Account in Parity UI and get ETH 
5. Create a new `chain/kovan.env` file and paste the Root Parity Account in it:
 
    `MENLO_ROOT=0x004ccE088463Eb2DC7ab23952d5744410000000`

6. Create Kovan accounts for use in contracts.  

     `node scripts/create-accounts kovan` 

7. Deploy the contracts

      `truffle deploy --network kovan`
      
      

#### Ganache

For a light, easy to use private chain with a visual and cli interface,
try [Ganache](http://truffleframework.com/ganache/).

You can deploy and test using network ganache:

    truffle deploy --network ganache

**Note**: Ganache and truffle develop are transitory. Once you shut them down,
you will have to redeploy the contracts and redo any needed transactions.

## Integration

For a persistent local testing environment to test before deploying to
testnet or mainnet, use a Dev chain with Parity or Geth.


### Parity

To run a private dev chain with Parity, first run a dev chain, setup Menlo accounts, and
then deploy contracts.

#### Install Parity

Installing Parity:

        brew install parity


### Testing

For testing the TownHall dapp:

      yarn test

For testing the town hall contracts:

      dapp update
      dapp test

### Deployment

Set the following environment variables:

          1. MENLO_DEPLOYMENT_KEY:
          2. MENLO_DEPLOYMENT_SERVER:

Deploy to server using `shipit`:

      node scripts/shipit staging deploy


