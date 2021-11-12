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

task("verify-df-global-escrow", "Verify the dfGlobalEscrow contract on Polygon Scan")
  .setAction(async (args, hre) => {
    log.info(`deploying dfGlobalEscrow on network: ${hre.network.name}`);
    assert(globalConfigNetwork === hre.network.name, "network mismatch");

    const contractDetails: contractInfo = contracts["polygonmumbai"];
    const dfGlobalEscrowAddress = contractDetails.dfGlobalEscrowAddress;
    log.info(`verifying dfGlobalEscrowAddress: ${dfGlobalEscrowAddress} on network: ${hre.network.name}`);
    assert(ethers.utils.getAddress(dfGlobalEscrowAddress) == dfGlobalEscrowAddress, "Cannot validate Invalid dfGlobalEscrowAddress");

    await hre.run("verify:verify", {
        address: dfGlobalEscrowAddress
    });
});