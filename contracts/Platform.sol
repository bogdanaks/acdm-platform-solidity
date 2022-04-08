//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.11;

import "hardhat/console.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/access/Ownable.sol"; // TODO mb del
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
  }

  struct User {
    bool isExist;
    address referrer;
    Order[] orders;
  }

  IToken public token;
  uint256 public roundTime;
  uint256 public tokensCount;
  uint256 public salePrice;
  Round public round;
  
  mapping(address => User) public users;
  mapping(uint128 => Order) public orders;
  uint128 public ordersCount = 0;

  constructor(IToken _token, uint256 _roundTime) {
    token = _token;
    roundTime = _roundTime;
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
      salePrice = (1 / 100000) * 1e18;
      tokensCount = 1e18 * 100000;

      return;
    }

    require(round.status != Status.SALE, "Already start sale round");
    round.status = Status.SALE;
    round.updatedAt = block.timestamp;
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
    uint256 countBuy = (msg.value / salePrice) * 1e18;
    tokensCount -= countBuy;
    token.transfer(msg.sender, countBuy);
  }

  function addOrder(uint256 _tokensAmount, uint256 _ethPrice) public {
    require(round.status == Status.TRADE, "Only for TRADE round");

    users[msg.sender].orders.push(
      Order({
        id: ordersCount,
        tokensAmount: _tokensAmount,
        ethPrice: _ethPrice,
        ethAmountTrade: 0
      })
    );
    orders[ordersCount].id = ordersCount;
    orders[ordersCount].tokensAmount = _tokensAmount;
    orders[ordersCount].ethPrice = _ethPrice;
    orders[ordersCount].ethAmountTrade = 0;

    token.transferFrom(msg.sender, address(this), _tokensAmount);

    ordersCount++;
  }

  function removeOrder(uint128 orderId) public {
    require(orders[orderId].tokensAmount > 0, "Order doesnt exist");

    token.transfer(msg.sender, users[msg.sender].orders[orderId].tokensAmount);
    payable(msg.sender).transfer(users[msg.sender].orders[orderId].ethAmountTrade);

    delete orders[orderId];
    delete users[msg.sender].orders[orderId];
  }

  function redeemOrder(uint128 _orderId) public payable {
    require(orders[_orderId].tokensAmount > 0, "Order doesnt exist");
    // require(orders[_orderId].tokensAmount > _tokensAmount, "Must be less than available amount");
    uint256 _ethPrice = msg.value / orders[_orderId].ethPrice;
    console.log("Eth price %s", _ethPrice);
  }
}
