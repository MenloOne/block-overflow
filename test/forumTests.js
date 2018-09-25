'use strict';

var MenloToken = artifacts.require('menlo-token/contracts/MenloToken.sol');
var Receiver = artifacts.require('contracts/MenloForum.sol');

const assertFail = require("./helpers/assertFail");
const ethFormat = require('./helpers/ethFormat');

const DECIMALS = 18;
const PRESALE_TOKENS = 50000000;


contract('Forum tests', async function ([miner, owner, investor, investor2, wallet, whitelister, growth, team, advisor, partner]) {

    let tokenDeployed;
    let forumDeployed;
    let me;

    beforeEach(async function () {
        tokenDeployed = await MenloToken.deployed()
        me = await tokenDeployed.owner.call();

        forumDeployed = await Forum.new(tokenDeployed.address);
    });

    describe('Use transferAndCall', async function () {

        it('owner has tokens', async function () {
            const tokens = await tokenDeployed.balanceOf(me);

            assert(tokens.toNumber() > 0, 'contract owner has tokens');
        })

        it('owner can transfer tokens', async function () {
            const tokens = await tokenDeployed.balanceOf(me);

            await tokenDeployed.transfer(investor, 20);
            const tokensNew = await tokenDeployed.balanceOf(me);

            assert.equal(tokens.sub(tokensNew).toNumber(), 20, 'contract owner has tokens');
        })

        it('can post message', async function () {
            const parentHash = '0x0'
            const hash = '0xd730f68febcd55fb8c680e394ae41f853256c7a656ed45eaf6bb2fb62e9d4a9e'

            let tokens = await forumDeployed.postCost.call()
            let result = await tokenDeployed.transferAndCall(forumDeployed.address, tokens, 1, [parentHash, hash])

            assert.equal(true, false, "Posted message");
        })
    })
});
