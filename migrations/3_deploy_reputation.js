var MenloForum = artifacts.require("./MenloForum.sol");
var MenloReputation = artifacts.require("./MenloReputation.sol");

module.exports = (deployer, network) => {

    const asyncDeploy = async () => {
        try {
            console.log('Deploying reputation')
            let menloFaucet = await deployer.deploy(MenloReputation, MenloForum.address);
        } catch (e) {
            throw(e)
        }
    }

    deployer.then(async () => await asyncDeploy())
}
