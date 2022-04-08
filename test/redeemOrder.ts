import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers, waffle } from "hardhat";

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

  it("RedeemOrder: With referrer lvl 1", async function (): Promise<void> {
    await this.platform.register(this.owner.address);
    await this.platform.connect(this.addr1).register(this.owner.address);
    await this.platform.startSaleRound();
    await this.platform.connect(this.addr1).buyToken({
      value: parseEther("0.5"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    await this.platform.startTradeRound();
    await this.token
      .connect(this.addr1)
      .approve(this.platform.address, parseEther("25000"));
    await this.platform
      .connect(this.addr1)
      .addOrder(parseEther("25000"), parseEther("0.1"));

    const ownerBalanceBefore = await waffle.provider.getBalance(
      this.owner.address
    );
    await this.platform.connect(this.addr1).redeemOrder(0, {
      value: parseEther("0.05"),
    });
    const ownerBalanceAfter = await waffle.provider.getBalance(
      this.owner.address
    );

    expect(ownerBalanceAfter.sub(ownerBalanceBefore)).to.be.equal(
      parseEther("0.00125") // 2.5%
    );
  });

  it("RedeemOrder: With referrer lvl 2", async function (): Promise<void> {
    await this.platform.register(this.owner.address);
    await this.platform.connect(this.addr1).register(this.owner.address);
    await this.platform.connect(this.addr2).register(this.addr1.address);
    await this.platform.startSaleRound();
    await this.platform.connect(this.addr2).buyToken({
      value: parseEther("0.5"),
    });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 3]); // 3 days
    await this.platform.startTradeRound();
    await this.token
      .connect(this.addr2)
      .approve(this.platform.address, parseEther("25000"));
    await this.platform
      .connect(this.addr2)
      .addOrder(parseEther("25000"), parseEther("0.1"));

    const ownerBalanceBefore = await waffle.provider.getBalance(
      this.owner.address
    );
    const addr1BalanceBefore = await waffle.provider.getBalance(
      this.addr1.address
    );
    await this.platform.connect(this.addr2).redeemOrder(0, {
      value: parseEther("0.05"),
    });
    const ownerBalanceAfter = await waffle.provider.getBalance(
      this.owner.address
    );
    const addr1BalanceAfter = await waffle.provider.getBalance(
      this.addr1.address
    );

    expect(ownerBalanceAfter.sub(ownerBalanceBefore)).to.be.equal(
      parseEther("0.00125") // 2.5%
    );
    expect(addr1BalanceAfter.sub(addr1BalanceBefore)).to.be.equal(
      parseEther("0.00125") // 2.5%
    );
  });
}
