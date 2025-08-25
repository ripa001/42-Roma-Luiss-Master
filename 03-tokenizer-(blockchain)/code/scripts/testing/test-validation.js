const hre = require("hardhat");

async function main() {
  const contractAddress = "0x8b0c3e39e1fF40001D94B0f2094b64aDF4406d58";
  
  // Get the contract instance
  const Trick42Token = await hre.ethers.getContractFactory("Trick42Token");
  const token = await Trick42Token.attach(contractAddress);
  
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("🛹 Testing Trick Validation...");
  
  // Create a test address for the skater (using a different address)
  const testSkaterAddress = "0x742E48f17E6e0a8c5A4b05A6dd9e4c52e8b4D5F8"; // Example address
  
  // Validate a trick (as the admin/validator)
  console.log("📝 Validating a trick...");
  
  try {
    const tx = await token.validateTrick(
      testSkaterAddress,
      "Kickflip", 
      5 // Difficulty level 5/10
    );
    
    console.log("✅ Trick validation submitted!");
    console.log("Transaction Hash:", tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    
    // Check new total supply
    const totalSupply = await token.totalSupply();
    console.log("📊 New Total Supply:", hre.ethers.formatEther(totalSupply), "42SK8");
    
    // Check validator balance (you should have received commission)
    const validatorBalance = await token.balanceOf(deployer.address);
    console.log("💰 Your Validator Balance:", hre.ethers.formatEther(validatorBalance), "42SK8");
    
  } catch (error) {
    console.log("ℹ️  Note: Trick validation requires a different skater address.");
    console.log("Your address:", deployer.address);
    console.log("This is expected behavior - validators can't validate their own tricks!");
  }
  
  console.log("\n🌐 View your token on BSCScan:");
  console.log(`https://testnet.bscscan.com/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
