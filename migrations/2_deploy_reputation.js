var MenloToken = artifacts.require("MenloToken.sol");
var MenloTopics = artifacts.require("./MenloTopics.sol");

module.exports = (deployer, network) => {

    const asyncDeploy = async () => {
        try {
            console.log('Deploying topics')
            await deployer.deploy(MenloTopics, MenloToken.address, 10 * 10**18);
        } catch (e) {
            throw(e)
        }
    }

    deployer.then(async () => await asyncDeploy())
}
