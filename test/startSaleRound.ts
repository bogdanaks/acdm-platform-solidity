import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { STATUS } from "./../types/enums";

export default function (): void {
  it("StartSaleRound: First", async function (): Promise<void> {
    expect((await this.platform.round()).status).to.be.equal(STATUS.CREATED);
    await this.platform.startSaleRound();
    expect((await this.platform.round()).status).to.be.equal(STATUS.SALE);
  });

  it("StartSaleRound: Already start sale round", async function (): Promise<void> {
    await this.platform.startSaleRound();
    expect(this.platform.startSaleRound()).to.be.revertedWith(
      "Already start sale round"
    );
  });

  it("StartSaleRound: Revert", async function (): Promise<void> {
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.000001"),
    });
    const tokens = await this.platform.tokensCount();
    expect(tokens).to.be.equal(parseEther("90000"));
    expect(this.platform.startSaleRound()).to.be.revertedWith(
      "Not expired or not sold all tokens"
    );
  });

  it("StartSaleRound: After trade round", async function (): Promise<void> {
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.000005"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    await this.platform.startTradeRound();
    await this.token.approve(this.platform.address, parseEther("25000"));
    await this.platform.addOrder(parseEther("25000"), parseEther("0.1"));
    await this.platform.connect(this.addr1).redeemOrder(0, {
      value: parseEther("0.6"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    await this.platform.startSaleRound();
  });

  it("StartSaleRound: Dublicate", async function (): Promise<void> {
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.000005"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    expect(this.platform.startSaleRound()).to.be.revertedWith(
      "Only after TRADE round"
    );
  });
}
