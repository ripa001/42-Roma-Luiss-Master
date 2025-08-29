const hre = require("hardhat");
const { getContractInstance } = require('../utils/contract-helper');

async function main() {
  // Get contract instance with verification
  const { token, contractAddress } = await getContractInstance(hre);
  
  const [validator] = await hre.ethers.getSigners();
  
  console.log("🛹 Getting 42SK8 tokens through trick validation...");
  console.log("Your address (validator):", validator.address);
  
  // Create a test wallet for the skater
  const testWallet = hre.ethers.Wallet.createRandom();
  const skaterAddress = testWallet.address;
  
  console.log("Test skater address:", skaterAddress);
  
  console.log("\n📝 Validating tricks for the test skater...");
  
  try {
    // Validate multiple tricks to get tokens
    const tricks = [
      { name: "Ollie", difficulty: 2 },
      { name: "Kickflip", difficulty: 5 },
      { name: "Heelflip", difficulty: 6 },
      { name: "Tre Flip", difficulty: 8 }
    ];
    
    let totalValidatorRewards = 0;
    
    for (let i = 0; i < tricks.length; i++) {
      const trick = tricks[i];
      console.log(`\n🎯 Validating ${trick.name} (difficulty ${trick.difficulty})...`);
      
      const tx = await token.validateTrick(
        skaterAddress,
        trick.name,
        trick.difficulty
      );
      
      console.log("✅ Transaction submitted:", tx.hash);
      
      // Wait for confirmation
      await tx.wait();
      console.log("✅ Transaction confirmed!");
      
      // Calculate expected rewards
      const baseReward = 10;
      const skaterReward = baseReward * trick.difficulty / 2;
      const validatorReward = skaterReward * 0.1; // 10% commission
      totalValidatorRewards += validatorReward;
      
      console.log(`💰 Skater earned: ${skaterReward} 42SK8`);
      console.log(`💰 Validator earned: ${validatorReward} 42SK8`);
      
      // Small delay to avoid rate limiting
      if (i < tricks.length - 1) {
        console.log("⏳ Waiting 5 seconds for cooldown...");
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // Check final balances
    console.log("\n📊 Final Results:");
    const validatorBalance = await token.balanceOf(validator.address);
    const totalSupply = await token.totalSupply();
    
    console.log("🏆 Your Balance:", hre.ethers.formatEther(validatorBalance), "42SK8");
    console.log("📈 Total Supply:", hre.ethers.formatEther(totalSupply), "42SK8");
    console.log(`💎 Expected Validator Rewards: ~${totalValidatorRewards} 42SK8`);
    
    console.log("\n🎉 Success! You now have 42SK8 tokens!");
    console.log("💡 Check your MetaMask wallet - the tokens should appear automatically!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error.message.includes("Validation cooldown")) {
      console.log("ℹ️  Wait 5 minutes between validations for the same validator");
    }
  }
  
  console.log("\n🌐 View on BSCScan:");
  console.log(`https://testnet.bscscan.com/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
