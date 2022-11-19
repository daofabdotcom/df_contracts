import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import 'hardhat-deploy';
import "@nomiclabs/hardhat-etherscan";
import "solidity-coverage"
import '@openzeppelin/hardhat-upgrades';

import { ethers } from "ethers";

require("dotenv").config();

require("./scripts/deploy/deploy-df-global-escrow.task.ts");
require("./scripts/verify/verify-df-global-escrow.task.ts");

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || "";
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const MATICVIGIL_APP_ID = process.env.MATICVIGIL_APP_ID || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
console.log(`Etherscan APIKey is: ${ETHERSCAN_API_KEY}`);

//---------------------==
const config: HardhatUserConfig = {
  networks: {
    development: {
      url: "http://127.0.0.1:8545"
    },
    // rinkeby: {
    //   url: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
    //   accounts: [`0x${DEPLOYER_PRIVATE_KEY}`],
    //   gasPrice: ethers.utils.parseUnits("20", "gwei").toNumber(),
    //   gas: 25e6,
    //   gasMultiplier: 10,
    //   allowUnlimitedContractSize: true,
    //   blockGasLimit: 0x1fffffffffffff,
    // },
    mumbai: {
      url: `https://rpc-mumbai.maticvigil.com/`,
      accounts: [],
      gasPrice: ethers.utils.parseUnits("20", "gwei").toNumber(),
      gas: 25e6,
      gasMultiplier: 10,
      allowUnlimitedContractSize: true,
      blockGasLimit: 0x1fffffffffffff,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
        }
      },
    ],
    overrides: {
    },
  },
  namedAccounts: {
    deployer: 0,
    user1: 1,
  },
  mocha: {
    timeout: 2000000,
  },
};

export default config;