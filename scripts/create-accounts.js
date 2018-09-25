let dotenv = require('dotenv')
const fs = require('fs');

let chain = process.argv[2]
if (!chain) {
  console.log('Usage:  node create-accounts.js <chain>\n' +
              '\n' +
              '       chain: [develop,ropsten,kovan]');
  return;
}

const envFile = './chain/' + chain + '.env';
var env = dotenv.config({path: envFile})
if (env.error) {
  console.log('Error reading ' + envFile)
  return;
}

var env = env.parsed;
let menlo_root = env.MENLO_ROOT

if (!menlo_root) {
  console.log('No MENLO_ROOT defined in ' + envFile)
  return;
}

let Web3 = require('web3')

console.log('Creating accounts from ' + menlo_root)

let provider = new Web3.providers.HttpProvider("http://localhost:8545")
let web3 = new Web3(provider)

console.log("Creating tenent accounts...")

let trustee1 = web3.eth.accounts.create();
let trustee2 = web3.eth.accounts.create();
let trustee3 = web3.eth.accounts.create();

fs.appendFileSync(envFile,
  'MENLO_TENET_1=' + trustee1.address + '\n' +
  'MENLO_TENET_2=' + trustee2.address + '\n' +
  'MENLO_TENET_3=' + trustee3.address + '\n'
)

fs.writeFileSync('./chain/' + 'tenet.1.json', JSON.stringify(trustee1) + '\n')
fs.writeFileSync('./chain/' + 'tenet.2.json', JSON.stringify(trustee2) + '\n')
fs.writeFileSync('./chain/' + 'tenet.3.json', JSON.stringify(trustee3) + '\n')

console.log('The following accounts have been added to ' + envFile);


console.log("MENLO_TENET_1=" + trustee1.address)
console.log("MENLO_TENET_2=" + trustee2.address)
console.log("MENLO_TENET_3=" + trustee3.address)

process.exit()
