import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { STATUS } from "./../types/enums";

export default function (): void {
  it("AddOrder: Success", async function (): Promise<void> {
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.5"),
    });

    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    await this.platform.startTradeRound();

    expect((await this.platform.round()).status).to.be.equal(STATUS.TRADE);

    await this.token.approve(this.platform.address, parseEther("25000"));
    await this.platform.addOrder(parseEther("25000"), parseEther("0.1"));
    const order = await this.platform.orders(0);

    expect(order.tokensAmount).to.be.equal(parseEther("25000"));
    expect(order.ethPrice).to.be.equal(parseEther("0.1"));
  });

  it("AddOrder: Only for TRADE round", async function (): Promise<void> {
    await this.token.approve(this.platform.address, parseEther("25000"));
    expect(
      this.platform.addOrder(parseEther("5000"), parseEther("0.1"))
    ).to.be.revertedWith("Only for TRADE round");
  });
}
