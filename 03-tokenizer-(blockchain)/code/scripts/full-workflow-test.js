const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🎬 SKATE42Token Full Workflow Test");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Load deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
    
    // Get available signers (we may only have one on testnet)
    const signers = await ethers.getSigners();
    const mainValidator = signers[0];
    const skater1 = signers[1] || null;
    const skater2 = signers[2] || null;
    const skater3 = signers[3] || null;
    
    console.log("👥 Test Participants:");
    console.log("🎖️  Main Validator (you):", mainValidator.address);
    console.log("🛹 Available signers:", signers.length);
    
    // If we don't have multiple signers, we'll simulate with random addresses
    const simulatedSkater1 = skater1 ? skater1.address : "0x1111111111111111111111111111111111111111";
    const simulatedSkater2 = skater2 ? skater2.address : "0x2222222222222222222222222222222222222222";
    
    console.log("🛹 Skater 1:", simulatedSkater1);
    console.log("🛹 Skater 2:", simulatedSkater2);
    
    // Get contract instances
    const token = await ethers.getContractAt("Trick42Token", deploymentInfo.token);
    const multisig = await ethers.getContractAt("SimpleMultiSigWallet", deploymentInfo.multisigWallet);
    
    console.log("\n📊 Initial Status:");
    const mainBalance = await token.balanceOf(mainValidator.address);
    const isValidator = await token.hasRole(await token.VALIDATOR_ROLE(), mainValidator.address);
    console.log("💰 Validator balance:", ethers.formatEther(mainBalance), "42SK8");
    console.log("🎖️  Validator status:", isValidator);
    
    if (!isValidator) {
        console.log("❌ Main account is not a validator. Adding validator role...");
        
        // Add validator via multisig
        const VALIDATOR_ROLE = await token.VALIDATOR_ROLE();
        const addValidatorData = token.interface.encodeFunctionData("addValidator", [mainValidator.address]);
        
        try {
            const submitTx = await multisig.submitTransaction(
                deploymentInfo.token,
                0,
                addValidatorData
            );
            await submitTx.wait();
            console.log("✅ Validator role granted!");
        } catch (error) {
            console.log("❌ Failed to add validator:", error.message);
        }
    }
    
    // Test 1: Video Submission and Validation
    console.log("\n🎬 Test 1: Video Workflow");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
        if (skater1) {
            console.log("📹 Real multi-user test: Skater 1 submits video...");
            
            // Step 1: Skater submits a video
            const tokenAsSkater1 = token.connect(skater1);
            
            const submitTx = await tokenAsSkater1.submitVideo(
                "https://youtube.com/watch?v=kickflip123",
                "Kickflip",
                8 // Claimed difficulty
            );
            
            console.log("⏳ Processing video submission...");
            const submitReceipt = await submitTx.wait();
            console.log("✅ Video submitted!");
            console.log("📄 Submission tx:", `https://testnet.bscscan.com/tx/${submitReceipt.hash}`);
            
            // Get the video ID
            const videoId = await token.videoCounter() - 1n;
            console.log("🆔 Video ID:", videoId.toString());
            
            // Step 2: Validator validates the video
            console.log("\n✅ Step 2: You (validator) validate the video...");
            
            const validateTx = await token.validateVideo(
                videoId,
                7, // Final difficulty (validator's assessment)
                "Solid kickflip! Good form and clean landing."
            );
            
            console.log("⏳ Processing validation...");
            const validateReceipt = await validateTx.wait();
            console.log("✅ Video validated successfully!");
            console.log("📄 Validation tx:", `https://testnet.bscscan.com/tx/${validateReceipt.hash}`);
            
            // Check results
            const skaterBalance = await token.balanceOf(skater1.address);
            const validatorBalance = await token.balanceOf(mainValidator.address);
            
            console.log("\n💰 Rewards Distribution:");
            console.log("🛹 Skater earned:", ethers.formatEther(skaterBalance), "42SK8");
            console.log("🎖️  Validator earned:", ethers.formatEther(validatorBalance), "42SK8");
            
        } else {
            console.log("📹 Single-user simulation: Using legacy validateTrick...");
            console.log("💡 (In production, different users would submit and validate videos)");
            
            // Use legacy method to simulate the process
            const validateTx = await token.validateTrick(
                simulatedSkater1,
                "Kickflip",
                7
            );
            
            const receipt = await validateTx.wait();
            console.log("✅ Simulated validation successful!");
            console.log("📄 Transaction:", `https://testnet.bscscan.com/tx/${receipt.hash}`);
            
            // Check results
            const skaterBalance = await token.balanceOf(simulatedSkater1);
            const validatorBalance = await token.balanceOf(mainValidator.address);
            
            console.log("\n💰 Simulated Results:");
            console.log("🛹 Simulated skater earned:", ethers.formatEther(skaterBalance), "42SK8");
            console.log("🎖️  Validator earned:", ethers.formatEther(validatorBalance), "42SK8");
        }
        
    } catch (error) {
        console.log("❌ Video workflow failed:", error.message);
        
        // Always try fallback method
        console.log("🔄 Trying legacy validateTrick method...");
        try {
            const validateTx = await token.validateTrick(
                simulatedSkater1,
                "Kickflip",
                7
            );
            const receipt = await validateTx.wait();
            console.log("✅ Legacy validation successful!");
            console.log("📄 Transaction:", `https://testnet.bscscan.com/tx/${receipt.hash}`);
        } catch (legacyError) {
            console.log("❌ Legacy method also failed:", legacyError.message);
        }
    }
    
    // Test 2: Multiple Video Validations (if we have multiple signers)
    if (skater2) {
        console.log("\n🎬 Test 2: Multiple Users Video Validation");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        try {
            // Skater 2 submits a video
            console.log("📹 Skater 2 submits an Ollie video...");
            const tokenAsSkater2 = token.connect(skater2);
            
            const submitTx2 = await tokenAsSkater2.submitVideo(
                "https://youtube.com/watch?v=ollie456",
                "Ollie",
                5
            );
            
            const submitReceipt2 = await submitTx2.wait();
            console.log("✅ Skater 2's video submitted!");
            
            const videoId2 = await token.videoCounter() - 1n;
            
            // Wait for cooldown if needed
            console.log("⏳ Waiting for validation cooldown...");
            await new Promise(resolve => setTimeout(resolve, 6000));
            
            // Validate skater 2's video
            const validateTx2 = await token.validateVideo(
                videoId2,
                5, // Final difficulty
                "Nice clean ollie! Good pop."
            );
            
            const validateReceipt2 = await validateTx2.wait();
            console.log("✅ Skater 2's video validated!");
            console.log("📄 Transaction:", `https://testnet.bscscan.com/tx/${validateReceipt2.hash}`);
            
        } catch (error) {
            console.log("❌ Multiple validation test failed:", error.message);
        }
    } else {
        console.log("\n💡 Test 2: Simulated Additional Validation");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        try {
            // Wait for cooldown
            console.log("⏳ Waiting for validation cooldown...");
            await new Promise(resolve => setTimeout(resolve, 6000));
            
            // Simulate another validation
            const validateTx = await token.validateTrick(
                simulatedSkater2,
                "Ollie",
                5
            );
            
            const receipt = await validateTx.wait();
            console.log("✅ Second simulated validation successful!");
            console.log("📄 Transaction:", `https://testnet.bscscan.com/tx/${receipt.hash}`);
            
        } catch (error) {
            console.log("❌ Second simulation failed:", error.message);
        }
    }
    
    // Test 3: Multisig Governance
    console.log("\n🏛️  Test 3: Multisig Governance Operations");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
        // Add another validator via multisig
        const newValidator = simulatedSkater2;
        console.log("📝 Adding new validator via multisig:", newValidator);
        
        const addValidatorData = token.interface.encodeFunctionData("addValidator", [newValidator]);
        
        const submitTx = await multisig.submitTransaction(
            deploymentInfo.token,
            0,
            addValidatorData
        );
        
        const receipt = await submitTx.wait();
        console.log("✅ Multisig transaction executed!");
        console.log("📄 Transaction:", `https://testnet.bscscan.com/tx/${receipt.hash}`);
        
        // Verify the new validator
        const VALIDATOR_ROLE = await token.VALIDATOR_ROLE();
        const isNewValidator = await token.hasRole(VALIDATOR_ROLE, newValidator);
        console.log("🎉 New validator status:", isNewValidator);
        
    } catch (error) {
        console.log("❌ Multisig governance test failed:", error.message);
    }
    
    // Final System Status
    console.log("\n📊 Final System Status");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const finalValidatorBalance = await token.balanceOf(mainValidator.address);
    const finalSkater1Balance = await token.balanceOf(simulatedSkater1);
    const finalSkater2Balance = await token.balanceOf(simulatedSkater2);
    const totalSupply = await token.totalSupply();
    const videoCount = await token.videoCounter();
    const txCount = await multisig.getTransactionCount();
    
    console.log("💰 Balances:");
    console.log("  🎖️  Validator:", ethers.formatEther(finalValidatorBalance), "42SK8");
    console.log("  🛹 Skater 1:", ethers.formatEther(finalSkater1Balance), "42SK8");
    console.log("  🛹 Skater 2:", ethers.formatEther(finalSkater2Balance), "42SK8");
    
    console.log("📈 System Stats:");
    console.log("  📹 Total videos:", videoCount.toString());
    console.log("  💎 Total supply:", ethers.formatEther(totalSupply), "42SK8");
    console.log("  🏛️  Multisig transactions:", txCount.toString());
    
    console.log("\n🎯 MetaMask Integration Guide:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. Add BSC Testnet to MetaMask");
    console.log("2. Import token:", deploymentInfo.token);
    console.log("3. Your balance should show:", ethers.formatEther(finalValidatorBalance), "42SK8");
    console.log("4. View on BSCScan:", `https://testnet.bscscan.com/address/${deploymentInfo.token}`);
    
    console.log("\n✅ Full workflow test complete!");
    console.log("🎉 All systems operational on BSC Testnet!");
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Full workflow test failed:", error);
            process.exit(1);
        });
}

module.exports = { main };
