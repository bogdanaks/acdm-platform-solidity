import { task } from "hardhat/config";

import "@nomiclabs/hardhat-ethers";

interface IArgs {
  contract: string;
  referrer: string;
}

task("register", "Register account")
  .addParam("contract", "Contract token address")
  .addParam("referrer", "Referrer address")
  .setAction(async (args: IArgs, hre) => {
    const Platform = await hre.ethers.getContractAt("Platform", args.contract);
    const tx = await Platform.register(args.referrer);
    await tx.wait();

    console.log("Successfully register account");
  });

export {};
