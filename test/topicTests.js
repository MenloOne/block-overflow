'use strict';

require('truffle-test-utils').init();

const MenloTopics   = artifacts.require('../contracts/MenloTopics.sol');
const TokenContract = artifacts.require('../node_modules/menlo-token/contracts/MenloToken.sol');

// const assertFail = require("./helpers/assertFail");
// const ethFormat = require('./helpers/ethFormat');



contract('transferAndCall Tests', async function ([miner, owner, investor, investor2, wallet, whitelister, growth, team, advisor, partner]) {

    let tokenDeployed
    let topicsDeployed
    let me

    beforeEach(async function () {
        tokenDeployed = await TokenContract.deployed()
        me = await tokenDeployed.owner.call();

        topicsDeployed = await MenloTopics.deployed()
    });

    describe('Topic tests', async function () {

        it('Topics cost 5', async function () {
            var cost   = await topicsDeployed.topicCost.call();

            assert.equal(cost, 5 * 10**18, "Minimum topic bounty is 5 ONE")
        })

        it('Create new Topic', async function () {
            var cost   = (await topicsDeployed.topicCost.call()).toNumber()
            var action = (await topicsDeployed.ACTION_NEWTOPIC.call()).toNumber()
            const topicsToken = await topicsDeployed.getToken.call()

            assert.equal(topicsToken, tokenDeployed.address, "Topic's token equals deployed token" )

            const result = await tokenDeployed.transferAndCall(topicsDeployed.address, cost, action, ['0xdeadbeef', (30 * 60).toString()]);

            console.log(result.log)
            assert.web3Event(result, { event: 'NewTopic' }, 'NewTopic event is emitted');

            // assert.equal(uintAfter, uint, "write of UInt worked with token payment");
        })

    })
});
