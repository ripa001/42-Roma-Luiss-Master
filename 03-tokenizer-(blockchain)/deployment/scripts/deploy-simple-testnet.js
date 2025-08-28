const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying SKATE42Token to BSC Testnet (Single Owner Mode)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Get deployer (your MetaMask account)
    const [deployer] = await ethers.getSigners();
    
    console.log("🔑 Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "BNB");
    
    if (balance < ethers.parseEther("0.05")) {
        console.log("⚠️  WARNING: Low balance! You need at least 0.05 BNB for deployment");
        console.log("💡 Get testnet BNB from: https://testnet.binance.org/faucet-smart");
        return;
    }
    
    // Deploy SKATE42Token first
    console.log("\n🎯 Deploying SKATE42Token...");
    const SKATE42Token = await ethers.getContractFactory("Trick42Token");
    const token = await SKATE42Token.deploy();
    
    console.log("⏳ Waiting for deployment...");
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("✅ SKATE42Token deployed to:", tokenAddress);
    
    // Deploy a 1-of-1 MultiSig for testing (you are the only owner)
    console.log("\n📋 Deploying SimpleMultiSigWallet (Testing Mode)...");
    console.log("💡 For testing: 1-of-1 multisig with your account only");
    
    const SimpleMultiSigWallet = await ethers.getContractFactory("SimpleMultiSigWallet");
    const multisigWallet = await SimpleMultiSigWallet.deploy(
        [deployer.address], // Only your account
        1 // Only 1 confirmation needed
    );
    
    console.log("⏳ Waiting for deployment...");
    await multisigWallet.waitForDeployment();
    const multisigAddress = await multisigWallet.getAddress();
    console.log("✅ SimpleMultiSigWallet deployed to:", multisigAddress);
    
    // Wait a bit for confirmations
    console.log("\n⏳ Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 10000));
    
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
    
    // Now revoke deployer's roles via multisig
    console.log("\n🏛️  Using multisig to revoke deployer admin roles...");
    
    const revokeAdminData = token.interface.encodeFunctionData("revokeRole", [
        ADMIN_ROLE,
        deployer.address
    ]);
    
    const submitTx1 = await multisigWallet.submitTransaction(tokenAddress, 0, revokeAdminData);
    await submitTx1.wait();
    console.log("✅ Admin role revoked via multisig");
    
    const revokeDefaultAdminData = token.interface.encodeFunctionData("revokeRole", [
        DEFAULT_ADMIN_ROLE,
        deployer.address
    ]);
    
    const submitTx2 = await multisigWallet.submitTransaction(tokenAddress, 0, revokeDefaultAdminData);
    await submitTx2.wait();
    console.log("✅ Default admin role revoked via multisig");
    
    // Verify governance transfer
    console.log("\n🔍 Verifying governance transfer...");
    const multisigHasAdmin = await token.hasRole(ADMIN_ROLE, multisigAddress);
    const deployerHasAdmin = await token.hasRole(ADMIN_ROLE, deployer.address);
    
    console.log("✅ MultiSig has ADMIN_ROLE:", multisigHasAdmin);
    console.log("❌ Deployer has ADMIN_ROLE:", deployerHasAdmin);
    
    if (!multisigHasAdmin || deployerHasAdmin) {
        console.log("⚠️  Governance transfer not complete - this is expected for testing");
        console.log("💡 You can still test the system functionality");
    } else {
        console.log("🎉 Governance transfer successful!");
    }
    
    // Get some initial token info
    console.log("\n📊 Token Information:");
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    const maxSupply = await token.MAX_SUPPLY();
    
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Total Supply:", ethers.formatEther(totalSupply));
    console.log("Max Supply:", ethers.formatEther(maxSupply));
    
    console.log("\n📊 Deployment Summary");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎯 SKATE42Token:", tokenAddress);
    console.log("🏦 SimpleMultiSigWallet:", multisigAddress);
    console.log("🌐 Network: BSC Testnet (Chain ID: 97)");
    console.log("💰 Your Account:", deployer.address);
    
    console.log("\n🔗 BSCScan Links:");
    console.log("Token:", `https://testnet.bscscan.com/address/${tokenAddress}`);
    console.log("MultiSig:", `https://testnet.bscscan.com/address/${multisigAddress}`);
    
    console.log("\n📱 MetaMask Setup Instructions:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. 🌐 Ensure MetaMask is on BSC Testnet");
    console.log("   - Network Name: BSC Testnet");
    console.log("   - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/");
    console.log("   - Chain ID: 97");
    console.log("   - Currency Symbol: BNB");
    console.log("   - Block Explorer: https://testnet.bscscan.com");
    
    console.log("\n2. 🪙 Add 42SKATE Token to MetaMask:");
    console.log("   - Go to Assets > Import tokens > Custom token");
    console.log("   - Contract Address:", tokenAddress);
    console.log("   - Token Symbol: 42SK8");
    console.log("   - Token Decimals: 18");
    
    console.log("\n🧪 Next Steps:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. Add the token to MetaMask using the address above");
    console.log("2. Run interactive tests:");
    console.log("   npx hardhat run scripts/test-with-metamask.js --network bnbTestnet");
    console.log("3. Try the system features:");
    console.log("   - Submit videos");
    console.log("   - Become a validator");
    console.log("   - Validate videos");
    console.log("   - Use multisig governance");
    
    // Save deployment info
    const deploymentInfo = {
        network: "BSC Testnet",
        chainId: 97,
        token: tokenAddress,
        multisigWallet: multisigAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        bscScanLinks: {
            token: `https://testnet.bscscan.com/address/${tokenAddress}`,
            multisig: `https://testnet.bscscan.com/address/${multisigAddress}`
        },
        metamaskConfig: {
            networkName: "BSC Testnet",
            rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
            chainId: 97,
            symbol: "BNB",
            blockExplorer: "https://testnet.bscscan.com",
            tokenAddress: tokenAddress,
            tokenSymbol: "42SK8",
            tokenDecimals: 18
        }
    };
    
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
