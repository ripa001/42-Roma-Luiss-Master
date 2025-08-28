const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🛹 Starting SKATE42Token Basic Deployment...");
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "BNB");
  
  if (balance === 0n) {
    console.log("❌ No BNB balance! Get test BNB from:");
    console.log("https://testnet.bnbchain.org/faucet-smart");
    process.exit(1);
  }
  
  // Deploy the contract
  console.log("\n📝 Deploying SKATE42Token (Trick42Token)...");
  const Trick42Token = await hre.ethers.getContractFactory("Trick42Token");
  const trick42Token = await Trick42Token.deploy();
  
  console.log("⏳ Waiting for deployment transaction...");
  await trick42Token.waitForDeployment();
  
  const contractAddress = await trick42Token.getAddress();
  console.log("✅ SKATE42Token deployed to:", contractAddress);
  
  // Wait for block confirmations (adaptive based on network)
  console.log("\n⏳ Waiting for block confirmations...");
  const deployTx = trick42Token.deploymentTransaction();
  if (deployTx) {
    // Use 1 confirmation for localhost/hardhat, 3 for testnets
    const confirmations = hre.network.name === 'localhost' || hre.network.name === 'hardhat' ? 1 : 3;
    console.log(`Waiting for ${confirmations} confirmation(s)...`);
    
    try {
      await deployTx.wait(confirmations);
      console.log(`✅ ${confirmations} confirmation(s) received!`);
    } catch (error) {
      console.log("⚠️  Confirmation timeout, but deployment successful");
    }
  }
  
  // Verify contract information
  console.log("\n📊 Contract Information:");
  console.log("- Name:", await trick42Token.name());
  console.log("- Symbol:", await trick42Token.symbol());
  console.log("- Decimals:", await trick42Token.decimals());
  console.log("- Total Supply:", hre.ethers.formatEther(await trick42Token.totalSupply()));
  console.log("- Max Supply:", hre.ethers.formatEther(await trick42Token.MAX_SUPPLY()));
  
  // Verify roles
  console.log("\n🔐 Access Control:");
  const DEFAULT_ADMIN_ROLE = await trick42Token.DEFAULT_ADMIN_ROLE();
  const ADMIN_ROLE = await trick42Token.ADMIN_ROLE();
  const VALIDATOR_ROLE = await trick42Token.VALIDATOR_ROLE();
  
  console.log("- Deployer has DEFAULT_ADMIN_ROLE:", await trick42Token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address));
  console.log("- Deployer has ADMIN_ROLE:", await trick42Token.hasRole(ADMIN_ROLE, deployer.address));
  console.log("- Deployer has VALIDATOR_ROLE:", await trick42Token.hasRole(VALIDATOR_ROLE, deployer.address));
  
  // Save deployment information to code directory (where scripts expect it)
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    token: contractAddress,
    contractAddress: contractAddress, // Legacy compatibility
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: deployTx?.hash || "N/A",
    blockNumber: deployTx?.blockNumber || "N/A"
  };
  
  // Save to code directory for scripts to use
  const codeDir = path.resolve(__dirname, '../../code');
  const deploymentInfoPath = path.join(codeDir, 'deployment-info.json');
  try {
    fs.writeFileSync(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: ${deploymentInfoPath}`);
  } catch (error) {
    console.log("⚠️  Could not save deployment info:", error.message);
    console.log("📁 Trying alternative path...");
    
    // Alternative: save in current directory
    const altPath = path.join(process.cwd(), 'deployment-info.json');
    try {
      fs.writeFileSync(altPath, JSON.stringify(deploymentInfo, null, 2));
      console.log(`💾 Deployment info saved to: ${altPath}`);
    } catch (altError) {
      console.log("❌ Could not save deployment info anywhere");
    }
  }
  
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
      console.log("💡 You can verify manually using:");
      console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
    }
  }
  
  console.log("\n🎉 Basic Deployment Complete!");
  console.log("\n🌐 Important Links:");
  console.log(`📄 Token Contract: https://testnet.bscscan.com/address/${contractAddress}`);
  console.log(`💰 BSC Testnet Faucet: https://testnet.bnbchain.org/faucet-smart`);
  
  console.log("\n📱 MetaMask Integration:");
  console.log(`🔗 Contract Address: ${contractAddress}`);
  console.log("📝 Symbol: 42SK8");
  console.log("🔢 Decimals: 18");
  
  console.log("\n⚠️  Important Notes:");
  console.log("- This is a basic deployment without MultiSig governance");
  console.log("- For production, use deploy-simple-testnet.js or deploy-with-multisig.js");
  console.log("- All admin functions are controlled by the deployer address");
  console.log("- Consider transferring admin roles to a MultiSig wallet");
  
  console.log("\n🎯 Next Steps:");
  console.log("1. Add token to MetaMask using the contract address above");
  console.log("2. Test token functionality with:");
  console.log("   cd ../code && npx hardhat run scripts/test-token.js --network bnbTestnet");
  console.log("3. For production deployment, use:");
  console.log("   npx hardhat run ../deployment/scripts/deploy-simple-testnet.js --network bnbTestnet");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });