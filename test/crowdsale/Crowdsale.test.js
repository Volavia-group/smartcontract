import ether from 'zeppelin-solidity/test/helpers/ether';
import { advanceBlock } from 'zeppelin-solidity/test/helpers/advanceToBlock';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime';
import latestTime from 'zeppelin-solidity/test/helpers/latestTime';
import EVMRevert from 'zeppelin-solidity/test/helpers/EVMRevert';

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Crowdsale = artifacts.require('Crowdsale');
const MintableToken = artifacts.require('MintableToken');

contract('Crowdsale', function ([_, investor, wallet, purchaser]) {
  const rate = new BigNumber(100);
  const value = ether(4);
  const minTransaction = ether(1);
  const expectedTokenAmount = rate.mul(value);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.startTime = latestTime() + duration.weeks(1);
    this.endTime = this.startTime + duration.weeks(1);
    this.afterEndTime = this.endTime + duration.seconds(1);

    this.crowdsale = await Crowdsale.new(this.startTime, this.endTime, rate, wallet, this.afterEndTime, minTransaction);

    this.token = MintableToken.at(await this.crowdsale.token());
  });

  it('should be token owner', async function () {
    const owner = await this.token.owner();
    owner.should.equal(this.crowdsale.address);
  });

  it('should be ended only after end', async function () {
    let ended = await this.crowdsale.hasEnded();
    ended.should.equal(false);
    await increaseTimeTo(this.afterEndTime);
    ended = await this.crowdsale.hasEnded();
    ended.should.equal(true);
  });

  describe('accepting payments', function () {
    it('should reject payments before start', async function () {
      await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(investor, { from: purchaser, value: value }).should.be.rejectedWith(EVMRevert);
    });

    it('should accept payments after start', async function () {
      await increaseTimeTo(this.startTime);
      await this.crowdsale.send(value).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
    });

    it('should reject payments after end', async function () {
      await increaseTimeTo(this.afterEndTime);
      await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('high-level purchase', function () {
    beforeEach(async function () {
      await increaseTimeTo(this.startTime);
    });

    it('should log purchase', async function () {
      const { logs } = await this.crowdsale.sendTransaction({ value: value, from: investor });

      const event = logs.find(e => e.event === 'TokenPurchase');

      should.exist(event);
      event.args.purchaser.should.equal(investor);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should increase totalSupply', async function () {
      await this.crowdsale.send(value);
      const totalSupply = await this.token.totalSupply();
      totalSupply.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to sender', async function () {
      await this.crowdsale.sendTransaction({ value: value, from: investor });
      let balance = await this.token.balanceOf(investor);
    });

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.sendTransaction({ value: value, from: investor });
      const post = web3.eth.getBalance(wallet);
      post.minus(pre).should.be.bignumber.equal(value);
    });
  });

  describe('low-level purchase', function () {
    beforeEach(async function () {
      await increaseTimeTo(this.startTime);
    });

    it('should log purchase', async function () {
      const { logs } = await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      const event = logs.find(e => e.event === 'TokenPurchase');
      should.exist(event);
      event.args.purchaser.should.equal(purchaser);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should increase totalSupply', async function () {
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      const totalSupply = await this.token.totalSupply();
      totalSupply.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to beneficiary', async function () {
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      const balance = await this.token.balanceOf(investor);
    });

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.buyTokens(investor, { value : value, from: purchaser });
      const post = web3.eth.getBalance(wallet);
      post.minus(pre).should.be.bignumber.equal(value);
    });

    it('Is a valid purchase', async function(){
     await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
    })

    it('Create Token', async function(){
     await this.token.should.exist;
    })
  });
});