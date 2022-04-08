import { expect } from "chai";
import { ethers } from "hardhat";
import { STATUS } from "./../types/enums";

export default function (): void {
  it("StartSaleRound: First", async function (): Promise<void> {
    expect((await this.platform.round()).status).to.be.equal(STATUS.CREATED);
    await this.platform.startSaleRound();
    expect((await this.platform.round()).status).to.be.equal(STATUS.SALE);
  });

  it("StartSaleRound: Already start sale round", async function (): Promise<void> {
    expect((await this.platform.round()).status).to.be.equal(STATUS.CREATED);
    await this.platform.startSaleRound();
    expect(this.platform.startSaleRound()).to.be.revertedWith(
      "Already start sale round"
    );
  });
}
