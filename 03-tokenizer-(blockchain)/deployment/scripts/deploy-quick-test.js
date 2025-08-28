const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🛹 Quick SKATE42Token Deployment Test");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("🔑 Deploying with account:", deployer.address);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH/BNB");
  
  if (balance === 0n) {
    console.log("❌ No balance! Get test funds from faucet");
    if (hre.network.name === 'bnbTestnet') {
      console.log("🔗 BSC Testnet Faucet: https://testnet.bnbchain.org/faucet-smart");
    }
    return;
  }
  
  console.log("\n📝 Deploying SKATE42Token contract...");
  
  try {
    // Deploy the contract
    const Trick42Token = await hre.ethers.getContractFactory("Trick42Token");
    const trick42Token = await Trick42Token.deploy();
    
    console.log("⏳ Waiting for deployment...");
    await trick42Token.waitForDeployment();
    
    const contractAddress = await trick42Token.getAddress();
    console.log("✅ SKATE42Token deployed to:", contractAddress);
    
    // Quick verification without hanging
    console.log("\n🔍 Quick verification...");
    const name = await trick42Token.name();
    const symbol = await trick42Token.symbol();
    const decimals = await trick42Token.decimals();
    
    console.log("📊 Contract Details:");
    console.log(`  📛 Name: ${name}`);
    console.log(`  🏷️  Symbol: ${symbol}`);
    console.log(`  🔢 Decimals: ${decimals}`);
    
    // Save deployment info
    const deploymentInfo = {
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      token: contractAddress,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      name: name,
      symbol: symbol,
      decimals: decimals
    };
    
    // Save to multiple locations for compatibility
    const paths = [
      path.join(process.cwd(), 'deployment-info.json'),
      path.join(process.cwd(), '..', 'code', 'deployment-info.json')
    ];
    
    for (const deployPath of paths) {
      try {
        const dir = path.dirname(deployPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(deployPath, JSON.stringify(deploymentInfo, null, 2));
        console.log(`💾 Saved deployment info: ${deployPath}`);
      } catch (error) {
        console.log(`⚠️  Could not save to ${deployPath}`);
      }
    }
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📄 Contract Address: ${contractAddress}`);
    console.log(`🌐 Network: ${hre.network.name}`);
    
    if (hre.network.name === 'bnbTestnet') {
      console.log(`🔗 BSCScan: https://testnet.bscscan.com/address/${contractAddress}`);
    } else if (hre.network.name === 'localhost') {
      console.log("🏠 Deployed on local network");
    }
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    // Common error solutions
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solution: Get more test funds from faucet");
      if (hre.network.name === 'bnbTestnet') {
        console.log("🔗 https://testnet.bnbchain.org/faucet-smart");
      }
    } else if (error.message.includes("nonce")) {
      console.log("\n💡 Solution: Reset MetaMask account nonce or wait a moment");
    } else if (error.message.includes("gas")) {
      console.log("\n💡 Solution: Increase gas limit in hardhat.config.js");
    }
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Script execution failed:", error);
      process.exit(1);
    });
}

module.exports = { main };
