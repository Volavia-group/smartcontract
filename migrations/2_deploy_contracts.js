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
    const RATE = 25; 
    const cap = ether(5);
    const goal = ether(1);
    const minTransactionValue = ether(1);
    const releaseTime = latestTime() + duration.minutes(30);
    console.log([RATE,goal,accounts[0],releaseTime,minTransactionValue]);
    return deployer.deploy(PreIcoCrowdsale,RATE, goal, accounts[0], releaseTime, minTransactionValue);

}