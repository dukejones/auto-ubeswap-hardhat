const ubeAddr = "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC";
const celoProxyAddr = "0x471EcE3750Da237f93B8E339c536989b8978a438";
const poolManagerAddr = "0x9Ee3600543eCcc85020D6bc77EB553d1747a65D2";

task("ube", "Work with UBE token")
  // .addParam("contract", "The address of the contract that requires LINK")
  // .addOptionalParam("ubeaddress", "Set the UBE token address")
  .setAction(async (taskArgs) => {
    const signer = await ethers.getSigner();
    const ubeToken = await ethers.getContractAt("UbeToken", ubeAddr);
    console.log(
      ethers.utils.formatEther(await ubeToken.balanceOf(signer.address)),
      "UBE"
    );

    const celoTokenProxy = await ethers.getContractAt(
      "contracts/celo-contracts/common/Proxy.sol:Proxy",
      celoProxyAddr
    );
    const celoAddr = await celoTokenProxy._getImplementation();
    const celoTokenOrig = await ethers.getContractAt("GoldToken", celoAddr);
    const celoToken = celoTokenOrig.attach(celoTokenProxy.address);
    let celoBalance = await celoToken.balanceOf(signer.address);
    console.log(celoBalance, "CELO");

    const router = await ethers.getContractAt(
      "IUniswapV2Router02",
      "0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121"
    );
    const ubeCeloAddr = await router.pairFor(
      ubeToken.address,
      celoToken.address
    );
    console.log(ubeCeloAddr);

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

    let ubeBalance = await ubeToken.balanceOf(signer.address);
    // function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);

    tx = await router.populateTransaction.swapExactTokensForTokens(
      ubeBalance.shr(1),
      0,
      [ubeAddr, celoProxyAddr],
      signer.address,
      Date.now() + 1000 * 60 * 2
    );
    receipt = await (await celo.wallet.sendTransaction(tx)).wait();
    console.log("Swap ube -> celo", receipt.transactionHash);

    ubeBalance = await ubeToken.balanceOf(signer.address);
    celoBalance = await celoToken.balanceOf(signer.address);
    console.log(
      ethers.utils.formatEther(ubeBalance),
      "UBE",
      ethers.utils.formatEther(celoBalance),
      "CELO"
    );
  });

module.exports = {};
