const hre = require("hardhat");
const { getContractInstance } = require('../utils/contract-helper');

async function main() {
  // Get contract instance with verification
  const { token, contractAddress } = await getContractInstance(hre);
  
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("💰 Checking your 42SK8 balance...");
  
  // Check your balance
  const balance = await token.balanceOf(deployer.address);
  const totalSupply = await token.totalSupply();
  
  console.log("🏆 Your Balance:", hre.ethers.formatEther(balance), "42SK8");
  console.log("📈 Total Supply:", hre.ethers.formatEther(totalSupply), "42SK8");
  
  if (balance > 0) {
    console.log("🎉 Success! You have 42SK8 tokens!");
    console.log("💡 They should appear in your MetaMask wallet automatically.");
    console.log("🔄 If not visible, try refreshing MetaMask or re-adding the token.");
  } else {
    console.log("ℹ️  You have 0 tokens. To get tokens, you can:");
    console.log("   - Participate in validation activities");
    console.log("   - Use the get-tokens.js script if available");
    console.log("   - Check if tokens need to be minted by an admin");
  }
  
  // Check validator info
  try {
    const validatorInfo = await token.getValidatorInfo(deployer.address);
    console.log("\n📊 Your Validator Stats:");
    console.log("- Total Validations:", validatorInfo.totalValidations.toString());
    console.log("- Total Earned:", hre.ethers.formatEther(validatorInfo.totalEarned), "42SK8");
    console.log("- Reputation:", validatorInfo.reputation.toString());
  } catch (error) {
    console.log("\n⚠️  Could not fetch validator info:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
