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
    const RATE = 1;
    const startTime = latestTime() + duration.minutes(5);
    const endTime = startTime + duration.weeks(1);
    const cap = ether(4);
    const goal = ether(3);
    const minTransactionValue = ether(2);
    const releaseTime = endTime + duration.minutes(10);
    console.log([startTime,endTime,RATE,goal,cap,accounts[0],releaseTime,minTransactionValue]);
    return deployer.deploy(PreIcoCrowdsale, startTime, endTime, RATE, goal, cap, accounts[0], releaseTime, minTransactionValue);

}