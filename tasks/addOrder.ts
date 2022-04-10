import { parseEther } from "ethers/lib/utils";
import { Platform } from "../typechain/Platform";
import { task } from "hardhat/config";

import "@nomiclabs/hardhat-ethers";

interface IArgs {
  contract: string;
  tokensamount: string;
  ethprice: string;
}

task("add-order", "Add order")
  .addParam("contract", "Contract token address")
  .addParam("tokensamount", "Tokens amount")
  .addParam("ethprice", "Eth price")
  .setAction(async (args: IArgs, hre) => {
    const Platform = (await hre.ethers.getContractAt(
      "Platform",
      args.contract
    )) as Platform;
    const tx = await Platform.addOrder(args.tokensamount, args.ethprice);
    await tx.wait();

    console.log("Successfully add order");
  });

export {};
