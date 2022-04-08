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
    await this.platform.addOrder(parseEther("25000"), parseEther("0.1"));
    const order = await this.platform.orders(0);
    expect(order.tokensAmount).to.be.equal(parseEther("25000"));
    expect(order.ethPrice).to.be.equal(parseEther("0.1"));

    // await
  });
}
