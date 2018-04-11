pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

// mock class using StandardToken
contract StandardTokenMock is StandardToken {

  function StandardTokenMock (address initialAccount, uint256 initialBalance) public {
    require(initialBalance > 0);
    require(initialAccount != address(0));
    balances[initialAccount] = initialBalance;
    totalSupply_ = initialBalance;
    
  }

}
