import { task } from "hardhat/config";

import "@nomiclabs/hardhat-ethers";

interface IArgs {
  contract: string;
}

task("start-sale-round", "Start sale round")
  .addParam("contract", "Contract token address")
  .setAction(async (args: IArgs, hre) => {
    const Platform = await hre.ethers.getContractAt("Platform", args.contract);
    const tx = await Platform.startSaleRound();
    await tx.wait();

    console.log("Successfully start sale round");
  });

export {};
