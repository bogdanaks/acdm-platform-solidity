import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const Contract = await ethers.getContractFactory("Platform");
  const [owner] = await ethers.getSigners();
  const contract = await Contract.deploy();

  console.log("Contract deployed to:", contract.address);
  console.log("Owner address is: ", owner.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
