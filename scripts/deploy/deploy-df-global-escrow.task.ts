import { task, types } from "hardhat/config";
import { Logger } from "tslog";
import { network as globalConfigNetwork }  from "./config/deploy-config-global";
import "@nomiclabs/hardhat-ethers";
const log: Logger = new Logger();
import { strict as assert } from 'assert';

task("deploy-df-global-escrow", "Deploys a new dfGlobalEscrow contract")
  .setAction(async (args, hre) => {
  log.info(`deploying dfGlobalEscrow on network: ${hre.network.name}`);
  assert(globalConfigNetwork === hre.network.name, "network mismatch");

  const dfGlobalEscrowContract = await hre.ethers.getContractFactory(`contracts/DFGlobalEscrow.sol:DFGlobalEscrow`);
  const dfGlobalEscrowContractInstance = await dfGlobalEscrowContract.deploy();
  await dfGlobalEscrowContractInstance.deployed();

  log.info(`copy ${dfGlobalEscrowContractInstance.address} to constant dfGlobalEscrowAddress of scripts/deploy/config/deploy-config-global.ts`);
});