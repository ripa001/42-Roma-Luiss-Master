const hre = require("hardhat");

async function main() {
  console.log("🛹 Starting 42Skate Token deployment...");
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "BNB");
  
  // Deploy the contract
  console.log("\n📝 Deploying 42Skate Token...");
  const Trick42Token = await hre.ethers.getContractFactory("Trick42Token");
  const trick42Token = await Trick42Token.deploy();
  
  await trick42Token.waitForDeployment();
  
  console.log("✅ 42Skate Token deployed to:", await trick42Token.getAddress());
  
  // Wait for block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  const deployTx = trick42Token.deploymentTransaction();
  await deployTx.wait(5);
  
  const contractAddress = await trick42Token.getAddress();
  
  // Verify contract information
  console.log("\n📊 Contract Information:");
  console.log("- Name:", await trick42Token.name());
  console.log("- Symbol:", await trick42Token.symbol());
  console.log("- Decimals:", await trick42Token.decimals());
  console.log("- Total Supply:", hre.ethers.formatEther(await trick42Token.totalSupply()));
  console.log("- Max Supply:", hre.ethers.formatEther(await trick42Token.MAX_SUPPLY()));
  
  // Verify roles
  console.log("\n🔐 Access Control:");
  console.log("- Deployer has DEFAULT_ADMIN_ROLE:", await trick42Token.hasRole(await trick42Token.DEFAULT_ADMIN_ROLE(), deployer.address));
  console.log("- Deployer has ADMIN_ROLE:", await trick42Token.hasRole(await trick42Token.ADMIN_ROLE(), deployer.address));
  console.log("- Deployer has VALIDATOR_ROLE:", await trick42Token.hasRole(await trick42Token.VALIDATOR_ROLE(), deployer.address));
  
  // Save deployment information
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: deployTx.hash,
    blockNumber: deployTx.blockNumber
  };
  
  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Verify on BscScan if not on localhost
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verifying contract on BscScan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on BscScan");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
      console.log("You can verify manually using:");
      console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
    }
  }
  
  console.log("\n🎉 Deployment complete!");
  console.log("\n🌐 View on BscScan:");
  console.log(`https://testnet.bscscan.com/address/${contractAddress}`);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });