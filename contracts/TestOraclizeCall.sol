pragma solidity ^0.4.19;

import "installed_contracts/oraclize-api/contracts/usingOraclize.sol"; //Importing Oraclize

contract TestOraclizeCall is usingOraclize {

    uint public price;
    uint256 public amt;
    event Log(string text);
    event LogFailure(string text);
    //event LogPrice(uint256 amt);
    mapping(bytes32=>bool) validIds;

    function TestOraclizeCall() public {
        updatePrice();
    }


    function __callback(bytes32 _myid, string _result, bytes proof) public {
        if (!validIds[_myid]) revert();
        require(msg.sender == oraclize_cbAddress());
        Log(_result);
        price = parseInt(_result);
        delete validIds[_myid];
        //updatePrice();

    }

    /*function oraclizeGetPrice() public view returns (uint256){
        return oraclize_getPrice("URL");
    }*/
   

    function updatePrice() public payable {
        //LogPrice(oraclize_getPrice("URL"));
        bytes32 queryId = oraclize_query("URL","json(https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD).USD");
        validIds[queryId] = true;
        
    }

}
