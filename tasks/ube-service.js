const { farmCelo } = require("../src/ube-farm.js");

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

task("ube-service", "Farm UBE on a loop")
  // .addParam("contract", "The address of the contract that requires LINK")
  // .addOptionalParam("ubeaddress", "Set the UBE token address")
  .setAction(async (taskArgs) => {
    async function loop() {
      while (true) {
        console.log("Let's farm!  ", new Date().toISOString());
        try {
          await farmCelo(ethers);
          console.log("Farm run complete.");
          await delay(process.env.INTERVAL_SECONDS * 1000);
        } catch (e) {
          console.log("Exception while farming! Retying in 10 seconds...", e);
          await delay(10000);
        }
      }
    }
    await loop();
  });

module.exports = {};
