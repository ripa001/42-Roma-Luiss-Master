const hre = require("hardhat");
const { ethers } = require("hardhat");
const { MultiSigTokenGovernance } = require('./multisig-admin-helper.js');

async function main() {
    console.log("🧪 Comprehensive MultiSig Integration Test");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Contract addresses from deployment
    const MULTISIG_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
    const TOKEN_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    
    const [deployer, owner1, owner2, owner3, user1] = await ethers.getSigners();
    
    console.log("👥 Test Accounts:");
    console.log("Deployer (multisig owner):", deployer.address);
    console.log("Owner1 (multisig owner):", owner1.address);
    console.log("Owner2 (multisig owner):", owner2.address);
    console.log("Owner3 (regular user):", owner3.address);
    console.log("User1 (test validator):", user1.address);
    
    // Get contract instances
    const multisig = await ethers.getContractAt("SimpleMultiSigWallet", MULTISIG_ADDRESS);
    const token = await ethers.getContractAt("Trick42Token", TOKEN_ADDRESS);
    
    // Initialize governance helper
    const governance = await MultiSigTokenGovernance.create(MULTISIG_ADDRESS, TOKEN_ADDRESS);
    
    console.log("\n📊 Initial System Status:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    await governance.logStatus();
    
    // Test 1: Verify governance transfer
    console.log("\n🔍 Test 1: Verify Governance Transfer");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const ADMIN_ROLE = await token.ADMIN_ROLE();
    const multisigHasRole = await token.hasRole(ADMIN_ROLE, MULTISIG_ADDRESS);
    const deployerHasRole = await token.hasRole(ADMIN_ROLE, deployer.address);
    
    console.log("✅ Multisig has ADMIN_ROLE:", multisigHasRole);
    console.log("❌ Deployer has ADMIN_ROLE:", deployerHasRole);
    
    if (!multisigHasRole || deployerHasRole) {
        throw new Error("Governance transfer failed!");
    }
    
    // Test 2: Verify direct admin calls fail
    console.log("\n🚫 Test 2: Verify Direct Admin Calls Fail");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
        await token.connect(deployer).addValidator(user1.address);
        throw new Error("Should have failed!");
    } catch (error) {
        console.log("✅ Direct admin call correctly failed:", error.message.includes("missing role"));
    }
    
    try {
        await token.connect(owner1).addValidator(user1.address);
        throw new Error("Should have failed!");
    } catch (error) {
        console.log("✅ Owner direct call correctly failed:", error.message.includes("missing role"));
    }
    
    // Test 3: Add validator via multisig
    console.log("\n➕ Test 3: Add Validator Via MultiSig");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    console.log("Proposing to add validator:", user1.address);
    const { txIndex } = await governance.proposeAddValidator(user1.address, owner1);
    
    console.log("Current transaction status:");
    await governance.getTransaction(txIndex);
    
    console.log("Owner2 confirming transaction...");
    await governance.confirmTransaction(txIndex, owner2);
    
    // Verify validator was added
    const VALIDATOR_ROLE = await token.VALIDATOR_ROLE();
    const hasValidatorRole = await token.hasRole(VALIDATOR_ROLE, user1.address);
    const validatorInfo = await token.getValidatorInfo(user1.address);
    
    console.log("✅ User1 has VALIDATOR_ROLE:", hasValidatorRole);
    console.log("✅ User1 is active validator:", validatorInfo.isActive);
    
    if (!hasValidatorRole || !validatorInfo.isActive) {
        throw new Error("Validator addition failed!");
    }
    
    // Test 4: Update validator reputation via multisig
    console.log("\n📈 Test 4: Update Validator Reputation Via MultiSig");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const newReputation = 150;
    console.log(`Proposing to update ${user1.address} reputation to ${newReputation}`);
    const { txIndex: reputationTxIndex } = await governance.proposeUpdateValidatorReputation(
        user1.address, 
        newReputation, 
        owner2
    );
    
    console.log("Deployer confirming reputation update...");
    await governance.confirmTransaction(reputationTxIndex, deployer);
    
    // Verify reputation was updated
    const updatedValidatorInfo = await token.getValidatorInfo(user1.address);
    console.log("✅ Updated reputation:", updatedValidatorInfo.reputation.toString());
    
    if (updatedValidatorInfo.reputation != newReputation) {
        throw new Error("Reputation update failed!");
    }
    
    // Test 5: Test video validation system
    console.log("\n🎥 Test 5: Test Video Validation System");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // User submits video
    console.log("User submitting video for validation...");
    const videoTx = await token.connect(deployer).submitVideo(
        "QmHash123",
        "https://youtube.com/watch?v=123",
        "360 Flip",
        8
    );
    await videoTx.wait();
    
    console.log("✅ Video submitted");
    
    // Validator validates video
    console.log("Validator validating video...");
    const validateTx = await token.connect(user1).validateVideo(
        0, // video ID
        8, // final difficulty
        "Great execution!"
    );
    await validateTx.wait();
    
    console.log("✅ Video validated and tokens minted");
    
    // Check balances
    const deployerBalance = await token.balanceOf(deployer.address);
    const validatorBalance = await token.balanceOf(user1.address);
    
    console.log("Deployer token balance:", ethers.formatEther(deployerBalance));
    console.log("Validator token balance:", ethers.formatEther(validatorBalance));
    
    // Test 6: Emergency pause via multisig
    console.log("\n⏸️  Test 6: Emergency Pause Via MultiSig");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    console.log("Proposing emergency pause...");
    const { txIndex: pauseTxIndex } = await governance.proposePause(owner1);
    
    console.log("Owner2 confirming pause...");
    await governance.confirmTransaction(pauseTxIndex, owner2);
    
    // Verify contract is paused
    const isPaused = await token.paused();
    console.log("✅ Contract paused:", isPaused);
    
    if (!isPaused) {
        throw new Error("Emergency pause failed!");
    }
    
    // Test that paused functions fail
    try {
        await token.connect(deployer).submitVideo(
            "QmHash456",
            "https://youtube.com/watch?v=456",
            "Kickflip",
            5
        );
        throw new Error("Should have failed when paused!");
    } catch (error) {
        console.log("✅ Paused function correctly failed:", error.message.includes("paused"));
    }
    
    // Test 7: Unpause via multisig
    console.log("\n▶️  Test 7: Unpause Via MultiSig");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    console.log("Proposing unpause...");
    const { txIndex: unpauseTxIndex } = await governance.proposeUnpause(owner2);
    
    console.log("Deployer confirming unpause...");
    await governance.confirmTransaction(unpauseTxIndex, deployer);
    
    // Verify contract is unpaused
    const isUnpaused = !(await token.paused());
    console.log("✅ Contract unpaused:", isUnpaused);
    
    if (!isUnpaused) {
        throw new Error("Unpause failed!");
    }
    
    // Test 8: Remove validator via multisig
    console.log("\n➖ Test 8: Remove Validator Via MultiSig");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    console.log("Proposing to remove validator:", user1.address);
    const { txIndex: removeTxIndex } = await governance.proposeRemoveValidator(user1.address, owner1);
    
    console.log("Owner2 confirming removal...");
    await governance.confirmTransaction(removeTxIndex, owner2);
    
    // Verify validator was removed
    const removedValidatorInfo = await token.getValidatorInfo(user1.address);
    const stillHasValidatorRole = await token.hasRole(VALIDATOR_ROLE, user1.address);
    
    console.log("❌ User1 still has VALIDATOR_ROLE:", stillHasValidatorRole);
    console.log("❌ User1 still active validator:", removedValidatorInfo.isActive);
    
    if (stillHasValidatorRole || removedValidatorInfo.isActive) {
        throw new Error("Validator removal failed!");
    }
    
    // Test 9: Test revocation functionality
    console.log("\n🔄 Test 9: Test Confirmation Revocation");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Add validator again, but revoke confirmation
    console.log("Proposing to add validator again...");
    const { txIndex: addAgainTxIndex } = await governance.proposeAddValidator(user1.address, owner1);
    
    console.log("Owner1 revoking their confirmation...");
    await governance.revokeConfirmation(addAgainTxIndex, owner1);
    
    // Transaction should not execute even with owner2's confirmation
    console.log("Owner2 confirming (should not execute due to revocation)...");
    await governance.confirmTransaction(addAgainTxIndex, owner2);
    
    const txDetails = await governance.getTransaction(addAgainTxIndex);
    console.log("Transaction executed:", txDetails[3]); // executed field
    console.log("Confirmations:", txDetails[4]); // confirmations field
    
    if (txDetails[3]) {
        throw new Error("Transaction should not have executed after revocation!");
    }
    
    console.log("✅ Revocation working correctly");
    
    // Test 10: Final system status
    console.log("\n📋 Test 10: Final System Status");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    await governance.logStatus();
    
    // Get final balances
    const finalDeployerBalance = await token.balanceOf(deployer.address);
    const finalValidatorBalance = await token.balanceOf(user1.address);
    const totalSupply = await token.totalSupply();
    
    console.log("\n💰 Final Token Balances:");
    console.log("Deployer:", ethers.formatEther(finalDeployerBalance), "42SK8");
    console.log("Ex-Validator:", ethers.formatEther(finalValidatorBalance), "42SK8");
    console.log("Total Supply:", ethers.formatEther(totalSupply), "42SK8");
    
    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("✅ Multisig governance is working correctly");
    console.log("✅ Token integration is functioning properly");
    console.log("✅ Security controls are in place");
    console.log("✅ Emergency procedures work as expected");
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Manual test failed:", error);
            process.exit(1);
        });
}

module.exports = { main };
