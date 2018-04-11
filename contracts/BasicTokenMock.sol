pragma solidity ^0.4.19;


import "zeppelin-solidity/contracts/token/ERC20/BasicToken.sol";


// mock class using BasicToken
contract BasicTokenMock is BasicToken {

  function BasicTokenMock(address initialAccount, uint256 initialBalance) public {
    balances[initialAccount] = initialBalance;
    totalSupply_ = initialBalance;
    //assert(balances[initialAccount] > 0 && totalSupply_ > 0 && initialAccount != address(0));
  }

}
