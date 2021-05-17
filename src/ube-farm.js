const {
  printBalances,
  claimUbeReward,
  swapUbeForCelo,
  addPoolLiquidity,
  depositIntoFarm,
} = require("../src/ube-functions.js");

async function farmCelo(ethers) {
  const ubeAddr = "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC";
  const celoProxyAddr = "0x471EcE3750Da237f93B8E339c536989b8978a438";
  const poolManagerAddr = "0x9Ee3600543eCcc85020D6bc77EB553d1747a65D2";

  const signer = await ethers.getSigner();
  const ubeToken = await ethers.getContractAt("UbeToken", ubeAddr);
  const celoTokenProxy = await ethers.getContractAt(
    "contracts/celo-contracts/common/Proxy.sol:Proxy",
    celoProxyAddr
  );
  const celoAddr = await celoTokenProxy._getImplementation();
  const celoTokenOrig = await ethers.getContractAt("GoldToken", celoAddr);
  const celoToken = celoTokenOrig.attach(celoTokenProxy.address);
  const router = await ethers.getContractAt(
    "IUniswapV2Router02",
    "0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121"
  );
  const ubeCeloAddr = await router.pairFor(ubeToken.address, celoToken.address);
  const ubeCeloLpToken = await ethers.getContractAt(
    "IUniswapV2Pair",
    ubeCeloAddr
  );
  // STAKING
  const poolManager = await ethers.getContractAt(
    "PoolManager",
    poolManagerAddr
  );
  const ubeCeloPoolInfo = await poolManager.pools(ubeCeloAddr);
  // ube-celo pool address: 0x295D6f96081fEB1569d9Ce005F7f2710042ec6a1
  const ubeCeloPool = await ethers.getContractAt(
    "IStakingRewards",
    ubeCeloPoolInfo.poolAddress
  );
  let receipt;

  await printBalances(ubeToken, celoToken, ubeCeloLpToken, ubeCeloPool);

  receipt = await claimUbeReward(ubeCeloPool);
  console.log("Claim UBE ->", receipt.transactionHash);

  receipt = await swapUbeForCelo(router, ubeToken, celoToken);
  console.log("Swap ube -> celo ->", receipt.transactionHash);
  await printBalances(ubeToken, celoToken, ubeCeloLpToken, ubeCeloPool);

  let tries = 0;
  let addLiquidity = false;
  while (!addLiquidity) {
    tries += 1;
    try {
      receipt = await addPoolLiquidity(router, ubeToken, celoToken);
      addLiquidity = true;
    } catch (e) {
      if (tries >= 5) throw e;
      console.log("Error:", e.reason, e.code, e.transactionHash);
    }
  }
  console.log("Add liquidity:", receipt.transactionHash);

  receipt = await depositIntoFarm(ubeCeloPool, ubeCeloLpToken);
  console.log("Farmed UBE-CELO ->", receipt.transactionHash);
  await printBalances(ubeToken, celoToken, ubeCeloLpToken, ubeCeloPool);
}

module.exports = { farmCelo };
