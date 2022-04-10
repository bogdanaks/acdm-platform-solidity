import { parseEther } from "ethers/lib/utils";
import { Platform } from "../typechain/Platform";
import { task } from "hardhat/config";

import "@nomiclabs/hardhat-ethers";

interface IArgs {
  contract: string;
  orderid: string;
  eth: string;
}

task("redeem-order", "Redeem order")
  .addParam("contract", "Contract token address")
  .addParam("orderid", "Order id")
  .addParam("eth", "Eth amount")
  .setAction(async (args: IArgs, hre) => {
    const Platform = (await hre.ethers.getContractAt(
      "Platform",
      args.contract
    )) as Platform;
    const tx = await Platform.redeemOrder(args.orderid, {
      value: parseEther(args.eth),
    });
    await tx.wait();

    console.log("Successfully redeem order");
  });

export {};
