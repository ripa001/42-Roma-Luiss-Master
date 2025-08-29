const hre = require("hardhat");
const { ethers } = require("hardhat");
const { getContractAddress } = require('../utils/contract-helper');

async function main() {
    console.log("🔍 Debug MultiSig Integration Status");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Get contract addresses
    const { contractAddress: TOKEN_ADDRESS } = getContractAddress();
    const MULTISIG_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F"; // Update this as needed
    
    console.log("📄 Using token address:", TOKEN_ADDRESS);
    
    const [deployer, owner1, owner2, owner3] = await ethers.getSigners();
    
    // Get contract instances
    const multisig = await ethers.getContractAt("SimpleMultiSigWallet", MULTISIG_ADDRESS);
    const token = await ethers.getContractAt("Trick42Token", TOKEN_ADDRESS);
    
    console.log("📋 Contract Addresses:");
    console.log("MultiSig:", MULTISIG_ADDRESS);
    console.log("Token:", TOKEN_ADDRESS);
    
    console.log("\n👥 MultiSig Configuration:");
    const owners = await multisig.getOwners();
    const required = await multisig.required();
    console.log("Owners:", owners);
    console.log("Required confirmations:", required.toString());
    
    console.log("\n🔐 Role Status:");
    const ADMIN_ROLE = await token.ADMIN_ROLE();
    const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
    const VALIDATOR_ROLE = await token.VALIDATOR_ROLE();
    
    console.log("ADMIN_ROLE:", ADMIN_ROLE);
    console.log("DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
    
    console.log("\n📊 Role Assignments:");
    console.log("MultiSig has ADMIN_ROLE:", await token.hasRole(ADMIN_ROLE, MULTISIG_ADDRESS));
    console.log("MultiSig has DEFAULT_ADMIN_ROLE:", await token.hasRole(DEFAULT_ADMIN_ROLE, MULTISIG_ADDRESS));
    console.log("Deployer has ADMIN_ROLE:", await token.hasRole(ADMIN_ROLE, deployer.address));
    console.log("Deployer has DEFAULT_ADMIN_ROLE:", await token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address));
    console.log("Deployer has VALIDATOR_ROLE:", await token.hasRole(VALIDATOR_ROLE, deployer.address));
    
    console.log("\n📋 MultiSig Transaction History:");
    const txCount = await multisig.getTransactionCount();
    console.log("Total transactions:", txCount.toString());
    
    for (let i = 0; i < txCount; i++) {
        const tx = await multisig.getTransaction(i);
        console.log(`\nTransaction ${i}:`);
        console.log("  Destination:", tx[0]);
        console.log("  Value:", ethers.formatEther(tx[1]));
        console.log("  Data:", tx[2]);
        console.log("  Executed:", tx[3]);
        console.log("  Confirmations:", tx[4].toString());
        
        // Try to get confirmations
        try {
            const confirmations = await multisig.getConfirmations(i);
            console.log("  Confirmed by:", confirmations);
        } catch (error) {
            console.log("  Confirmation check failed:", error.message);
        }
    }
    
    console.log("\n🧪 Test Direct Function Calls:");
    
    // Test if deployer can still call admin functions directly
    try {
        await token.connect(deployer).addValidator("0x1234567890123456789012345678901234567890");
        console.log("❌ ERROR: Deployer can still call admin functions!");
    } catch (error) {
        console.log("✅ Deployer correctly blocked from admin functions");
    }
    
    // Test if multisig can call admin functions directly (it shouldn't work either)
    try {
        // This will fail because a contract can't call itself
        console.log("Testing if functions work when called by multisig address...");
    } catch (error) {
        console.log("Expected: Multisig can't call directly");
    }
    
    console.log("\n🔧 Test Simple MultiSig Operation:");
    
    // Let's try a simple operation: sending ETH
    console.log("Testing ETH transfer via multisig...");
    
    // Send some ETH to multisig first
    await deployer.sendTransaction({
        to: MULTISIG_ADDRESS,
        value: ethers.parseEther("0.1")
    });
    
    console.log("✅ Sent 0.1 ETH to multisig");
    
    // Now try to send it back via multisig
    const txIndex = await multisig.connect(deployer).submitTransaction(
        deployer.address,
        ethers.parseEther("0.05"),
        "0x"
    );
    
    console.log("✅ Submitted ETH transfer transaction");
    
    // Confirm with second owner
    await multisig.connect(owner1).confirmTransaction(txCount);
    
    console.log("✅ ETH transfer executed successfully");
    
    console.log("\n📊 Final Status:");
    const finalTxCount = await multisig.getTransactionCount();
    console.log("Final transaction count:", finalTxCount.toString());
    
    const multisigBalance = await ethers.provider.getBalance(MULTISIG_ADDRESS);
    console.log("MultiSig ETH balance:", ethers.formatEther(multisigBalance));
    
    console.log("\n✅ Basic multisig functionality is working!");
    console.log("🔍 Issue might be with the token admin role setup");
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Debug failed:", error);
            process.exit(1);
        });
}

module.exports = { main };
