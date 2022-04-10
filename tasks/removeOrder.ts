import { Platform } from "../typechain/Platform";
import { task } from "hardhat/config";

import "@nomiclabs/hardhat-ethers";

interface IArgs {
  contract: string;
  orderid: string;
}

task("remove-order", "Remove order")
  .addParam("contract", "Contract token address")
  .addParam("orderid", "Order id")
  .setAction(async (args: IArgs, hre) => {
    const Platform = (await hre.ethers.getContractAt(
      "Platform",
      args.contract
    )) as Platform;
    const tx = await Platform.removeOrder(args.orderid);
    await tx.wait();

    console.log("Successfully remove order");
  });

export {};
