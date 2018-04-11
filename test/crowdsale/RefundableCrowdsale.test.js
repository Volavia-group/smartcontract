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

const RefundableCrowdsale = artifacts.require('PreIcoCrowdsale.sol');

contract('RefundableCrowdsale', function ([_, owner, wallet, investor]) {
  const rate = new BigNumber(100);
  const goal = ether(80);
  const lessThanGoal = ether(75);
  const cap = ether(30);
  const minTransaction = ether(1);
  const startTime = latestTime() + duration.weeks(1);
  const endTime = startTime + duration.weeks(1);
  const afterEndTime = endTime + duration.seconds(1);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.crowdsale = await RefundableCrowdsale.new(startTime, endTime, rate, goal, cap, wallet, afterEndTime, minTransaction);
  });

  describe('creating a valid crowdsale', function () {
    it('should fail with zero goal', async function () {
      await RefundableCrowdsale.new(startTime, endTime, rate, 0, cap, wallet, afterEndTime, minTransaction)
        .should.be.rejectedWith(EVMRevert);
    });
  });

  it('should deny refunds before end', async function () {
    await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMRevert);
    await increaseTimeTo(startTime);
    await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMRevert);
  });

  it('should deny refunds after end if goal was reached', async function () {
    await increaseTimeTo(startTime);
    await this.crowdsale.sendTransaction({ value: goal, from: investor });
    await increaseTimeTo(afterEndTime);
    await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMRevert);
  });

  it('should allow refunds after end if goal was not reached', async function () {
    await increaseTimeTo(startTime);
    await this.crowdsale.sendTransaction({ value: lessThanGoal, from: investor });
    await increaseTimeTo(afterEndTime);

    await this.crowdsale.finalize({ from: owner });

    const pre = web3.eth.getBalance(investor);
    await this.crowdsale.claimRefund({ from: investor, gasPrice: 0 })
      .should.be.fulfilled;
    const post = web3.eth.getBalance(investor);

    post.minus(pre).should.be.bignumber.equal(lessThanGoal);
  });

  it('should forward funds to wallet after end if goal was reached', async function () {
    await increaseTimeTo(startTime);
    await this.crowdsale.sendTransaction({ value: goal, from: investor });
    await increaseTimeTo(afterEndTime);

    const pre = web3.eth.getBalance(wallet);
    await this.crowdsale.finalize({ from: owner });
    const post = web3.eth.getBalance(wallet);

    post.minus(pre).should.be.bignumber.equal(goal);
  });
});
