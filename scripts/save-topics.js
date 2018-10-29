const readline = require('readline');
const fs = require('fs');

var OldTopics   = artifacts.require("./MenloTopics.sol");
var MenloTopics = artifacts.require("./NewTopics.sol");

module.exports = function() {
    go()
}

async function go() {
    const FILENAME = 'topics.out'

    fs.writeFileSync(FILENAME, '', (err) => {
        if (err) throw err;
    });

    try {
        let oldTopics = await OldTopics.at(OldTopics.address)
      //  let topics    = await MenloTopics.at(MenloTopics.address)

        console.log('Reading old topics')

        let cost = (await oldTopics.topicCost()).toNumber() / 10 ** 18
        console.log('Topics @ ', OldTopics.address)
        console.log('Cost: ', cost)

        oldTopics.NewTopic({}, { fromBlock: 0 }).watch(async (error, result) => {
            if (error) {
                console.error('Got error watching Topics ', error)
            }

            const forum = result.args._forum
            console.log('Found forum @ ', forum)

            const m = await oldTopics.forums(forum)
            const topicHash = m[0]
            console.log('            H ', topicHash)

            fs.appendFileSync(FILENAME, `${forum},${topicHash}\n`, (err) => {
                if (err) throw err;
            });
        })

    } catch (e) {
        throw(e)
    }
}
