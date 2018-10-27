var OldTopics   = artifacts.require("menlo-token/OldTopics.sol");
var MenloTopics = artifacts.require("menlo-token/MenloTopics.sol");

module.exports = function() {
    go()
}

async function go() {

    try {
        let oldTopics = await OldTopics.at(OldTopics.address)
        let topics    = await MenloTopics.at(MenloTopics.address)

        console.log('Reading old topics')
        oldTopics.NewTopicEvent({}, {fromBlock: 0}).watch((error, result) => {
            if (error) {
                console.error('Got error watching Topics ', error)
            }

            const forum = result.args._forum

            console.log('Found forum @ ', forum)
        })

        process.exit()
    } catch (e) {
        throw(e)
    }
}
