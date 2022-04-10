//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.11;

import "hardhat/console.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IToken.sol";

contract Platform is ReentrancyGuard {
  enum Status { CREATED, SALE, TRADE }

  struct Round {
    Status status;
    uint256 updatedAt;
  }

  struct Order {
    uint128 id;
    uint256 tokensAmount;
    uint256 ethPrice;
    uint256 ethAmountTrade;
    address creator;
  }

  struct User {
    bool isExist;
    address referrer;
  }

  IToken public token;
  uint256 public roundTime;
  uint256 public tokensCount;
  uint256 public salePrice;
  Round public round;
  
  mapping(address => User) public users;
  mapping(uint128 => Order) public orders;
  uint128 public ordersCount = 0;
  uint256 public ethRoundAmount = 0;

  constructor(IToken _token, uint256 _roundTime) {
    token = _token;
    roundTime = _roundTime;
  }

  function rewardReferrerSaleRound() internal {
    address referrer = users[msg.sender].referrer;
    address referrerLvl2 = users[referrer].referrer;

    if (address(referrer) != address(0)) {
      uint256 fee = (msg.value / 100) * 5;
      payable(referrer).transfer(fee);
    }

    if (address(referrerLvl2) != address(0)) {
      uint256 fee = (msg.value / 100) * 3;
      payable(referrerLvl2).transfer(fee);
    }
  }

  function rewardReferrerTradeRound() internal returns(uint256 ethAmountSend) {
    address referrer = users[msg.sender].referrer;
    address referrerLvl2 = users[referrer].referrer;
    uint256 ethAmount = msg.value;

    if (address(referrer) != address(0)) {
      uint256 fee = (msg.value / 100) * (2.5 * 1e2);
      payable(referrer).transfer(fee / 1e2);
      ethAmount -= fee / 1e2;
    }

    if (address(referrerLvl2) != address(0)) {
      uint256 fee = (msg.value / 100) * (2.5 * 1e2);
      payable(referrerLvl2).transfer(fee / 1e2);
      ethAmount -= fee / 1e2;
    }

    return ethAmount;
  }

  function register(address _referrer) public {
    require(!users[msg.sender].isExist, "Already register");
    if (_referrer != msg.sender) {
      require(users[_referrer].isExist, "Referrer not register");
    }

    users[msg.sender].isExist = true;

    if (_referrer != msg.sender) {
      users[msg.sender].referrer = _referrer;
    }
  }

  function startSaleRound() public {
    if (round.status == Status.CREATED) {
      token.mint(address(this), 1e18 * 100000);
      round.status = Status.SALE;
      round.updatedAt = block.timestamp;
      salePrice = 0.00001 ether;
      tokensCount = 1e18 * 100000;

      return;
    }

    if (block.timestamp >= round.updatedAt + roundTime || tokensCount == 0) {
      if (tokensCount > 0) {
        token.burn(address(this), tokensCount);
      }

      tokensCount = 0;
      salePrice = (salePrice * 103) / 100 + 0.000004 ether;
      uint256 mintAmount = ethRoundAmount / salePrice * 1e18;
      round.status = Status.SALE;
      round.updatedAt = block.timestamp;
      token.mint(address(this), mintAmount);
    } else {
      revert("Not expired or not sold all tokens");
    }
  }

  function startTradeRound() public {
    require(round.status != Status.CREATED, "Must be after SALE round");
    require(round.status == Status.SALE, "Already started");
    require(round.updatedAt + roundTime <= block.timestamp, "The round time hasn't passed yet");
    round.status = Status.TRADE;
    round.updatedAt = block.timestamp;
  }

  function buyToken() public payable nonReentrant() {
    require(msg.value > 0, "Greater than zero");
    uint256 amountBuy = tokensCount / salePrice * msg.value;

    if (amountBuy >= tokensCount) {
      token.transfer(msg.sender, tokensCount);
      tokensCount = 0;
    } else {
      tokensCount -= amountBuy; 
      token.transfer(msg.sender, amountBuy);
    }
    
    rewardReferrerSaleRound();
  }

  function addOrder(uint256 _tokensAmount, uint256 _ethPrice) public nonReentrant() {
    require(round.status == Status.TRADE, "Only for TRADE round");

    orders[ordersCount].id = ordersCount;
    orders[ordersCount].tokensAmount = _tokensAmount;
    orders[ordersCount].ethPrice = _ethPrice;
    orders[ordersCount].ethAmountTrade = 0;
    orders[ordersCount].creator = msg.sender;

    token.transferFrom(msg.sender, address(this), _tokensAmount);

    ordersCount++;
  }

  function removeOrder(uint128 orderId) public nonReentrant() {
    require(orders[orderId].tokensAmount > 0, "Order doesnt exist");

    token.transfer(msg.sender, orders[orderId].tokensAmount);
    payable(msg.sender).transfer(orders[orderId].ethAmountTrade);

    delete orders[orderId];
  }

  function redeemOrder(uint128 _orderId) public payable nonReentrant() {
    require(orders[_orderId].tokensAmount > 0, "Order doesnt exist");
    uint256 amountBuy = orders[_orderId].tokensAmount / orders[_orderId].ethPrice * msg.value;
    uint256 _tokensAmount = orders[_orderId].tokensAmount;
    uint256 tokenAmountTransfer = 0;

    if (amountBuy > _tokensAmount) {
      orders[_orderId].tokensAmount = 0;
      tokenAmountTransfer = _tokensAmount;
    } else {
      orders[_orderId].tokensAmount -= amountBuy;
      tokenAmountTransfer = amountBuy;
    }

    ethRoundAmount += msg.value;
    uint256 ethAmountSend = rewardReferrerTradeRound();
    orders[_orderId].ethAmountTrade += msg.value;
    token.transfer(msg.sender, tokenAmountTransfer);
    payable(orders[_orderId].creator).transfer(ethAmountSend);
  }
}
