async function printBalances(ubeToken, celoToken, ubeCeloLpToken, ubeCeloPool) {
  const signer = await ethers.getSigner();
  const ubeBalance = await ubeToken.balanceOf(signer.address);
  const celoBalance = await celoToken.balanceOf(signer.address);
  const ubeCeloLpBalance = await ubeCeloLpToken.balanceOf(signer.address);
  const ubeCeloPoolBalance = await ubeCeloPool.balanceOf(signer.address);
  const ubeCeloPoolRewardsBalance = await ubeCeloPool.earned(signer.address);

  console.log(
    "WALLET:",
    ethers.utils.formatEther(ubeBalance),
    "UBE",
    ethers.utils.formatEther(celoBalance),
    "CELO",
    ethers.utils.formatEther(ubeCeloLpBalance),
    "LP"
  );
  console.log(
    "FARM:",
    ethers.utils.formatEther(ubeCeloPoolBalance),
    "Staked LP tokens",
    ethers.utils.formatEther(ubeCeloPoolRewardsBalance),
    "UBE earned"
  );
}

async function claimUbeReward(ubeCeloPool) {
  const tx = await ubeCeloPool.populateTransaction.getReward();
  const receipt = await (await celo.wallet.sendTransaction(tx)).wait();
  return receipt;
}

async function swapUbeForCelo(router, ubeToken, celoToken) {
  const signer = await ethers.getSigner();
  const ubeBalance = await ubeToken.balanceOf(signer.address);
  const tx = await router.populateTransaction.swapExactTokensForTokens(
    ubeBalance.shr(1),
    0,
    [ubeToken.address, celoToken.address],
    signer.address,
    Date.now() + 1000 * 60
  );
  const receipt = await (await celo.wallet.sendTransaction(tx)).wait();
  return receipt;
}

async function addPoolLiquidity(router, ubeToken, celoToken) {
  const signer = await ethers.getSigner();
  const ubeBalance = await ubeToken.balanceOf(signer.address);
  const amounts = await router.getAmountsOut(ubeBalance, [
    ubeToken.address,
    celoToken.address,
  ]);
  const celoAmount = amounts[1];

  // add liquidity, get LP token
  const tx = await router.populateTransaction.addLiquidity(
    ubeToken.address,
    celoToken.address,
    ubeBalance,
    celoAmount,
    0,
    0,
    signer.address,
    Date.now() + 1000 * 60
  );

  const receipt = await (await celo.wallet.sendTransaction(tx)).wait();
  return receipt;
}

async function depositIntoFarm(ubeCeloPool, ubeCeloLpToken) {
  const signer = await ethers.getSigner();
  let lpTokenBalance = await ubeCeloLpToken.balanceOf(signer.address);
  tx = await ubeCeloPool.populateTransaction.stake(lpTokenBalance);
  receipt = await (await celo.wallet.sendTransaction(tx)).wait();
  return receipt;
}

module.exports = {
  printBalances,
  claimUbeReward,
  swapUbeForCelo,
  addPoolLiquidity,
  depositIntoFarm,
};
