let dotenv = require('dotenv')
const fs = require('fs');

const envFile = './chain/root.acct.env';
var env = dotenv.config({path: envFile})
if (!env.error) {
  var env = env.parsed;
  let menlo_root = env.MENLO_ROOT

  if (menlo_root) {
    console.log('MENLO_ROOT already defined in ' + envFile)
    return;
  }
}

let Web3 = require('web3')

console.log('Creating root account')

let provider = new Web3.providers.HttpProvider("http://localhost:8545")
let web3 = new Web3(provider)

let root = web3.eth.accounts.create();

fs.appendFileSync(envFile,
  'MENLO_ROOT=' + root.address
)

fs.writeFileSync('./chain/root.json', JSON.stringify(root) + '\n')

console.log('The following accounts have been added to ' + envFile);
console.log("MENLO_ROOT=" + root.address)

process.exit()
