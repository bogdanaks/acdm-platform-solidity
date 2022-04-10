import { parseEther } from "ethers/lib/utils";
import { Platform } from "./../typechain/Platform.d";
import { task } from "hardhat/config";

import "@nomiclabs/hardhat-ethers";

interface IArgs {
  contract: string;
  eth: string;
}

task("buy-token", "Buy token")
  .addParam("contract", "Contract token address")
  .addParam("eth", "Eth amount")
  .setAction(async (args: IArgs, hre) => {
    const Platform = (await hre.ethers.getContractAt(
      "Platform",
      args.contract
    )) as Platform;
    const tx = await Platform.buyToken({
      value: parseEther(args.eth),
    });
    await tx.wait();

    console.log("Successfully buy token");
  });

export {};
