var PreIcoCrowdsale = artifacts.require("../PreIcoCrowdsale.sol");

module.exports = function (deployer, network, accounts){
    return liveDeploy(deployer, accounts);
};

function latestTime(){
    return web3.eth.getBlock('latest').timestamp;
}
function ether (n) {
  return web3.toWei(n, 'ether');
}
 const duration = {
    seconds: function(val) {return val},
    minutes: function(val) {return val * this.seconds(60)},
    hours: function(val) {return val * this.minutes(60)},
    days: function(val) {return val * this.hours(24)},
    weeks: function(val) {return val * this.days(7)},
    years: function(va) {return val * this.days(365)}
};
    function liveDeploy(deployer,accounts){
    const BigNumber = web3.BigNumber;
    const RATE = 25; // per token value in cent i.e 1 token = 25 cents
    const goal = ether(1);
    const minTransactionValue = 50; // minimum transaction value in USD i.e 50 USD
    const value = ether(0.2); // Balance assigned to contract address at the time of deployment
    const from = '0x007510BdDAF1144E4C6c29cD4bC3c0af0ea381a8'; // Wallet address from where assignment will take place
    console.log([RATE,goal,accounts[0],minTransactionValue,value]);
    return deployer.deploy(PreIcoCrowdsale,RATE, goal, accounts[0], minTransactionValue,{from, value});

}