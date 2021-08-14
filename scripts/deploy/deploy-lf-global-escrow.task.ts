import { task, types } from "hardhat/config";
import { Logger } from "tslog";
import { network as globalConfigNetwork }  from "./config/deploy-config-global";
import "@nomiclabs/hardhat-ethers";
const log: Logger = new Logger();
import { strict as assert } from 'assert';

task("deploy-lf-global-escrow", "Deploys a new lfGlobalEscrow contract")
  .setAction(async (args, hre) => {
  log.info(`deploying lfGlobalEscrow on network: ${hre.network.name}`);
  assert(globalConfigNetwork === hre.network.name, "network mismatch");

  const lfGlobalEscrowContract = await hre.ethers.getContractFactory(`contracts/LFGlobalEscrow.sol:LFGlobalEscrow`);
  const lfGlobalEscrowContractInstance = await lfGlobalEscrowContract.deploy();
  await lfGlobalEscrowContractInstance.deployed();

  log.info(`copy ${lfGlobalEscrowContractInstance.address} to constant lfGlobalEscrowAddress of scripts/deploy/config/deploy-config-global.ts`);
});