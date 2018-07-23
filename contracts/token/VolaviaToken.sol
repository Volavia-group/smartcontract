pragma solidity ^0.4.19;

import "./MintableToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract VolaviaToken is MintableToken {
    using SafeMath for uint256;
    string public constant name = "Volavia";
    string public constant symbol = "VOL";
    uint8 public constant decimals = 18;
}
   