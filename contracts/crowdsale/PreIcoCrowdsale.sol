pragma solidity ^0.4.19;

import "./Crowdsale.sol";
import "../token/MintableToken.sol";
import "./CappedCrowdsale.sol";
import "./RefundableCrowdsale.sol"; 
import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "../token/VolaviaToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/TokenTimelock.sol";

contract PreIcoCrowdsale is CappedCrowdsale,RefundableCrowdsale,Destructible {
   
    //Child contract to have the same constructor as the parent contract.
    //ie is order to call super on constrcutor
    
    function PreIcoCrowdsale(uint256 _startTime, uint256 _endTime, uint256 _rate, uint256 _goal, uint256 _cap, address _wallet, uint256 _releaseTime, uint256 _minTransactionValue) public
        CappedCrowdsale(_cap)
        FinalizableCrowdsale()
        RefundableCrowdsale(_goal)
        Crowdsale(_startTime,_endTime,_rate,_wallet,_releaseTime,_minTransactionValue) 
        {
           //As goal needs to be met for a successful crowdsale
           //the value needs to less or equal than a cap which is limit for accepted funds
           require(_goal <= _cap);
            
        }

     
    
    function createTokenContract() internal returns (MintableToken) {
        return new VolaviaToken();
    }

}