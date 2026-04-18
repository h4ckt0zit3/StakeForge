import hre from "hardhat";
import fs from "fs";
import path from "path";
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("═══════════════════════════════════════════");
  console.log("  StakeForge — Deployment Script");
  console.log("═══════════════════════════════════════════");
  console.log(`  Deployer : ${deployer.address}`);
  console.log(`  Network  : ${hre.network.name}`);
  console.log(`  Balance  : ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  console.log("───────────────────────────────────────────");

  // 1. Deploy SFORGE Token
  console.log("\n▸ Deploying SFORGEToken...");
  const SFORGEToken = await ethers.getContractFactory("SFORGEToken");
  const token = await SFORGEToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`  ✓ SFORGEToken deployed at: ${tokenAddress}`);

  // 2. Deploy StakeForge staking contract
  console.log("\n▸ Deploying StakeForge...");
  const StakeForge = await ethers.getContractFactory("StakeForge");
  const staking = await StakeForge.deploy(tokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log(`  ✓ StakeForge  deployed at: ${stakingAddress}`);

  // 3. Fund the staking contract's reward pool
  console.log("\n▸ Funding reward pool (200,000 SFORGE)...");
  const rewardPool = ethers.parseEther("200000");
  const tx = await token.transfer(stakingAddress, rewardPool);
  await tx.wait();
  console.log(`  ✓ Transferred ${ethers.formatEther(rewardPool)} SFORGE to staking contract`);

  // Summary
  console.log("\n═══════════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════════");
  console.log(`  SFORGEToken : ${tokenAddress}`);
  console.log(`  StakeForge  : ${stakingAddress}`);
  console.log(`  Reward Pool : ${ethers.formatEther(rewardPool)} SFORGE`);
  console.log("═══════════════════════════════════════════\n");

  // 4. Auto-update frontend config with deployed addresses
  const configPath = path.resolve("frontend/src/config.js");
  if (fs.existsSync(configPath)) {
    let config = fs.readFileSync(configPath, "utf8");
    config = config.replace(
      /SFORGE_TOKEN:\s*"0x[0-9a-fA-F]+"/,
      `SFORGE_TOKEN: "${tokenAddress}"`
    );
    config = config.replace(
      /STAKE_FORGE:\s*"0x[0-9a-fA-F]+"/,
      `STAKE_FORGE: "${stakingAddress}"`
    );
    fs.writeFileSync(configPath, config, "utf8");
    console.log("  ✓ Updated frontend/src/config.js with deployed addresses\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
