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

## Testnet

### Kovan

#### Installing an IPFS box on AWS

* Launch an EC2 box with Ubuntu
* Setup security groups appropriately

You can follow the [IPFS AWS Tutorial](https://medium.com/textileio/tutorial-setting-up-an-ipfs-peer-part-i-de48239d82e0)


##### Install Golang and IPFS

```sudo yum update -y
   sudo yum install -y golang
   
   wget https://dist.ipfs.io/go-ipfs/v0.4.15/go-ipfs_v0.4.15_linux-amd64.tar.gz
   tar -xvf go-ipfs_v0.4.15_linux-amd64.tar.gz
```
   
##### Move executable to your bin path

```
sudo mv go-ipfs/ipfs /usr/local/bin
rm -rf go-ipfs
``` 

#### Run IPFS daemon on start

```
sudo vi /etc/systemd/system/ipfs.service
```

#### Initialize IPFS 

```
echo 'export IPFS_PATH=/data/ipfs' >>~/.bash_profile
source ~/.bash_profile
sudo mkdir -p $IPFS_PATH
sudo chown ubuntu:ubuntu $IPFS_PATH
ipfs init -p server
```


#### Configure IPFS Limits & CORS

```
ipfs config Datastore.StorageMax 20GB
ipfs config Addresses.API /ip4/127.0.0.1/tcp/5001
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
ipfs config --json Addresses.Swarm '["/ip4/0.0.0.0/tcp/4001", "/ip4/0.0.0.0/tcp/8081/ws", "/ip6/::/tcp/4001"]' 
ipfs config --bool Swarm.EnableRelayHop true
```

#### To surface the gateway over HTTP

``` 
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
```

#### Copy and paste unit file definition

``` 
sudo bash -c 'cat >/lib/systemd/system/ipfs.service <<EOL
[Unit]
Description=ipfs daemon
[Service]
ExecStart=/usr/local/bin/ipfs daemon --enable-gc
Restart=always
User=ubuntu
Group=ubuntu
Environment="IPFS_PATH=/data/ipfs"
[Install]
WantedBy=multi-user.target
EOL'
```

   
#### Start IPFS

```
sudo systemctl daemon-reload
sudo systemctl enable ipfs
sudo systemctl start ipfs.service
```

You can now reboot your instance and make sure IPFS is running by:

```
sudo systemctl restart ipfs
sudo systemctl status ipfs
```

#### Get Certbot to get an SSL Cert

From [https://certbot.eff.org/](https://certbot.eff.org/)

```
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx
```

#### Use CertBot to get your SSL

First point ipfs.menlo.one (or your domain) to your AWS box.  Then:

```
sudo certbot --nginx -d ipfs.menlo.one
```

#### Setup automatic SSL renewals

``` 
sudo bash -c 'cat >/etc/console-setup/renew-cert <<EOL
#!/bin/bash
certbot renew --noninteractive
EOL'
sudo chmod +x /etc/console-setup/renew-cert
```

#### Configure NGINGX

```
sudo bash -c 'cat >/etc/nginx/sites-available/default <<EOL 
server {
    server_name ipfs.menlo.one;
    listen [::]:4002 ssl ipv6only=on;
    listen 4002 ssl;
    ssl_certificate /etc/letsencrypt/live/ipfs.menlo.one/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/ipfs.menlo.one/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
server {
    server_name ipfs.menlo.one; # managed by Certbot
    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/ipfs.menlo.one/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/ipfs.menlo.one/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
server {
    if (\$host = ipfs.menlo.one) {
        return 301 https://\$host\$request_uri;
    } # managed by Certbot
    listen 80 ;
    listen [::]:80 ;
    server_name ipfs.menlo.one;
    return 404; # managed by Certbot
}
EOL'
```

#### Test CORS

You can test this config by doing:

``` 
curl -H "Origin: http://expo.menlo.com" \
-H "Access-Control-Request-Method: POST" \
-H "Access-Control-Request-Headers: X-Requested-With" \
--verbose \
http://0.0.0.0:5001/api/v0/swarm/peers; echo
```

#### Restart NGINX

``` 
sudo systemctl restart nginx
```


## Embark as a tool

### Install on MacOS

```
brew tap ethereum/ethereum
brew install ethereum
```


