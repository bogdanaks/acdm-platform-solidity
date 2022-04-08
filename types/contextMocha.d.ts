import {
  Token,
  Token__factory,
  Platform,
  Platform__factory,
} from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

declare module "mocha" {
  export interface Context {
    TokenContract: Token__factory;
    PlatformContract: Platform__factory;
    token: Token;
    platform: Platform;
    owner: SignerWithAddress;
    addr1: SignerWithAddress;
    addr2: SignerWithAddress;
  }
}
