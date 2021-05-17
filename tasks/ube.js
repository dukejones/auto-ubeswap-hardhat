const { farmCelo } = require("../src/ube-farm.js");

task("ube", "Work with UBE token")
  // .addParam("contract", "The address of the contract that requires LINK")
  // .addOptionalParam("ubeaddress", "Set the UBE token address")
  .setAction(async (taskArgs) => {
    await farmCelo(ethers);
  });

module.exports = {};
