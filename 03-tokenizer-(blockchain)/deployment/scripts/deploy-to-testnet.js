const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying SKATE42Token with MultiSig to BSC Testnet");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Get deployer (your MetaMask account)
    const [deployer] = await ethers.getSigners();
    
    console.log("🔑 Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "BNB");
    
    if (balance < ethers.parseEther("0.1")) {
        console.log("⚠️  WARNING: Low balance! You need at least 0.1 BNB for deployment");
        console.log("💡 Get testnet BNB from: https://testnet.binance.org/faucet-smart");
    }
    
    // For testing, we'll use your account plus some test addresses
    // In production, you'd use 3 different trusted accounts
    console.log("\n👥 MultiSig Configuration:");
    console.log("🔑 Owner 1: Your MetaMask account");
    console.log("🤖 Owner 2 & 3: Test addresses (you control via private key)");
    
    const multisigOwners = [
        deployer.address, // Your MetaMask account
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat test account 1
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"  // Hardhat test account 2
    ];
    
    console.log("Owners:", multisigOwners);
    
    // Deploy SimpleMultiSigWallet
    console.log("\n📋 Deploying SimpleMultiSigWallet...");
    const SimpleMultiSigWallet = await ethers.getContractFactory("SimpleMultiSigWallet");
    const multisigWallet = await SimpleMultiSigWallet.deploy(
        multisigOwners,
        2 // 2 confirmations needed (since you only control 1 account in practice)
    );
    
    console.log("⏳ Waiting for deployment...");
    await multisigWallet.waitForDeployment();
    const multisigAddress = await multisigWallet.getAddress();
    console.log("✅ SimpleMultiSigWallet deployed to:", multisigAddress);
    
    // Deploy SKATE42Token
    console.log("\n🎯 Deploying SKATE42Token...");
    const SKATE42Token = await ethers.getContractFactory("Trick42Token");
    const token = await SKATE42Token.deploy();
    
    console.log("⏳ Waiting for deployment...");
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("✅ SKATE42Token deployed to:", tokenAddress);
    
    // Wait a bit for the transactions to be mined
    console.log("\n⏳ Waiting for confirmations...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log("\n🔐 Setting up governance...");
    
    // Grant admin roles to multisig
    const ADMIN_ROLE = await token.ADMIN_ROLE();
    const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
    
    console.log("Granting ADMIN_ROLE to multisig...");
    const grantTx1 = await token.grantRole(ADMIN_ROLE, multisigAddress);
    await grantTx1.wait();
    console.log("✅ ADMIN_ROLE granted");
    
    console.log("Granting DEFAULT_ADMIN_ROLE to multisig...");
    const grantTx2 = await token.grantRole(DEFAULT_ADMIN_ROLE, multisigAddress);
    await grantTx2.wait();
    console.log("✅ DEFAULT_ADMIN_ROLE granted");
    
    // Create transaction to revoke deployer's admin roles
    console.log("Creating multisig transaction to revoke deployer admin roles...");
    const revokeAdminData = token.interface.encodeFunctionData("revokeRole", [
        ADMIN_ROLE,
        deployer.address
    ]);
    
    const submitTx1 = await multisigWallet.submitTransaction(tokenAddress, 0, revokeAdminData);
    await submitTx1.wait();
    console.log("✅ Admin role revocation transaction submitted and executed");
    
    const revokeDefaultAdminData = token.interface.encodeFunctionData("revokeRole", [
        DEFAULT_ADMIN_ROLE,
        deployer.address
    ]);
    
    const submitTx2 = await multisigWallet.submitTransaction(tokenAddress, 0, revokeDefaultAdminData);
    await submitTx2.wait();
    console.log("✅ Default admin role revocation transaction submitted and executed");
    
    // Verify governance transfer
    console.log("\n🔍 Verifying governance transfer...");
    const multisigHasAdmin = await token.hasRole(ADMIN_ROLE, multisigAddress);
    const deployerHasAdmin = await token.hasRole(ADMIN_ROLE, deployer.address);
    
    console.log("✅ MultiSig has ADMIN_ROLE:", multisigHasAdmin);
    console.log("❌ Deployer has ADMIN_ROLE:", deployerHasAdmin);
    
    if (!multisigHasAdmin || deployerHasAdmin) {
        throw new Error("❌ Governance transfer failed!");
    }
    
    console.log("\n📊 Deployment Summary");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏦 SimpleMultiSigWallet:", multisigAddress);
    console.log("🎯 SKATE42Token:", tokenAddress);
    console.log("🌐 Network: BSC Testnet (Chain ID: 97)");
    console.log("💰 Deployer:", deployer.address);
    
    console.log("\n🔗 BSCScan Links:");
    console.log("MultiSig:", `https://testnet.bscscan.com/address/${multisigAddress}`);
    console.log("Token:", `https://testnet.bscscan.com/address/${tokenAddress}`);
    
    console.log("\n📱 MetaMask Setup Instructions:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. 🌐 Switch MetaMask to BSC Testnet (Chain ID: 97)");
    console.log("2. 🪙 Add token to MetaMask:");
    console.log("   - Contract Address:", tokenAddress);
    console.log("   - Token Symbol: 42SK8");
    console.log("   - Token Decimals: 18");
    console.log("3. 💰 Get testnet BNB: https://testnet.binance.org/faucet-smart");
    
    console.log("\n🧪 Next Steps for Testing:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. Run: npx hardhat run scripts/test-with-metamask.js --network bnbTestnet");
    console.log("2. Use the interactive testing script");
    console.log("3. Try video submissions and validations");
    
    // Save deployment info for later use
    const deploymentInfo = {
        network: "BSC Testnet",
        chainId: 97,
        multisigWallet: multisigAddress,
        token: tokenAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        bscScanLinks: {
            multisig: `https://testnet.bscscan.com/address/${multisigAddress}`,
            token: `https://testnet.bscscan.com/address/${tokenAddress}`
        }
    };
    
    // Write deployment info to file
    const fs = require('fs');
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to deployment-info.json");
    
    return deploymentInfo;
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = { main };
