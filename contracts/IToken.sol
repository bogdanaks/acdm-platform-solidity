//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.11;

interface IToken {
  function transfer(address to, uint256 amount) external;
  function transferFrom(address from, address to, uint256 amount) external;
  function approve(address spender, uint256 amount) external;
  function mint(address _to, uint256 _amount) external;
  function burn(address _to, uint256 _amount) external;
}