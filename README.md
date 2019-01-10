![Menlo One](https://raw.githubusercontent.com/MenloOne/menlo-one-logos/master/menlo-one-blue-logo-transparent90x90.svg?sanitize=true "")

## Menlo One - Block Overflow
[![](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/MenloOne/temp/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/menlo-token.svg)](https://badge.fury.io/js/menlo-token)

**[Menlo One Home](https://menlo.one)** |
**[Docs](https://menlo.one/docs)** | 
**[Content Node](https://github.com/MenloOne/content-node)** | 
**[Telegram](https://t.me/MenloOne)**

**Menlo One is a framework for rapidly developing decentralized applications (dApps).**

---

### Major components:

1. Block Overflow, this repo, which is a demo "front end" to the application which is designed to get you started. 

2. Content Node, the "back end" of the application which is located here: https://github.com/MenloOne/content-node


## Documentation

You can find the Menlo documentation on [the website](http://www.menlo.one/docs/) or this repo: https://github.com/MenloOne/menlo-one-docs


## Quick Install

```bash
git clone https://github.com/MenloOne/block-overflow.git
cd block-overflow
nvm use 8.11.4
npm install
npm run build
npm run dev
```
## The Block Overflow demo app

Block Overflow is a single page application built in ReactJS. This is similar in many ways to a “traditional” dApp. It makes asynchronous calls to the Content Node as well as interfaces with a Web3 provider (we recommend [MetaMask](https://metamask.io)) for transactions. We built a demo application ([Block Overflow](https://blockoverflow.menlo.one)), a nod to our favorite developer Q&A site, which has a wide variety of features common to many dApp use cases. It has many routes in place for actions such as posting content, upvoting, commenting, etc. The front end comes with Truffle and smart contract specific to the Q&A site use case but is easily customizable. It also comes with many common front end nice-to-haves such as Sass, Material UI, and many interface elements like drop down menus and loading animation. 

**To use Block Overflow, visit [https://blockoverflow.menlo.one](https://blockoverflow.menlo.one).** 


![Block Overflow](https://cdn-images-1.medium.com/max/1000/1*8NGIONEC_UTSsorp_2mpsg.jpeg)

## License
Menlo is [MIT licensed](LICENSE).
