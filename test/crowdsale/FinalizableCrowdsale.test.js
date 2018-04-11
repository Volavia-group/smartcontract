import { advanceBlock } from 'zeppelin-solidity/test/helpers/advanceToBlock';
import ether from 'zeppelin-solidity/test/helpers/ether';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime';
import latestTime from 'zeppelin-solidity/test/helpers/latestTime';
import EVMRevert from 'zeppelin-solidity/test/helpers/EVMRevert';

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const FinalizableCrowdsale = artifacts.require('PreIcoCrowdsale.sol');
const MintableToken = artifacts.require('MintableToken');

contract('FinalizableCrowdsale', function ([_, owner, wallet, thirdparty]) {
  const rate = new BigNumber(1000);
  const goal = ether(800);
  const lessThanGoal = ether(750);
  const cap = ether(300);
  const minTransaction = ether(1);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.startTime = latestTime() + duration.weeks(1);
    this.endTime = this.startTime + duration.weeks(1);
    this.afterEndTime = this.endTime + duration.seconds(1);

    this.crowdsale = await FinalizableCrowdsale.new(this.startTime, this.endTime, rate, goal, cap, wallet, this.afterEndTime, minTransaction);

    this.token = MintableToken.at(await this.crowdsale.token());
  });

  it('cannot be finalized before ending', async function () {
    await this.crowdsale.finalize({ from: owner }).should.be.rejectedWith(EVMRevert);
  });

  it('cannot be finalized by third party after ending', async function () {
    await increaseTimeTo(this.afterEndTime);
    await this.crowdsale.finalize({ from: thirdparty }).should.be.rejectedWith(EVMRevert);
  });

  it('can be finalized by owner after ending', async function () {
    await increaseTimeTo(this.afterEndTime);
    await this.crowdsale.finalize({ from: owner }).should.be.fulfilled;
  });

  it('cannot be finalized twice', async function () {
    await increaseTimeTo(this.afterEndTime);
    await this.crowdsale.finalize({ from: owner });
    await this.crowdsale.finalize({ from: owner }).should.be.rejectedWith(EVMRevert);
  });

  it('logs finalized', async function () {
    await increaseTimeTo(this.afterEndTime);
    const { logs } = await this.crowdsale.finalize({ from: owner });
    const event = logs.find(e => e.event === 'Finalized');
    should.exist(event);
  });
});
