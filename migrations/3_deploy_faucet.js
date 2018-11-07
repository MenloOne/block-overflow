var MenloToken = artifacts.require("menlo-token/MenloToken.sol");
var MenloFaucet = artifacts.require("./MenloFaucet.sol");
var networkEnv = require ('../scripts/networkEnv')


module.exports = (deployer, network) => {

    const asyncDeploy = async () => {
        networkEnv()
        let token = await MenloToken.deployed()

        try {
            console.log('Deploying faucet')
            let menloFaucet = await deployer.deploy(MenloFaucet, MenloToken.address, 1000 * 10**18, 24 * 60 * 60 /* One day */);

            console.log('Transfer partner tokens to faucet from ', process.env.ONE_OWNER)
            await token.transfer(menloFaucet.address, 100000 * 10**18, { from : process.env.ONE_OWNER }) // Give partner wallet tokens
        } catch (e) {
            throw(e)
        }
    }

    if (web3.version.network === 1) {
        console.log('Not deploying faucet in prod')
        return
    }

    deployer.then(async () => await asyncDeploy())
}
