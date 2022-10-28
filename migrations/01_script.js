const voting = artifacts.require("Voting.sol");

module.exports = (deployer) => {
  deployer.deploy(voting);
};
