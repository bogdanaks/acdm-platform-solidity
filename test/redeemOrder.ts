import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

export default function (): void {
  it("RedeemOrder: Success", async function (): Promise<void> {
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.5"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    await this.platform.startTradeRound();
    await this.token.approve(this.platform.address, parseEther("25000"));
    await this.platform.addOrder(parseEther("25000"), parseEther("0.1"));

    await this.platform.connect(this.addr1).redeemOrder(0, {
      value: parseEther("0.1"),
    });

    const order = await this.platform.orders(0);
    expect(order.ethAmountTrade).to.be.equal(parseEther("0.1"));
    expect(order.tokensAmount).to.be.equal(parseEther("0"));
  });

  it("RedeemOrder: Success half buy", async function (): Promise<void> {
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.5"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    await this.platform.startTradeRound();
    await this.token.approve(this.platform.address, parseEther("25000"));
    await this.platform.addOrder(parseEther("25000"), parseEther("0.1"));

    await this.platform.connect(this.addr1).redeemOrder(0, {
      value: parseEther("0.05"),
    });

    const order = await this.platform.orders(0);
    expect(order.ethAmountTrade).to.be.equal(parseEther("0.05"));
    expect(order.tokensAmount).to.be.equal(parseEther("12500"));
  });
}
