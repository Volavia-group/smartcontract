pragma solidity ^0.4.19;

import "./Crowdsale.sol";
import "../token/MintableToken.sol";
import "./RefundableCrowdsale.sol"; 
import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "../token/VolaviaToken.sol";

contract PreIcoCrowdsale is FinalizableCrowdsale,RefundableCrowdsale,Destructible {
   
    //Child contract to have the same constructor as the parent contract.
    //ie is order to call super on constrcutor
    
    function PreIcoCrowdsale(uint256 _rate, uint256 _goal, address _wallet, uint256 _minTransactionValue) public payable
       
        FinalizableCrowdsale()
        RefundableCrowdsale(_goal)
        Crowdsale(_rate,_wallet,_minTransactionValue) 
        {
           //As goal needs to be met for a successful crowdsale
           //the value needs to less or equal than a cap which is limit for accepted funds
           
            
        }   

    
    function createTokenContract() internal returns (MintableToken) {
        return new VolaviaToken();
    }

}