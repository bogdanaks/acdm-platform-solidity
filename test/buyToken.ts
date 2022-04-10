import { parseEther } from "ethers/lib/utils";
import { expect } from "chai";
import { waffle } from "hardhat";

export default function (): void {
  it("BuyToken: Success", async function (): Promise<void> {
    await this.platform.register(this.owner.address);
    await this.platform.startSaleRound();

    const platformBalanceBefore = await waffle.provider.getBalance(
      this.platform.address
    );
    expect(platformBalanceBefore).to.be.equal(parseEther("0"));

    await this.platform.buyToken({
      value: parseEther("0.000005"),
    });
    const balanceAfter = await this.token.balanceOf(this.owner.address);
    expect(balanceAfter).to.be.equal(parseEther("50000"));

    const platformBalanceAfter = await waffle.provider.getBalance(
      this.platform.address
    );
    expect(platformBalanceAfter).to.be.equal(parseEther("0.000005"));
  });

  it("BuyToken: With rewards fee lvl 1", async function (): Promise<void> {
    await this.platform.register(this.owner.address);
    await this.platform.connect(this.addr1).register(this.owner.address);
    await this.platform.startSaleRound();

    await this.platform.connect(this.addr1).buyToken({
      value: parseEther("0.000005"),
    });
    const balanceAfter = await this.token.balanceOf(this.addr1.address);
    expect(balanceAfter).to.be.equal(parseEther("50000"));

    const platformBalance = await waffle.provider.getBalance(
      this.platform.address
    );
    expect(platformBalance).to.be.equal(parseEther("0.00000475"));
  });

  it("BuyToken: With rewards fee lvl 2", async function (): Promise<void> {
    await this.platform.register(this.owner.address);
    await this.platform.connect(this.addr1).register(this.owner.address);
    await this.platform.connect(this.addr2).register(this.addr1.address);
    await this.platform.startSaleRound();

    await this.platform.connect(this.addr2).buyToken({
      value: parseEther("0.000005"),
    });

    const platformBalance = await waffle.provider.getBalance(
      this.platform.address
    );
    expect(platformBalance).to.be.equal(parseEther("0.0000046"));
  });

  it("BuyToken: Greater than zero", async function (): Promise<void> {
    await this.platform.register(this.owner.address);
    await this.platform.startSaleRound();
    expect(
      this.platform.connect(this.addr2).buyToken({
        value: parseEther("0"),
      })
    ).to.be.revertedWith("Greater than zero");
  });
}
