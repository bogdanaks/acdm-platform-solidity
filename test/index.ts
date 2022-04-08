import { ethers } from "hardhat";

import registerTest from "./register";
import startSaleRoundTest from "./startSaleRound";
import buyTokenTest from "./buyToken";
import startTradeRoundTest from "./startTradeRound";
import addOrderTest from "./addOrder";
import removeOrderTest from "./removeOrder";
import redeemOrderTest from "./redeemOrder";

describe("Test functions", async function () {
  beforeEach(async function () {
    this.PlatformContract = await ethers.getContractFactory("Platform");
    this.TokenContract = await ethers.getContractFactory("Token");
    [this.owner, this.addr1, this.addr2] = await ethers.getSigners();

    this.token = await this.TokenContract.deploy("Crypton", "CRYP");

    this.platform = await this.PlatformContract.deploy(
      this.token.address,
      60 * 60 * 24 * 3 // days second
    );

    await this.token.grantRole(
      await this.token.PLATFORM_ROLE(),
      this.platform.address
    );
  });

  registerTest();
  startSaleRoundTest();
  buyTokenTest();
  startTradeRoundTest();
  addOrderTest();
  removeOrderTest();
  redeemOrderTest();
});
