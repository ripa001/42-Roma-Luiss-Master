const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🧪 Interactive MetaMask Testing for SKATE42Token");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Load deployment info
    let deploymentInfo;
    try {
        deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
        console.log("📋 Loaded deployment info from deployment-info.json");
    } catch (error) {
        console.log("❌ No deployment-info.json found. Please deploy first with:");
        console.log("npx hardhat run scripts/deploy-to-testnet.js --network bnbTestnet");
        return;
    }
    
    const [user] = await ethers.getSigners();
    console.log("👤 Testing with account:", user.address);
    console.log("🌐 Network:", deploymentInfo.network);
    
    // Get contract instances
    const token = await ethers.getContractAt("Trick42Token", deploymentInfo.token);
    const multisig = await ethers.getContractAt("SimpleMultiSigWallet", deploymentInfo.multisigWallet);
    
    console.log("📊 Contract Status:");
    console.log("🎯 Token:", deploymentInfo.token);
    console.log("🏦 MultiSig:", deploymentInfo.multisigWallet);
    
    // Check token info
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    const userBalance = await token.balanceOf(user.address);
    
    console.log("\n💰 Token Information:");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Total Supply:", ethers.formatEther(totalSupply));
    console.log("Your Balance:", ethers.formatEther(userBalance));
    
    // Test 1: Submit a video
    console.log("\n🎥 Test 1: Submit Video for Validation");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
        const videoTx = await token.submitVideo(
            "QmTestHash12345", // IPFS hash
            "https://youtube.com/watch?v=testVideo", // Video URL
            "Kickflip", // Trick type
            7 // Difficulty (1-10)
        );
        
        console.log("⏳ Submitting video...");
        const receipt = await videoTx.wait();
        console.log("✅ Video submitted successfully!");
        console.log("📄 Transaction:", `https://testnet.bscscan.com/tx/${receipt.hash}`);
        
        // Get video info
        const videoSubmission = await token.videoSubmissions(0);
        console.log("📋 Video Details:");
        console.log("  - Video Hash:", videoSubmission.videoHash);
        console.log("  - Trick Type:", videoSubmission.trickType);
        console.log("  - Claimed Difficulty:", videoSubmission.claimedDifficulty.toString());
        console.log("  - Skater:", videoSubmission.skater);
        
    } catch (error) {
        console.log("❌ Video submission failed:", error.message);
    }
    
    // Test 2: Check if user is a validator
    console.log("\n👤 Test 2: Check Validator Status");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const VALIDATOR_ROLE = await token.VALIDATOR_ROLE();
    const isValidator = await token.hasRole(VALIDATOR_ROLE, user.address);
    
    if (isValidator) {
        console.log("✅ You are a validator!");
        
        // Try to validate the video
        try {
            console.log("🔍 Attempting to validate video...");
            const validateTx = await token.validateVideo(
                0, // Video ID
                8, // Final difficulty assigned by validator
                "Great execution! Well done!" // Validation notes
            );
            
            console.log("⏳ Validating video...");
            const receipt = await validateTx.wait();
            console.log("✅ Video validated successfully!");
            console.log("📄 Transaction:", `https://testnet.bscscan.com/tx/${receipt.hash}`);
            
            // Check updated balances
            const newBalance = await token.balanceOf(user.address);
            console.log("💰 Your new token balance:", ethers.formatEther(newBalance));
            
        } catch (error) {
            console.log("❌ Video validation failed:", error.message);
            if (error.message.includes("Cannot validate own videos")) {
                console.log("💡 Note: You can't validate your own videos. Try with a different account.");
            }
        }
    } else {
        console.log("❌ You are not a validator");
        console.log("💡 To become a validator, you need to be added via multisig governance");
    }
    
    // Test 3: Test MultiSig Governance
    console.log("\n🏛️  Test 3: MultiSig Governance");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Check if user is multisig owner
    const isOwner = await multisig.isOwner(user.address);
    
    if (isOwner) {
        console.log("✅ You are a multisig owner!");
        
        // Show pending transactions
        const txCount = await multisig.getTransactionCount();
        console.log("📋 Total multisig transactions:", txCount.toString());
        
        // Try to add yourself as validator via multisig (if not already)
        if (!isValidator) {
            try {
                console.log("📝 Proposing to add yourself as validator...");
                const addValidatorData = token.interface.encodeFunctionData("addValidator", [user.address]);
                
                const submitTx = await multisig.submitTransaction(
                    deploymentInfo.token,
                    0,
                    addValidatorData
                );
                
                console.log("⏳ Submitting multisig transaction...");
                const receipt = await submitTx.wait();
                console.log("✅ Multisig transaction submitted and executed!");
                console.log("📄 Transaction:", `https://testnet.bscscan.com/tx/${receipt.hash}`);
                
                // Verify you're now a validator
                const nowValidator = await token.hasRole(VALIDATOR_ROLE, user.address);
                console.log("🎉 You are now a validator:", nowValidator);
                
            } catch (error) {
                console.log("❌ Adding validator failed:", error.message);
            }
        } else {
            console.log("💡 You're already a validator!");
            
            // Try updating your reputation
            try {
                console.log("📈 Proposing to update your reputation...");
                const updateReputationData = token.interface.encodeFunctionData("updateValidatorReputation", [
                    user.address,
                    200 // New reputation
                ]);
                
                const submitTx = await multisig.submitTransaction(
                    deploymentInfo.token,
                    0,
                    updateReputationData
                );
                
                console.log("⏳ Submitting reputation update...");
                const receipt = await submitTx.wait();
                console.log("✅ Reputation update submitted and executed!");
                console.log("📄 Transaction:", `https://testnet.bscscan.com/tx/${receipt.hash}`);
                
                // Check updated reputation
                const validatorInfo = await token.getValidatorInfo(user.address);
                console.log("📊 Your new reputation:", validatorInfo.reputation.toString());
                
            } catch (error) {
                console.log("❌ Reputation update failed:", error.message);
            }
        }
        
    } else {
        console.log("❌ You are not a multisig owner");
        console.log("💡 Only multisig owners can propose governance changes");
    }
    
    // Test 4: Token Staking (if you have tokens)
    console.log("\n💎 Test 4: Validator Staking");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const currentBalance = await token.balanceOf(user.address);
    const stakingRequirement = await token.VALIDATOR_STAKING_REQUIREMENT();
    
    console.log("💰 Your balance:", ethers.formatEther(currentBalance));
    console.log("💎 Staking requirement:", ethers.formatEther(stakingRequirement));
    
    if (currentBalance >= stakingRequirement) {
        try {
            console.log("💎 Attempting to stake tokens...");
            const stakeTx = await token.stakeToValidator(stakingRequirement);
            
            console.log("⏳ Staking tokens...");
            const receipt = await stakeTx.wait();
            console.log("✅ Successfully staked tokens!");
            console.log("📄 Transaction:", `https://testnet.bscscan.com/tx/${receipt.hash}`);
            
            // Check validator info
            const validatorInfo = await token.getValidatorInfo(user.address);
            console.log("📊 Your staked amount:", ethers.formatEther(validatorInfo.stakedAmount));
            console.log("✅ Validator status:", validatorInfo.isActive);
            
        } catch (error) {
            console.log("❌ Staking failed:", error.message);
        }
    } else {
        console.log("💡 Not enough tokens to stake. You need", ethers.formatEther(stakingRequirement), "tokens");
    }
    
    // Final Status Report
    console.log("\n📊 Final Status Report");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const finalBalance = await token.balanceOf(user.address);
    const finalValidatorStatus = await token.hasRole(VALIDATOR_ROLE, user.address);
    const finalOwnerStatus = await multisig.isOwner(user.address);
    
    console.log("👤 Account:", user.address);
    console.log("💰 Token Balance:", ethers.formatEther(finalBalance), "42SK8");
    console.log("🎖️  Validator:", finalValidatorStatus);
    console.log("🏛️  MultiSig Owner:", finalOwnerStatus);
    
    if (finalValidatorStatus) {
        const validatorInfo = await token.getValidatorInfo(user.address);
        console.log("📈 Reputation:", validatorInfo.reputation.toString());
        console.log("🔢 Total Validations:", validatorInfo.totalValidations.toString());
        console.log("💎 Staked Amount:", ethers.formatEther(validatorInfo.stakedAmount), "42SK8");
    }
    
    console.log("\n🔗 Useful Links:");
    console.log("🌐 Token on BSCScan:", `https://testnet.bscscan.com/address/${deploymentInfo.token}`);
    console.log("🏦 MultiSig on BSCScan:", `https://testnet.bscscan.com/address/${deploymentInfo.multisigWallet}`);
    console.log("💰 BSC Testnet Faucet: https://testnet.binance.org/faucet-smart");
    
    console.log("\n🎉 Testing completed! Check BSCScan for transaction details.");
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Testing failed:", error);
            process.exit(1);
        });
}

module.exports = { main };
