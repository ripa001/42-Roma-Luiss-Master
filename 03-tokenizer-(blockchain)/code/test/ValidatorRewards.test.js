const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Validator Rewards System", function () {
  let trick42Token;
  let owner;
  let validator1;
  let validator2;
  let skater1;
  let skater2;
  
  beforeEach(async function () {
    [owner, validator1, validator2, skater1, skater2] = await ethers.getSigners();
    
    const Trick42Token = await ethers.getContractFactory("Trick42Token");
    trick42Token = await Trick42Token.deploy();
    await trick42Token.waitForDeployment();
  });
  
  describe("Validator Staking", function () {
    it("Should allow staking to become validator", async function () {
      const stakeAmount = ethers.parseEther("100");
      
      // Use a different approach: admin directly mints tokens for testing
      await trick42Token.addValidator(validator1.address);
      
      // Since we can't easily mint 100 tokens through validations due to daily limits,
      // let's test with a smaller stake requirement or modify the approach
      // For now, let's use the owner account which has more flexibility
      
      // Remove validator1 first
      await trick42Token.removeValidator(validator1.address);
      
      // Give some tokens to validator1 by having owner validate tricks on behalf of validator1
      // Owner validates tricks and transfers rewards to validator1
      for (let i = 0; i < 10; i++) {
        await trick42Token.connect(owner).validateTrick(validator1.address, `OwnerTrick${i}`, 10);
        await time.increase(301);
        // Advance time to reset daily limit periodically
        if (i % 5 === 4) {
          await time.increase(86400); // Advance 1 day
        }
      }
      
      const balance = await trick42Token.balanceOf(validator1.address);
      expect(balance).to.be.gte(stakeAmount);
      
      // Now validator1 can stake to become validator
      await trick42Token.connect(validator1).stakeToValidator(stakeAmount);
      
      const validatorInfo = await trick42Token.getValidatorInfo(validator1.address);
      expect(validatorInfo.stakedAmount).to.equal(stakeAmount);
      expect(validatorInfo.isActive).to.be.true;
    });
    
    it("Should require minimum stake amount", async function () {
      const insufficientStake = ethers.parseEther("50");
      
      await expect(
        trick42Token.connect(validator1).stakeToValidator(insufficientStake)
      ).to.be.revertedWith("Insufficient stake amount");
    });
    
    it("Should allow unstaking", async function () {
      const stakeAmount = ethers.parseEther("100");
      
      // Give tokens to validator1 using owner account
      for (let i = 0; i < 10; i++) {
        await trick42Token.connect(owner).validateTrick(validator1.address, `OwnerTrick${i}`, 10);
        await time.increase(301);
        if (i % 5 === 4) {
          await time.increase(86400);
        }
      }
      
      // Stake to become validator
      await trick42Token.connect(validator1).stakeToValidator(stakeAmount);
      
      const balanceBeforeUnstake = await trick42Token.balanceOf(validator1.address);
      
      // Unstake tokens
      await trick42Token.connect(validator1).unstakeValidator(stakeAmount);
      
      const balanceAfterUnstake = await trick42Token.balanceOf(validator1.address);
      expect(balanceAfterUnstake).to.equal(balanceBeforeUnstake + stakeAmount);
      
      const validatorInfo = await trick42Token.getValidatorInfo(validator1.address);
      expect(validatorInfo.isActive).to.be.false;
    });
  });
  
  describe("Validation Rewards", function () {
    beforeEach(async function () {
      await trick42Token.addValidator(validator1.address);
    });
    
    it("Should pay commission to validator on validation", async function () {
      const initialBalance = await trick42Token.balanceOf(validator1.address);
      
      await trick42Token.connect(validator1).validateTrick(skater1.address, "Kickflip", 10);
      
      const finalBalance = await trick42Token.balanceOf(validator1.address);
      const earned = finalBalance - initialBalance;
      
      // Base reward is 50 T42 (10 * 10 / 2), commission should be 10% = 5 T42
      const expectedCommission = ethers.parseEther("5");
      expect(earned).to.equal(expectedCommission);
    });
    
    it("Should give reputation bonus for high reputation validators", async function () {
      // Set high reputation
      await trick42Token.updateValidatorReputation(validator1.address, 150);
      
      const initialBalance = await trick42Token.balanceOf(validator1.address);
      
      await trick42Token.connect(validator1).validateTrick(skater1.address, "Kickflip", 10);
      
      const finalBalance = await trick42Token.balanceOf(validator1.address);
      const earned = finalBalance - initialBalance;
      
      // Base commission 10% + reputation bonus 5% = 15% of 50 T42 = 7.5 T42
      const expectedCommission = ethers.parseEther("7.5");
      expect(earned).to.equal(expectedCommission);
    });
    
    it("Should give activity bonus for active validators", async function () {
      // Perform multiple validations to reach activity threshold
      for (let i = 0; i < 10; i++) {
        await trick42Token.connect(validator1).validateTrick(skater1.address, `Trick${i}`, 2);
        await time.increase(301); // Skip cooldown
      }
      
      const initialBalance = await trick42Token.balanceOf(validator1.address);
      
      // This validation should get activity bonus
      await trick42Token.connect(validator1).validateTrick(skater2.address, "BonusTrick", 10);
      
      const finalBalance = await trick42Token.balanceOf(validator1.address);
      const earned = finalBalance - initialBalance;
      
      // Base 10% + activity bonus 3% = 13% of 50 T42 = 6.5 T42
      const expectedCommission = ethers.parseEther("6.5");
      expect(earned).to.equal(expectedCommission);
    });
    
    it("Should combine all bonuses", async function () {
      // Set high reputation and perform validations for activity bonus
      await trick42Token.updateValidatorReputation(validator1.address, 200);
      
      for (let i = 0; i < 10; i++) {
        await trick42Token.connect(validator1).validateTrick(skater1.address, `Trick${i}`, 2);
        await time.increase(301);
      }
      
      const initialBalance = await trick42Token.balanceOf(validator1.address);
      
      await trick42Token.connect(validator1).validateTrick(skater2.address, "MaxBonusTrick", 10);
      
      const finalBalance = await trick42Token.balanceOf(validator1.address);
      const earned = finalBalance - initialBalance;
      
      // Base 10% + reputation 5% + activity 3% = 18% of 50 T42 = 9 T42
      const expectedCommission = ethers.parseEther("9");
      expect(earned).to.equal(expectedCommission);
    });
  });
  
  describe("Weekly Rewards Distribution", function () {
    beforeEach(async function () {
      await trick42Token.addValidator(validator1.address);
      await trick42Token.addValidator(validator2.address);
    });
    
    it("Should distribute weekly rewards based on activity", async function () {
      // Validator1 does 3 validations, validator2 does 1
      await trick42Token.connect(validator1).validateTrick(skater1.address, "Trick1", 5);
      await time.increase(301);
      await trick42Token.connect(validator1).validateTrick(skater1.address, "Trick2", 5);
      await time.increase(301);
      await trick42Token.connect(validator1).validateTrick(skater1.address, "Trick3", 5);
      
      await time.increase(301);
      await trick42Token.connect(validator2).validateTrick(skater2.address, "Trick4", 5);
      
      // Fast forward a week
      await time.increase(7 * 24 * 60 * 60);
      
      // Distribute weekly rewards
      await trick42Token.distributeWeeklyRewards();
      
      // Check pending rewards
      const rewards1 = await trick42Token.getValidatorRewards(validator1.address);
      const rewards2 = await trick42Token.getValidatorRewards(validator2.address);
      
      // Validator1 should get 3/4 of the pool, validator2 should get 1/4
      const poolAmount = ethers.parseEther("1000");
      expect(rewards1.pendingReward).to.equal(poolAmount * BigInt(3) / BigInt(4));
      expect(rewards2.pendingReward).to.equal(poolAmount / BigInt(4));
    });
    
    it("Should allow claiming rewards", async function () {
      // Setup some activity and distribute rewards
      await trick42Token.connect(validator1).validateTrick(skater1.address, "Trick1", 5);
      await time.increase(7 * 24 * 60 * 60 + 1);
      await trick42Token.distributeWeeklyRewards();
      
      const initialBalance = await trick42Token.balanceOf(validator1.address);
      const rewardsBefore = await trick42Token.getValidatorRewards(validator1.address);
      
      await trick42Token.connect(validator1).claimRewards();
      
      const finalBalance = await trick42Token.balanceOf(validator1.address);
      const rewardsAfter = await trick42Token.getValidatorRewards(validator1.address);
      
      expect(finalBalance - initialBalance).to.equal(rewardsBefore.pendingReward);
      expect(rewardsAfter.pendingReward).to.equal(0);
      expect(rewardsAfter.totalEarned).to.be.gt(rewardsBefore.totalEarned);
    });
    
    it("Should not allow early distribution", async function () {
      await expect(
        trick42Token.distributeWeeklyRewards()
      ).to.be.revertedWith("Weekly distribution too early");
    });
  });
  
  describe("Video Validation Rewards", function () {
    beforeEach(async function () {
      await trick42Token.addValidator(validator1.address);
    });
    
    it("Should pay rewards for video validation", async function () {
      // Submit video
      await trick42Token.connect(skater1).submitVideo(
        "QmTestHash",
        "https://test.video",
        "Kickflip",
        8
      );
      
      const initialBalance = await trick42Token.balanceOf(validator1.address);
      
      // Validate video
      await trick42Token.connect(validator1).validateVideo(
        0, // video ID
        8, // final difficulty
        "Great execution!"
      );
      
      const finalBalance = await trick42Token.balanceOf(validator1.address);
      const earned = finalBalance - initialBalance;
      
      // Base reward: 10 * 8 / 2 = 40 T42, commission 10% = 4 T42
      const expectedCommission = ethers.parseEther("4");
      expect(earned).to.equal(expectedCommission);
    });
  });
  
  describe("Utility Functions", function () {
    beforeEach(async function () {
      await trick42Token.addValidator(validator1.address);
      await trick42Token.addValidator(validator2.address);
    });
    
    it("Should return active validators list", async function () {
      const activeValidators = await trick42Token.getActiveValidators();
      expect(activeValidators.length).to.equal(3); // owner + validator1 + validator2
      expect(activeValidators).to.include(owner.address);
      expect(activeValidators).to.include(validator1.address);
      expect(activeValidators).to.include(validator2.address);
    });
    
    it("Should return reward pool stats", async function () {
      const stats = await trick42Token.getRewardPoolStats();
      expect(stats.totalPool).to.equal(0); // No distribution yet
      expect(stats.lastDistribution).to.be.gt(0);
      expect(stats.nextDistribution).to.be.gt(stats.lastDistribution);
    });
    
    it("Should return validator leaderboard", async function () {
      // Add some activity
      await trick42Token.connect(validator1).validateTrick(skater1.address, "Trick1", 5);
      await time.increase(301);
      await trick42Token.connect(validator2).validateTrick(skater2.address, "Trick2", 3);
      
      const leaderboard = await trick42Token.getValidatorLeaderboard(10);
      expect(leaderboard.validators_list.length).to.equal(3);
      expect(leaderboard.totalValidations.length).to.equal(3);
      expect(leaderboard.totalEarnings.length).to.equal(3);
      expect(leaderboard.reputations.length).to.equal(3);
    });
  });
});
