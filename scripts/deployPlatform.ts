import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import assert from "assert";

dotenv.config();

assert(process.env.TOKEN_ADDRESS, "process.env.TOKEN_ADDRESS undefined");
assert(process.env.ROUND_TIME_SEC, "process.env.ROUND_TIME_SEC undefined");

async function main() {
  const Contract = await ethers.getContractFactory("Platform");
  const [owner] = await ethers.getSigners();
  const contract = await Contract.deploy(
    String(process.env.TOKEN_ADDRESS),
    String(process.env.ROUND_TIME_SEC)
  );

  console.log("Contract deployed to:", contract.address);
  console.log("Owner address is: ", owner.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
