require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const BNBTESTNET_RPC_URL = process.env.BNBTESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/";
const BNBMAINNET_RPC_URL = process.env.BNBMAINNET_RPC_URL || "";
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // BNB Chain Testnet
    bnbTestnet: {
      url: BNBTESTNET_RPC_URL,
      chainId: 97,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
    },
    // BNB Chain Mainnet
    bnbMainnet: {
      url: BNBMAINNET_RPC_URL,
      chainId: 56,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 5000000000, // 5 gwei
    },
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: BSCSCAN_API_KEY,
    customChains: [
      {
        network: "bscTestnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com",
        },
      },
      {
        network: "bsc",
        chainId: 56,
        urls: {
          apiURL: "https://api.bscscan.com/api",
          browserURL: "https://bscscan.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

module.exports = config;
