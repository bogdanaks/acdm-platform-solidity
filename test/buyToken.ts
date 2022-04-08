import { parseEther } from "ethers/lib/utils";
import { expect } from "chai";

export default function (): void {
  it("BuyToken: Success", async function (): Promise<void> {
    await this.platform.register(this.owner.address);
    await this.platform.startSaleRound();

    await this.platform.buyToken({
      value: parseEther("0.5"),
    });
    const balanceAfter = await this.token.balanceOf(this.owner.address);
    expect(balanceAfter).to.be.equal(parseEther("50000"));
  });
}
