const hre = require("hardhat");

async function main() {
  const contractAddress = "0x8b0c3e39e1fF40001D94B0f2094b64aDF4406d58";
  
  // Get the contract instance
  const Trick42Token = await hre.ethers.getContractFactory("Trick42Token");
  const token = await Trick42Token.attach(contractAddress);
  
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("🛹 Testing 42Skate Token Functions...");
  console.log("Contract Address:", contractAddress);
  console.log("Your Address:", deployer.address);
  
  // Check token info
  console.log("\n📊 Token Information:");
  console.log("- Name:", await token.name());
  console.log("- Symbol:", await token.symbol());
  console.log("- Decimals:", await token.decimals());
  console.log("- Your Balance:", hre.ethers.formatEther(await token.balanceOf(deployer.address)), "42SK8");
  console.log("- Total Supply:", hre.ethers.formatEther(await token.totalSupply()), "42SK8");
  console.log("- Max Supply:", hre.ethers.formatEther(await token.MAX_SUPPLY()), "42SK8");
  
  // Check metadata
  console.log("\n🎨 Token Metadata:");
  console.log("- Logo URI:", await token.logoURI());
  console.log("- Website:", await token.website());
  console.log("- Description:", await token.description());
  
  // Check validator status
  console.log("\n🔐 Validator Status:");
  const validatorInfo = await token.getValidatorInfo(deployer.address);
  console.log("- Is Active:", validatorInfo.isActive);
  console.log("- Total Validations:", validatorInfo.totalValidations.toString());
  console.log("- Reputation:", validatorInfo.reputation.toString());
  
  console.log("\n✅ Token is working correctly!");
  console.log("\n🌐 View on BSCScan:");
  console.log(`https://testnet.bscscan.com/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
