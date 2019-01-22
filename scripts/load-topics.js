const readline = require('readline');
const fs = require('fs');

var MenloTopics = artifacts.require("./NewTopics.sol");

module.exports = function() {
    go()
}

async function go() {
    const FILENAME = 'topics.out'

    try {
        let topics = await MenloTopics.at(MenloTopics.address)
      //  let topics    = await MenloTopics.at(MenloTopics.address)

        console.log('Reading topics')
        console.log('Topics @ ', MenloTopics.address)

        const file  = fs.readFileSync(FILENAME).toString()
        const lines = file.split('\n')

        lines.forEach((forum) => {
            if (forum.length != 66) { return }

            topics.
            console.log('Create Topic @ ', forum)
        })

        process.exit()
    } catch (e) {
        throw(e)
    }
}
