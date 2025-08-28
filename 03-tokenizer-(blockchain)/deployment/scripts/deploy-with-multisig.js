const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    const [deployer, owner1, owner2, owner3] = await ethers.getSigners();
    
    console.log("🚀 Deploying contracts with multisig governance...");
    console.log("Deployer:", deployer.address);
    console.log("Multisig owners:", [owner1.address, owner2.address, owner3.address]);
    
    // Deploy SimpleMultiSigWallet
    console.log("\n📋 Deploying SimpleMultiSigWallet...");
    const SimpleMultiSigWallet = await ethers.getContractFactory("SimpleMultiSigWallet");
    const multisigWallet = await SimpleMultiSigWallet.deploy(
        [deployer.address, owner1.address, owner2.address], // Initial owners
        2 // Required confirmations
    );
    await multisigWallet.waitForDeployment();
    console.log("✅ SimpleMultiSigWallet deployed to:", await multisigWallet.getAddress());
    
    // Deploy SKATE42Token
    console.log("\n🎯 Deploying SKATE42Token...");
    const SKATE42Token = await ethers.getContractFactory("Trick42Token");
    const token = await SKATE42Token.deploy();
    await token.waitForDeployment();
    console.log("✅ SKATE42Token deployed to:", await token.getAddress());
    
    // Get contract addresses
    const multisigAddress = await multisigWallet.getAddress();
    const tokenAddress = await token.getAddress();
    
    console.log("\n🔐 Setting up governance structure...");
    
    // Grant admin role to multisig wallet
    const ADMIN_ROLE = await token.ADMIN_ROLE();
    const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
    
    console.log("Granting ADMIN_ROLE to multisig...");
    await token.grantRole(ADMIN_ROLE, multisigAddress);
    
    console.log("Granting DEFAULT_ADMIN_ROLE to multisig...");
    await token.grantRole(DEFAULT_ADMIN_ROLE, multisigAddress);
    
    // Create transaction data to revoke deployer's admin roles
    const revokeAdminData = token.interface.encodeFunctionData("revokeRole", [
        ADMIN_ROLE,
        deployer.address
    ]);
    
    const revokeDefaultAdminData = token.interface.encodeFunctionData("revokeRole", [
        DEFAULT_ADMIN_ROLE,
        deployer.address
    ]);
    
    // Submit transactions to revoke deployer's admin roles via multisig
    console.log("Submitting transaction to revoke deployer's ADMIN_ROLE...");
    await multisigWallet.submitTransaction(tokenAddress, 0, revokeAdminData);
    
    console.log("Submitting transaction to revoke deployer's DEFAULT_ADMIN_ROLE...");
    await multisigWallet.submitTransaction(tokenAddress, 0, revokeDefaultAdminData);
    
    // Additional owner confirms the transactions
    if (owner1) {
        console.log("Owner1 confirming admin role revocation transactions...");
        await multisigWallet.connect(owner1).confirmTransaction(0);
        await multisigWallet.connect(owner1).confirmTransaction(1);
    }
    
    console.log("\n📊 Deployment Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏦 SimpleMultiSigWallet:", multisigAddress);
    console.log("🎯 SKATE42Token:", tokenAddress);
    console.log("👥 Multisig Owners:", await multisigWallet.getOwners());
    console.log("🔢 Required Confirmations:", await multisigWallet.required());
    console.log("📋 Pending Transactions:", await multisigWallet.getTransactionCount());
    
    // Verify token governance transfer
    const hasAdminRole = await token.hasRole(ADMIN_ROLE, multisigAddress);
    const hasDefaultAdminRole = await token.hasRole(DEFAULT_ADMIN_ROLE, multisigAddress);
    const deployerHasAdminRole = await token.hasRole(ADMIN_ROLE, deployer.address);
    const deployerHasDefaultAdminRole = await token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    
    console.log("\n🔐 Governance Status:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Multisig has ADMIN_ROLE:", hasAdminRole);
    console.log("Multisig has DEFAULT_ADMIN_ROLE:", hasDefaultAdminRole);
    console.log("Deployer has ADMIN_ROLE:", deployerHasAdminRole);
    console.log("Deployer has DEFAULT_ADMIN_ROLE:", deployerHasDefaultAdminRole);
    
    // Create helper functions for multisig interactions
    console.log("\n📝 Sample multisig operations:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Example: Add validator via multisig
    const newValidatorAddress = "0x1234567890123456789012345678901234567890";
    const addValidatorData = token.interface.encodeFunctionData("addValidator", [newValidatorAddress]);
    
    console.log("To add a validator via multisig:");
    console.log(`await multisigWallet.submitTransaction("${tokenAddress}", 0, "${addValidatorData}");`);
    
    // Example: Update validator reputation via multisig
    const updateReputationData = token.interface.encodeFunctionData("updateValidatorReputation", [
        newValidatorAddress,
        150
    ]);
    
    console.log("To update validator reputation via multisig:");
    console.log(`await multisigWallet.submitTransaction("${tokenAddress}", 0, "${updateReputationData}");`);
    
    // Example: Pause contract via multisig
    const pauseData = token.interface.encodeFunctionData("pause", []);
    
    console.log("To pause the contract via multisig:");
    console.log(`await multisigWallet.submitTransaction("${tokenAddress}", 0, "${pauseData}");`);
    
    console.log("\n✅ Deployment and governance setup complete!");
    console.log("🔒 Token is now governed by the multisig wallet");
    console.log("👥 All admin operations require multiple signatures");
    
    return {
        multisigWallet: multisigAddress,
        token: tokenAddress,
        owners: await multisigWallet.getOwners(),
        required: await multisigWallet.required()
    };
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
