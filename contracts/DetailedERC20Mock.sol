pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";


contract DetailedERC20Mock is StandardToken, DetailedERC20 {
  function DetailedERC20Mock(string _name, string _symbol, uint8 _decimals) DetailedERC20(_name, _symbol, _decimals) public {}
}
