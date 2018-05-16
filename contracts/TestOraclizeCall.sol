pragma solidity ^0.4.19;

import "installed_contracts/oraclize-api/contracts/usingOraclize.sol"; //Importing Oraclize

contract TestOraclizeCall is usingOraclize {

    uint public price;
    event Log(string text);

    function TestOraclizeCall() payable {
        update();
    }

    function __callback(bytes32 _myid, string _result){
        require(msg.sender == oraclize_cbAddress());
        Log(_result);
        price = parseInt(_result);
    }
    function __callback(bytes32 _myid, string _result, bytes proof){
        require(msg.sender == oraclize_cbAddress());
        Log(_result);
        price = parseInt(_result);
    }

    function update() payable {
        oraclize_query("URL","json(https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD).USD");
    }
    
}