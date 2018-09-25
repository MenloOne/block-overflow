module.exports = () => {
    const config = {}
    const cliArgs = ['network']

    for (let i = 0; i < cliArgs.length; i++) {
        for (let j = 0; j < process.argv.length; j++) {
            if (process.argv[j].substr(2) == cliArgs[i]) {
                config[cliArgs[i]] = process.argv[j+1]
            }
        }
    }

    const network = config['network']
    let dotEnv = './network/' + network + '.out.env'

    console.log('Config: ', dotEnv)
    require('dotenv').config({ path: dotEnv })
}
