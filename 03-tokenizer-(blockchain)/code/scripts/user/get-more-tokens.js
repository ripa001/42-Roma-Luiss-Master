const hre = require("hardhat");
const { getContractInstance } = require('../utils/contract-helper');

async function main() {
  // Get contract instance with verification
  const { token, contractAddress } = await getContractInstance(hre);
  
  const [validator] = await hre.ethers.getSigners();
  
  console.log("🛹 Getting more 42SK8 tokens with multiple skaters...");
  console.log("Your address (validator):", validator.address);
  
  // Create multiple test skaters
  const skaters = [
    { wallet: hre.ethers.Wallet.createRandom(), trick: "Shuvit", difficulty: 3 },
    { wallet: hre.ethers.Wallet.createRandom(), trick: "Pop Shuvit", difficulty: 4 },
    { wallet: hre.ethers.Wallet.createRandom(), trick: "Frontside 180", difficulty: 4 },
    { wallet: hre.ethers.Wallet.createRandom(), trick: "Backside 180", difficulty: 5 }
  ];
  
  console.log(`\n📝 Validating tricks for ${skaters.length} different skaters...`);
  
  try {
    let totalValidatorRewards = 0;
    
    for (let i = 0; i < skaters.length; i++) {
      const skater = skaters[i];
      
      console.log(`\n🎯 Skater ${i + 1}: ${skater.trick} (difficulty ${skater.difficulty})`);
      console.log(`   Address: ${skater.wallet.address}`);
      
      const tx = await token.validateTrick(
        skater.wallet.address,
        skater.trick,
        skater.difficulty
      );
      
      console.log("✅ Transaction submitted:", tx.hash);
      await tx.wait();
      console.log("✅ Transaction confirmed!");
      
      // Calculate rewards
      const baseReward = 10;
      const skaterReward = baseReward * skater.difficulty / 2;
      const validatorReward = skaterReward * 0.1; // 10% commission
      totalValidatorRewards += validatorReward;
      
      console.log(`💰 Skater earned: ${skaterReward} 42SK8`);
      console.log(`💰 You earned: ${validatorReward} 42SK8`);
      
      // Small delay between validations
      if (i < skaters.length - 1) {
        console.log("⏳ Waiting 1 second...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Check final balance
    console.log("\n📊 Final Results:");
    const validatorBalance = await token.balanceOf(validator.address);
    const totalSupply = await token.totalSupply();
    
    console.log("🏆 Your New Balance:", hre.ethers.formatEther(validatorBalance), "42SK8");
    console.log("📈 Total Supply:", hre.ethers.formatEther(totalSupply), "42SK8");
    console.log(`💎 Additional Rewards: ~${totalValidatorRewards} 42SK8`);
    
    console.log("\n🎉 Success! You now have more 42SK8 tokens!");
    console.log("💡 Check your MetaMask - tokens should appear automatically!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error.message.includes("cooldown")) {
      console.log("ℹ️  Cooldown is per validator, not per skater - this should work!");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
