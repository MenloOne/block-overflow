var MenloToken = artifacts.require("menlo-token/MenloToken.sol");
var MenloFaucet = artifacts.require("./MenloFaucet.sol");

module.exports = function() {
    go()
}

async function go() {

    try {
        let token = await MenloToken.at(MenloToken.address)
        let menloFaucet = await MenloFaucet.at(MenloFaucet.address)

        console.log('Transfer partner tokens to faucet')
        await token.transfer(menloFaucet.address, 100000 * 10**18, { from : '0xe8234bb4573775ecad0cd2a7fced591b4312b116' }) // Give partner wallet tokens

        process.exit()
    } catch (e) {
        throw(e)
    }
}
