import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { STATUS } from "./../types/enums";

export default function (): void {
  it("StartTradeRound: Success", async function (): Promise<void> {
    expect((await this.platform.round()).status).to.be.equal(STATUS.CREATED);
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.5"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    await this.platform.startTradeRound();

    expect((await this.platform.round()).status).to.be.equal(STATUS.TRADE);
  });

  it("StartTradeRound: Burn token", async function (): Promise<void> {
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.000005"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    await this.platform.startTradeRound();
  });

  it("StartTradeRound: Must be after SALE round", async function (): Promise<void> {
    expect(this.platform.startTradeRound()).to.be.revertedWith(
      "Must be after SALE round"
    );
  });

  it("StartTradeRound: Already started", async function (): Promise<void> {
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.5"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    await this.platform.startTradeRound();
    expect(this.platform.startTradeRound()).to.be.revertedWith(
      "Already started"
    );
  });

  it("StartTradeRound: The round time hasn't passed yet", async function (): Promise<void> {
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.5"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2]); // 3 days
    expect(this.platform.startTradeRound()).to.be.revertedWith(
      "The round time hasn't passed yet"
    );
  });

  it("StartTradeRound: Not expired or not sold all tokens", async function (): Promise<void> {
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.0000005"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2]); // 2 days
    expect(this.platform.startTradeRound()).to.be.revertedWith(
      "Not expired or not sold all tokens"
    );
  });
}
