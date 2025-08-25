const hre = require("hardhat");

async function main() {
  const contractAddress = "0x8b0c3e39e1fF40001D94B0f2094b64aDF4406d58";
  
  // Get the contract instance
  const Trick42Token = await hre.ethers.getContractFactory("Trick42Token");
  const token = await Trick42Token.attach(contractAddress);
  
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
  }
  
  // Check validator info
  const validatorInfo = await token.getValidatorInfo(deployer.address);
  console.log("\n📊 Your Validator Stats:");
  console.log("- Total Validations:", validatorInfo.totalValidations.toString());
  console.log("- Total Earned:", hre.ethers.formatEther(validatorInfo.totalEarned), "42SK8");
  console.log("- Reputation:", validatorInfo.reputation.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
