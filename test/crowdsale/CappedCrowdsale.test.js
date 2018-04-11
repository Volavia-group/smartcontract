import ether from 'zeppelin-solidity/test/helpers/ether';
import { advanceBlock } from 'zeppelin-solidity/test/helpers/advanceToBlock';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime';
import latestTime from 'zeppelin-solidity/test/helpers/latestTime';
import EVMRevert from 'zeppelin-solidity/test/helpers/EVMRevert';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const CappedCrowdsale = artifacts.require('PreIcoCrowdsale.sol');
const MintableToken = artifacts.require('MintableToken');

contract('CappedCrowdsale', function ([_, wallet]) {
  const rate = new BigNumber(1000);

  const cap = ether(300);
  const lessThanCap = ether(6);
  const minTransaction = ether(1);
  const goal = ether(10);
 

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.startTime = latestTime() + duration.weeks(1);
    this.endTime = this.startTime + duration.weeks(1);
    this.afterEndTime = this.endTime + duration.seconds(1);
    this.crowdsale = await CappedCrowdsale.new(this.startTime, this.endTime, rate, goal, cap, wallet, this.afterEndTime,minTransaction);

    this.token = MintableToken.at(await this.crowdsale.token());
  });

  describe('creating a valid crowdsale', function () {
    it('should fail with zero cap', async function () {
      await CappedCrowdsale.new(this.startTime, this.endTime, rate, goal, 0, wallet, this.afterEndTime, minTransaction).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('accepting payments', function () {
    beforeEach(async function () {
      await increaseTimeTo(this.startTime);
    });

    it('should accept payments within cap', async function () {
      //await this.crowdsale.send(cap.minus(lessThanCap)).should.be.fulfilled;
      await this.crowdsale.send(lessThanCap).should.be.fulfilled;
    });

  });

  describe('ending', function () {
    beforeEach(async function () {
      await increaseTimeTo(this.startTime);
    });

    it('should not be ended if under cap', async function () {
      let hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(false);
      await this.crowdsale.send(lessThanCap);
      hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(false);
    });
  });
});
