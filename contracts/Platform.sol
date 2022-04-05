//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.11;

import "hardhat/console.sol";

contract Platform {
  address public acdmToken;
  uint256 public roundTime;

  mapping(address => address[]) public referrers;

  constructor(address _acdmToken, uint256 _roundTime) {
    acdmToken = _acdmToken;
    roundTime = _roundTime;
  }

  function register(address referrer) public {
    //
  }

  function buyACDM() public {
    //
  }

  function addOrder() public {
    //
  }

  function removeOrder() public {
    //
  }

  function redeemOrder() public {
    //
  }
}
