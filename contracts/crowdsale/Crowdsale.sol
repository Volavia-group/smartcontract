pragma solidity ^0.4.18;

import "../token/MintableToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/token/ERC20/TokenTimelock.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../TestOraclizeCall.sol";



/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale.
 * Crowdsales have a start and end timestamps, where investors can make
 * token purchases and the crowdsale will assign them tokens based
 * on a token per ETH rate. Funds collected are forwarded to a wallet
 * as they arrive.
 */
contract Crowdsale is Ownable, TestOraclizeCall{
  using SafeMath for uint256;

  // The token being sold
  MintableToken public token;

  // Number of tokens that need to minted
  uint256 public tokens;


  // Minumum transaction value
  uint256 public minTransactionValue;

  // address where funds are collected
  address public wallet;

  // Per token value in USD
  uint256 public rate;

  // amount of raised money in wei
  uint256 public weiRaised;

  bool public hasClosed = false;

  uint256 public tokensSold;




  //uint256 public constant _releaseTime = now + 10 minutes;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  event Invested(address receiver, uint256 tokenCount, uint256 tokens);


  function Crowdsale(uint256 _rate, address _wallet, uint256 _minTransactionValue) public {
    //require(_startTime >= now);
    //require(_endTime >= _startTime);
    require(_rate > 0);
    require(_wallet != address(0)); // checking if wallet address is not empty
    require(_minTransactionValue > 0);

    token = createTokenContract();
    
    rate = _rate;
    wallet = _wallet;
    releaseTime = _releaseTime;
    minTransactionValue = _minTransactionValue;
  }

  // fallback function can be used to buy tokens
  function () external payable {
    buyTokens(msg.sender);
  }

  function getNow() internal view returns (uint256) {
    return now;
  }

  // low level token purchase function
  function buyTokens(address beneficiary) public payable {
    require(beneficiary != address(0));
    require(validPurchase());
    require(hasClosed != true);
    updatePrice(); // Calling oraclize query to update current exchange rate 
    uint256 weiAmount = msg.value;
    
    // calculate token amount to be created
    uint256 tokens = getTokenAmount(weiAmount);
     
    // update state
    weiRaised = weiRaised.add(weiAmount);
    tokensSold = tokensSold.add(tokens);

    token.pause();
    token.mint(beneficiary,tokens);
    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);
    forwardFunds();
    
  }

  function shutdown() onlyOwner external returns (bool){
    hasClosed = true;
    return hasClosed;
  }
  

  // @return true if crowdsale event has ended
  function hasEnded() public view returns (bool) {
    return hasClosed;

  }

  // creates the token to be sold.
  // override this method to have crowdsale of a specific mintable token.
  function createTokenContract() internal returns (MintableToken) {
    return new MintableToken();
  }

  // Override this method to have a way to add business logic to your crowdsale when buying
  // price is referred to current exchange rate of USD in ETH
  // rate is referred as per token value in USD
  function getTokenAmount(uint256 weiAmount) internal view returns(uint256) {
    uint256 usdValueOfCustomerEther = price.mul(weiAmount) / 1 ether;
    uint256 tokenPerUsd = 1 ether / rate;
    return tokenPerUsd.mul(usdValueOfCustomerEther);
  
  }

  function getTokens(uint256 tokenCount) internal returns(uint256) {
    return tokenCount.mul(1);
  }

  // send ether to the fund collection wallet
  // override to create custom fund forwarding mechanisms
  function forwardFunds() internal {
    wallet.transfer(msg.value);
    
  }

  // @return true if the transaction can buy tokens
  function validPurchase() internal view returns (bool) {
    bool nonZeroPurchase = msg.value != 0;
    bool aboveMinInvestment = msg.value >= minTransactionValue;
    return  nonZeroPurchase && aboveMinInvestment;
  }

  function preallocate(address beneficiary, uint256 tokenCount) onlyOwner external {
    require(beneficiary != address(0));
    require(hasClosed != true);
    uint256 tokens = getTokens(tokenCount);
    token.mint(beneficiary, tokens);
    tokensSold = tokensSold.add(tokens);
    Invested(beneficiary, tokenCount, tokens);
    forwardFunds();
  }


}
