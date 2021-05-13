const ubeAddr = "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC";
const celoProxyAddr = "0x471EcE3750Da237f93B8E339c536989b8978a438";
const poolManagerAddr = "0x9Ee3600543eCcc85020D6bc77EB553d1747a65D2";

task("ube", "Work with UBE token")
  // .addParam("contract", "The address of the contract that requires LINK")
  // .addOptionalParam("ubeaddress", "Set the UBE token address")
  .setAction(async (taskArgs) => {
    const signer = await ethers.getSigner();
    const ubeToken = await ethers.getContractAt("UbeToken", ubeAddr);
    let ubeBalance = await ubeToken.balanceOf(signer.address);
    console.log(ethers.utils.formatEther(ubeBalance), "UBE");

    const celoTokenProxy = await ethers.getContractAt(
      "contracts/celo-contracts/common/Proxy.sol:Proxy",
      celoProxyAddr
    );
    const celoAddr = await celoTokenProxy._getImplementation();
    const celoTokenOrig = await ethers.getContractAt("GoldToken", celoAddr);
    const celoToken = celoTokenOrig.attach(celoTokenProxy.address);
    let celoBalance = await celoToken.balanceOf(signer.address);
    console.log(ethers.utils.formatEther(celoBalance), "CELO");

    const router = await ethers.getContractAt(
      "IUniswapV2Router02",
      "0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121"
    );
    const ubeCeloAddr = await router.pairFor(
      ubeToken.address,
      celoToken.address
    );
    const ubeCeloLpToken = await ethers.getContractAt(
      "IUniswapV2Pair",
      ubeCeloAddr
    );

    // STAKING

    const poolManager = await ethers.getContractAt(
      "PoolManager",
      "0x9Ee3600543eCcc85020D6bc77EB553d1747a65D2"
    );

    const poolInfo = await poolManager.pools(ubeCeloAddr);

    const ubeCeloPool = await ethers.getContractAt(
      "IStakingRewards",
      poolInfo.poolAddress
    );
    // ube-celo pool address: 0x295D6f96081fEB1569d9Ce005F7f2710042ec6a1

    console.log(
      ethers.utils.formatEther(await ubeCeloPool.balanceOf(signer.address)),
      "Staked UBE-CELO LP\n",
      ethers.utils.formatEther(await ubeCeloPool.earned(signer.address)),
      "tokens earned"
    );

    // claim UBE reward
    let tx = await ubeCeloPool.populateTransaction.getReward();
    let receipt = await (await celo.wallet.sendTransaction(tx)).wait();
    console.log("Claim UBE", receipt.transactionHash);

    // Swap UBE for Celo
    ubeBalance = await ubeToken.balanceOf(signer.address);
    tx = await router.populateTransaction.swapExactTokensForTokens(
      ubeBalance.shr(1),
      0,
      [ubeAddr, celoProxyAddr],
      signer.address,
      Date.now() + 1000 * 60
    );
    receipt = await (await celo.wallet.sendTransaction(tx)).wait();
    console.log("Swap ube -> celo", receipt.transactionHash);

    // display balances
    ubeBalance = await ubeToken.balanceOf(signer.address);
    celoBalance = await celoToken.balanceOf(signer.address);
    console.log(
      ethers.utils.formatEther(ubeBalance),
      "UBE",
      ethers.utils.formatEther(celoBalance),
      "CELO"
    );

    let farmingTries = 0;
    let farmComplete = false;
    while (!farmComplete) {
      farmingTries += 1;
      // how much token to deposit
      ubeBalance = await ubeToken.balanceOf(signer.address);
      let amounts = await router.getAmountsOut(ubeBalance, [
        ubeAddr,
        celoProxyAddr,
      ]);
      let celoAmount = amounts[1];

      // add liquidity, get LP token
      tx = await router.populateTransaction.addLiquidity(
        ubeAddr,
        celoProxyAddr,
        ubeBalance,
        celoAmount,
        0,
        0,
        signer.address,
        Date.now() + 1000 * 60
      );
      try {
        receipt = await (await celo.wallet.sendTransaction(tx)).wait();
        farmComplete = true;
      } catch (e) {
        if (farmingTries >= 5) throw e;
        console.log(e);
      }
    }
    console.log("Add liquidity:", receipt.transactionHash);

    // deposit LP token into farming contract
    let lpTokenBalance = await ubeCeloLpToken.balanceOf(signer.address);
    tx = await ubeCeloPool.populateTransaction.stake(lpTokenBalance);
    receipt = await (await celo.wallet.sendTransaction(tx)).wait();
    console.log("Farm:", receipt.transactionHash);
  });

module.exports = {};
