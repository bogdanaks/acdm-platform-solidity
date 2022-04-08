import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { STATUS } from "./../types/enums";

export default function (): void {
  it("RemoveOrder: Success", async function (): Promise<void> {
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.5"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    await this.platform.startTradeRound();

    await this.token.approve(this.platform.address, parseEther("25000"));
    await this.platform.addOrder(parseEther("25000"), parseEther("0.1"));

    const order = await this.platform.orders(0);
    expect(order.tokensAmount).to.be.equal(parseEther("25000"));
    expect(order.ethPrice).to.be.equal(parseEther("0.1"));

    const balanceBefore = await this.token.balanceOf(this.owner.address);
    expect(balanceBefore).to.be.equal(parseEther("25000"));

    await this.platform.removeOrder(0); // remove

    const balanceAfter = await this.token.balanceOf(this.owner.address);
    expect(balanceAfter).to.be.equal(parseEther("50000"));
  });

  it("RemoveOrder: Order doesnt exist", async function (): Promise<void> {
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.5"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    await this.platform.startTradeRound();

    await this.token.approve(this.platform.address, parseEther("25000"));
    await this.platform.addOrder(parseEther("25000"), parseEther("0.1"));

    expect(this.platform.removeOrder(1)).to.be.revertedWith(
      "Order doesnt exist"
    );
  });

  it("RemoveOrder: Order doesnt exist. Double remove", async function (): Promise<void> {
    await this.platform.startSaleRound();
    await this.platform.buyToken({
      value: parseEther("0.5"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    await this.platform.startTradeRound();

    await this.token.approve(this.platform.address, parseEther("25000"));
    await this.platform.addOrder(parseEther("25000"), parseEther("0.1"));
    await this.platform.removeOrder(0);

    expect(this.platform.removeOrder(0)).to.be.revertedWith(
      "Order doesnt exist"
    );
  });
}
