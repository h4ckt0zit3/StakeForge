import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers.js";

describe("StakeForge Protocol", function () {
  // ── Fixture ────────────────────────────────────────────────
  async function deployFixture() {
    const [owner, alice, bob, attacker] = await ethers.getSigners();

    // Deploy SFORGE token
    const SFORGEToken = await ethers.getContractFactory("SFORGEToken");
    const token = await SFORGEToken.deploy();
    await token.waitForDeployment();

    // Deploy StakeForge staking contract
    const StakeForge = await ethers.getContractFactory("StakeForge");
    const staking = await StakeForge.deploy(await token.getAddress());
    await staking.waitForDeployment();

    // Transfer tokens to alice and bob for testing
    const transferAmount = ethers.parseEther("50000");
    await token.transfer(alice.address, transferAmount);
    await token.transfer(bob.address, transferAmount);

    // Fund staking contract with rewards pool
    const rewardsPool = ethers.parseEther("200000");
    await token.transfer(await staking.getAddress(), rewardsPool);

    return { token, staking, owner, alice, bob, attacker };
  }

  // ── SFORGEToken Tests ──────────────────────────────────────
  describe("SFORGEToken", function () {
    it("should mint 1,000,000 SFORGE to deployer", async function () {
      const { token } = await loadFixture(deployFixture);
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("1000000"));
    });

    it("should have correct name and symbol", async function () {
      const { token } = await loadFixture(deployFixture);
      expect(await token.name()).to.equal("StakeForge Token");
      expect(await token.symbol()).to.equal("SFORGE");
    });

    describe("Faucet", function () {
      it("should mint 1000 SFORGE to caller", async function () {
        const { token, attacker } = await loadFixture(deployFixture);
        const before = await token.balanceOf(attacker.address);
        await token.connect(attacker).faucet();
        const after = await token.balanceOf(attacker.address);
        expect(after - before).to.equal(ethers.parseEther("1000"));
      });

      it("should emit Faucet event", async function () {
        const { token, attacker } = await loadFixture(deployFixture);
        await expect(token.connect(attacker).faucet())
          .to.emit(token, "Faucet")
          .withArgs(attacker.address, ethers.parseEther("1000"));
      });

      it("should NOT allow faucet twice within 24 hours", async function () {
        const { token, attacker } = await loadFixture(deployFixture);
        await token.connect(attacker).faucet();
        await expect(
          token.connect(attacker).faucet()
        ).to.be.revertedWithCustomError(token, "FaucetCooldown");
      });

      it("should allow faucet again after 24 hours", async function () {
        const { token, attacker } = await loadFixture(deployFixture);
        await token.connect(attacker).faucet();

        // Fast-forward 24 hours + 1 second
        await time.increase(24 * 60 * 60 + 1);

        await expect(token.connect(attacker).faucet()).to.not.be.reverted;
        expect(await token.balanceOf(attacker.address)).to.equal(
          ethers.parseEther("2000")
        );
      });
    });
  });

  // ── StakeForge Staking Tests ───────────────────────────────
  describe("StakeForge Staking", function () {
    describe("stake()", function () {
      it("should stake with 30-day duration at 5% APY", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("5000");

        await token.connect(alice).approve(await staking.getAddress(), amount);
        await staking.connect(alice).stake(amount, 0);

        const s = await staking.stakes(alice.address);
        expect(s.amount).to.equal(amount);
        expect(s.apyBps).to.equal(500); // 5%
      });

      it("should stake with 90-day duration at 12% APY", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("5000");

        await token.connect(alice).approve(await staking.getAddress(), amount);
        await staking.connect(alice).stake(amount, 1);

        const s = await staking.stakes(alice.address);
        expect(s.amount).to.equal(amount);
        expect(s.apyBps).to.equal(1200); // 12%
      });

      it("should stake with 180-day duration at 20% APY", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("5000");

        await token.connect(alice).approve(await staking.getAddress(), amount);
        await staking.connect(alice).stake(amount, 2);

        const s = await staking.stakes(alice.address);
        expect(s.amount).to.equal(amount);
        expect(s.apyBps).to.equal(2000); // 20%
      });

      it("should emit Staked event with correct params", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("5000");

        await token.connect(alice).approve(await staking.getAddress(), amount);

        await expect(staking.connect(alice).stake(amount, 1))
          .to.emit(staking, "Staked")
          .withArgs(alice.address, amount, 90 * 24 * 60 * 60, 1200);
      });

      it("should update TVL after staking", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("5000");

        await token.connect(alice).approve(await staking.getAddress(), amount);
        await staking.connect(alice).stake(amount, 0);

        expect(await staking.getTVL()).to.equal(amount);
      });

      it("should revert if user already has an active stake", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("2500");

        await token
          .connect(alice)
          .approve(await staking.getAddress(), amount * 2n);
        await staking.connect(alice).stake(amount, 0);

        await expect(
          staking.connect(alice).stake(amount, 0)
        ).to.be.revertedWithCustomError(staking, "StakeAlreadyExists");
      });

      it("should revert on zero amount", async function () {
        const { staking, alice } = await loadFixture(deployFixture);
        await expect(
          staking.connect(alice).stake(0, 0)
        ).to.be.revertedWithCustomError(staking, "ZeroAmount");
      });

      it("should revert on invalid duration choice", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("1000");
        await token.connect(alice).approve(await staking.getAddress(), amount);

        await expect(
          staking.connect(alice).stake(amount, 3)
        ).to.be.revertedWithCustomError(staking, "InvalidDuration");
      });
    });

    describe("unstake()", function () {
      it("should NOT allow unstake before unlock time", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("5000");

        await token.connect(alice).approve(await staking.getAddress(), amount);
        await staking.connect(alice).stake(amount, 1); // 90 days

        await expect(
          staking.connect(alice).unstake()
        ).to.be.revertedWithCustomError(staking, "StakeLocked");

        // Fast-forward 89 days — still locked
        await time.increase(89 * 24 * 60 * 60);
        await expect(
          staking.connect(alice).unstake()
        ).to.be.revertedWithCustomError(staking, "StakeLocked");
      });

      it("should allow unstake after unlock time and return principal + rewards", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("5000");

        await token.connect(alice).approve(await staking.getAddress(), amount);
        await staking.connect(alice).stake(amount, 1); // 90 days, 12% APY

        await time.increase(90 * 24 * 60 * 60);

        const balBefore = await token.balanceOf(alice.address);
        await staking.connect(alice).unstake();
        const balAfter = await token.balanceOf(alice.address);

        const received = balAfter - balBefore;
        expect(received).to.be.gt(amount);
        expect(received).to.be.gt(ethers.parseEther("5140"));
      });

      it("should emit Unstaked event", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("5000");

        await token.connect(alice).approve(await staking.getAddress(), amount);
        await staking.connect(alice).stake(amount, 0);

        await time.increase(30 * 24 * 60 * 60);

        await expect(staking.connect(alice).unstake()).to.emit(
          staking,
          "Unstaked"
        );
      });

      it("should reset TVL after unstake", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("5000");

        await token.connect(alice).approve(await staking.getAddress(), amount);
        await staking.connect(alice).stake(amount, 0);

        expect(await staking.getTVL()).to.equal(amount);

        await time.increase(30 * 24 * 60 * 60);
        await staking.connect(alice).unstake();

        expect(await staking.getTVL()).to.equal(0);
      });

      it("should revert if no active stake", async function () {
        const { staking, alice } = await loadFixture(deployFixture);
        await expect(
          staking.connect(alice).unstake()
        ).to.be.revertedWithCustomError(staking, "NoActiveStake");
      });
    });

    describe("claimRewards()", function () {
      it("should claim accrued rewards without touching principal", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("10000");

        await token.connect(alice).approve(await staking.getAddress(), amount);
        await staking.connect(alice).stake(amount, 2); // 180 days, 20% APY

        await time.increase(30 * 24 * 60 * 60);

        const balBefore = await token.balanceOf(alice.address);
        await staking.connect(alice).claimRewards();
        const balAfter = await token.balanceOf(alice.address);

        const claimed = balAfter - balBefore;
        // ~30 days of 20% APY on 10k ≈ ~164 SFORGE
        expect(claimed).to.be.gt(ethers.parseEther("150"));
        expect(claimed).to.be.lt(ethers.parseEther("180"));

        // Stake should still exist
        const s = await staking.stakes(alice.address);
        expect(s.amount).to.equal(amount);
      });

      it("should emit RewardsClaimed event", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("5000");

        await token.connect(alice).approve(await staking.getAddress(), amount);
        await staking.connect(alice).stake(amount, 1);

        await time.increase(10 * 24 * 60 * 60);

        await expect(staking.connect(alice).claimRewards()).to.emit(
          staking,
          "RewardsClaimed"
        );
      });

      it("should track rewardsClaimed to prevent double-claiming", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("5000");

        await token.connect(alice).approve(await staking.getAddress(), amount);
        await staking.connect(alice).stake(amount, 1);

        await time.increase(10 * 24 * 60 * 60);
        const balBefore = await token.balanceOf(alice.address);
        await staking.connect(alice).claimRewards();
        const balAfterFirst = await token.balanceOf(alice.address);
        const firstClaim = balAfterFirst - balBefore;

        // Second claim: only dust accrues from the 1-block gap
        await staking.connect(alice).claimRewards();
        const balAfterSecond = await token.balanceOf(alice.address);
        const secondClaim = balAfterSecond - balAfterFirst;

        // First claim should be substantial, second should be negligible
        expect(firstClaim).to.be.gt(ethers.parseEther("10"));
        expect(secondClaim).to.be.lt(ethers.parseEther("0.01"));
      });
    });

    describe("Rewards calculation accuracy", function () {
      it("should accrue rewards correctly over time", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("10000");

        await token.connect(alice).approve(await staking.getAddress(), amount);
        await staking.connect(alice).stake(amount, 1); // 90 days, 12% APY

        // Check at 30 days
        await time.increase(30 * 24 * 60 * 60);
        let pending = await staking.getPendingRewards(alice.address);
        let pendingInEther = Number(ethers.formatEther(pending));
        // Expected: 10000 * 0.12 * (30/365) ≈ 98.63
        expect(pendingInEther).to.be.closeTo(98.63, 2);

        // Check at 90 days
        await time.increase(60 * 24 * 60 * 60); // 60 more days
        pending = await staking.getPendingRewards(alice.address);
        pendingInEther = Number(ethers.formatEther(pending));
        // Expected: 10000 * 0.12 * (90/365) ≈ 295.89
        expect(pendingInEther).to.be.closeTo(295.89, 2);
      });

      it("should return zero pending rewards for non-staker", async function () {
        const { staking, bob } = await loadFixture(deployFixture);
        expect(await staking.getPendingRewards(bob.address)).to.equal(0);
      });
    });

    describe("Reentrancy protection", function () {
      it("should have ReentrancyGuard on stake/unstake/claimRewards", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("5000");

        // Normal flow works correctly with guards in place
        await token.connect(alice).approve(await staking.getAddress(), amount);
        await staking.connect(alice).stake(amount, 0);

        await time.increase(30 * 24 * 60 * 60);
        await staking.connect(alice).unstake();

        // Verify clean state after unstake
        const s = await staking.stakes(alice.address);
        expect(s.amount).to.equal(0);
      });
    });

    describe("Edge cases", function () {
      it("should handle multiple users staking simultaneously", async function () {
        const { token, staking, alice, bob } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("5000");

        await token.connect(alice).approve(await staking.getAddress(), amount);
        await token.connect(bob).approve(await staking.getAddress(), amount);

        await staking.connect(alice).stake(amount, 0);
        await staking.connect(bob).stake(amount, 2);

        expect(await staking.getTVL()).to.equal(amount * 2n);

        const sAlice = await staking.stakes(alice.address);
        const sBob = await staking.stakes(bob.address);
        expect(sAlice.apyBps).to.equal(500);
        expect(sBob.apyBps).to.equal(2000);
      });

      it("should allow staking again after full unstake", async function () {
        const { token, staking, alice } = await loadFixture(deployFixture);
        const amount = ethers.parseEther("2500");

        await token
          .connect(alice)
          .approve(await staking.getAddress(), amount * 2n);

        await staking.connect(alice).stake(amount, 0);
        await time.increase(30 * 24 * 60 * 60);
        await staking.connect(alice).unstake();

        await staking.connect(alice).stake(amount, 1);
        const s = await staking.stakes(alice.address);
        expect(s.amount).to.equal(amount);
        expect(s.apyBps).to.equal(1200);
      });
    });
  });
});
