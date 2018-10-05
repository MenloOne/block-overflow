var MenloToken = artifacts.require("menlo-token/MenloToken.sol");
var MenloTopics = artifacts.require("./MenloTopics.sol");

module.exports = (deployer, network) => {

    const asyncDeploy = async () => {
        try {
            console.log('Deploying allTopics')
            await deployer.deploy(MenloTopics, MenloToken.address, 5 * 10 ** 18)

        } catch (e) {
            throw(e)
        }
    }

    deployer.then(async () => await asyncDeploy())
}
