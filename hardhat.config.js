/**
 * @type import('hardhat/config').HardhatUserConfig
 */
// require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-truffle5");
// require("@ubeswap/hardhat-celo");
// require("@nomiclabs/hardhat-etherscan");
// require("hardhat-deploy");
require("./tasks/accounts");
require("./tasks/balance");
require("./tasks/ube");

require("dotenv").config();

const CELO_MAINNET_RPC_URL = process.env.FORNO_MAINNET_RPC_URL;

const MAINNET_RPC_URL =
  process.env.MAINNET_RPC_URL ||
  process.env.ALCHEMY_MAINNET_RPC_URL ||
  "https://eth-mainnet.alchemyapi.io/v2/your-api-key";
const RINKEBY_RPC_URL =
  process.env.RINKEBY_RPC_URL ||
  "https://eth-rinkeby.alchemyapi.io/v2/your-api-key";
const KOVAN_RPC_URL =
  process.env.KOVAN_RPC_URL ||
  "https://eth-kovan.alchemyapi.io/v2/your-api-key";
const MNEMONIC = process.env.MNEMONIC || "your mnemonic";
const ETHERSCAN_API_KEY =
  process.env.ETHERSCAN_API_KEY || "Your etherscan API key";
// optional
const PRIVATE_KEY = process.env.PRIVATE_KEY || "your private key";

const derivationPath = "m/44'/52752'/0'/0/";

const { CeloProvider } = require("@celo-tools/celo-ethers-wrapper");
const { CeloWallet } = require("@celo-tools/celo-ethers-wrapper");

extendEnvironment((hre) => {
  const provider = new CeloProvider(hre.network.config.url, hre.network.config);
  const wallet = new CeloWallet(hre.network.config.accounts[0], provider);
  hre.celo = {
    provider,
    wallet,
  };
});

module.exports = {
  defaultNetwork: "celo",
  networks: {
    hardhat: {
      // // If you want to do some forking, uncomment this
      // forking: {
      //   url: MAINNET_RPC_URL
      // }
    },
    localhost: {},
    celo: {
      url: CELO_MAINNET_RPC_URL,
      chainId: 42220,
      accounts: [process.env.CELO_PRIVATE_KEY],
    },
    kovan: {
      url: KOVAN_RPC_URL,
      // accounts: [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      },
      saveDeployments: true,
    },
    rinkeby: {
      url: RINKEBY_RPC_URL,
      // accounts: [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      },
      saveDeployments: true,
    },
    ganache: {
      url: "http://localhost:8545",
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    feeCollector: {
      default: 1,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.5.13",
        settings: {
          evmVersion: "istanbul",
        },
      },
      {
        version: "0.8.3",
      },
    ],
  },
  mocha: {
    timeout: 100000,
  },
};
