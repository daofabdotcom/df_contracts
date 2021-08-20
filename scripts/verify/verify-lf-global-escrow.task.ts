import { task } from "hardhat/config";
import { network as globalConfigNetwork }  from "../deploy/config/deploy-config-global";
import "@nomiclabs/hardhat-ethers";
require("dotenv").config();
import { Logger } from "tslog";
const log: Logger = new Logger();
import { ethers } from "ethers";
import { strict as assert } from 'assert';
import { contracts } from "../deploy/config/contracts-testnet";
import { contractInfo } from "../types/df-types";

task("verify-lf-global-escrow", "Verify the lfGlobalEscrow contract on Polygon Scan")
  .setAction(async (args, hre) => {
    log.info(`deploying lfGlobalEscrow on network: ${hre.network.name}`);
    assert(globalConfigNetwork === hre.network.name, "network mismatch");

    const contractDetails: contractInfo = contracts["polygonmumbai"];
    const lfGlobalEscrowAddress = contractDetails.lfGlobalEscrowAddress;
    log.info(`verifying lfGlobalEscrowAddress: ${lfGlobalEscrowAddress} on network: ${hre.network.name}`);
    assert(ethers.utils.getAddress(lfGlobalEscrowAddress) == lfGlobalEscrowAddress, "Cannot validate Invalid lfGlobalEscrowAddress");

    await hre.run("verify:verify", {
        address: lfGlobalEscrowAddress
    });
});