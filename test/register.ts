import { expect } from "chai";
import { ethers } from "hardhat";

export default function (): void {
  it("Register: Success", async function (): Promise<void> {
    await this.platform.register(this.owner.address);
    await this.platform.connect(this.addr1).register(this.owner.address);

    const user = await this.platform.users(this.addr1.address);

    expect(user.referrer).to.be.equal(this.owner.address);
  });

  it("Register: Already register", async function (): Promise<void> {
    await this.platform.register(this.owner.address);
    expect(this.platform.register(this.owner.address)).to.be.revertedWith(
      "Already register"
    );
  });

  it("Register: Referrer not register", async function (): Promise<void> {
    await this.platform.register(this.owner.address);
    expect(
      this.platform.connect(this.addr1).register(this.addr2.address)
    ).to.be.revertedWith("Referrer not register");
  });
}
