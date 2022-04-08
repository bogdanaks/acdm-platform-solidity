//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Token is ERC20, AccessControl {
  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
  bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");

  constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setRoleAdmin(PLATFORM_ROLE, DEFAULT_ADMIN_ROLE);
  }

  modifier onlyOwnerOrDao {
    require(hasRole(PLATFORM_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only owner or platform");
    _;
  }

  function mint(address to, uint256 amount) external onlyOwnerOrDao {
    _mint(to, amount);
  }

  function burn(address to, uint256 amount) external onlyOwnerOrDao {
    _burn(to, amount);
  }
}
