var MenloToken = artifacts.require("menlo-token/MenloToken.sol");
var MenloForum = artifacts.require("./MenloForum.sol");

module.exports = (deployer, network) => {
  return deployer.deploy(MenloForum, MenloToken.address, 5 * 10**18 /* 5 Votes to post */, 0 * 10**18 /* 0 Tokens for voting */, 3 * 60 /* 15 mins */);
}
