const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token-MultiSig Integration", function () {
    let token, multisig, owner1, owner2, owner3, user1, user2;
    let tokenAddress, multisigAddress;

    beforeEach(async function () {
        [owner1, owner2, owner3, user1, user2] = await ethers.getSigners();

        // Deploy MultiSig Wallet
        const MultiSig = await ethers.getContractFactory("SimpleMultiSigWallet");
        multisig = await MultiSig.deploy(
            [owner1.address, owner2.address, owner3.address],
            2 // 2 confirmations required
        );
        await multisig.waitForDeployment();
        multisigAddress = await multisig.getAddress();

        // Deploy Token
        const Token = await ethers.getContractFactory("Trick42Token");
        token = await Token.deploy();
        await token.waitForDeployment();
        tokenAddress = await token.getAddress();

        // Transfer token admin rights to multisig
        const ADMIN_ROLE = await token.ADMIN_ROLE();
        const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
        
        await token.grantRole(ADMIN_ROLE, multisigAddress);
        await token.grantRole(DEFAULT_ADMIN_ROLE, multisigAddress);
        
        // Revoke owner1's admin rights (to simulate real deployment)
        await token.revokeRole(ADMIN_ROLE, owner1.address);
        await token.revokeRole(DEFAULT_ADMIN_ROLE, owner1.address);
    });

    describe("Governance Setup", function () {
        it("Should transfer admin roles to multisig", async function () {
            const ADMIN_ROLE = await token.ADMIN_ROLE();
            const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();

            expect(await token.hasRole(ADMIN_ROLE, multisigAddress)).to.be.true;
            expect(await token.hasRole(DEFAULT_ADMIN_ROLE, multisigAddress)).to.be.true;
            expect(await token.hasRole(ADMIN_ROLE, owner1.address)).to.be.false;
        });

        it("Should require multisig for admin operations", async function () {
            // Direct admin call should fail
            await expect(
                token.connect(user1).addValidator(user2.address)
            ).to.be.reverted;

            await expect(
                token.connect(owner1).addValidator(user2.address)
            ).to.be.reverted;
        });
    });

    describe("MultiSig Admin Operations", function () {
        it("Should add validator via multisig", async function () {
            // Encode function call
            const addValidatorData = token.interface.encodeFunctionData("addValidator", [user1.address]);

            // Submit transaction
            await multisig.connect(owner1).submitTransaction(
                tokenAddress,
                0,
                addValidatorData
            );

            // Confirm transaction (owner1 already confirmed by submitting)
            await multisig.connect(owner2).confirmTransaction(0);

            // Verify transaction was executed
            const transaction = await multisig.getTransaction(0);
            expect(transaction.executed).to.be.true;

            // Verify validator was added
            const VALIDATOR_ROLE = await token.VALIDATOR_ROLE();
            expect(await token.hasRole(VALIDATOR_ROLE, user1.address)).to.be.true;
            
            const validatorInfo = await token.getValidatorInfo(user1.address);
            expect(validatorInfo.isActive).to.be.true;
        });

        it("Should remove validator via multisig", async function () {
            // First add validator
            const addValidatorData = token.interface.encodeFunctionData("addValidator", [user1.address]);
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, addValidatorData);
            await multisig.connect(owner2).confirmTransaction(0);

            // Then remove validator
            const removeValidatorData = token.interface.encodeFunctionData("removeValidator", [user1.address]);
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, removeValidatorData);
            await multisig.connect(owner3).confirmTransaction(1);

            // Verify validator was removed
            const validatorInfo = await token.getValidatorInfo(user1.address);
            expect(validatorInfo.isActive).to.be.false;
        });

        it("Should update validator reputation via multisig", async function () {
            // First add validator
            const addValidatorData = token.interface.encodeFunctionData("addValidator", [user1.address]);
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, addValidatorData);
            await multisig.connect(owner2).confirmTransaction(0);

            // Update reputation
            const updateReputationData = token.interface.encodeFunctionData("updateValidatorReputation", [
                user1.address,
                150
            ]);
            await multisig.connect(owner2).submitTransaction(tokenAddress, 0, updateReputationData);
            await multisig.connect(owner3).confirmTransaction(1);

            // Verify reputation was updated
            const validatorInfo = await token.getValidatorInfo(user1.address);
            expect(validatorInfo.reputation).to.equal(150);
        });

        it("Should pause contract via multisig", async function () {
            const pauseData = token.interface.encodeFunctionData("pause", []);
            
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, pauseData);
            await multisig.connect(owner2).confirmTransaction(0);

            // Verify contract is paused
            expect(await token.paused()).to.be.true;

            // Verify paused functions are blocked
            await expect(
                token.connect(user1).submitVideo("hash", "url", "kickflip", 5)
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should unpause contract via multisig", async function () {
            // First pause
            const pauseData = token.interface.encodeFunctionData("pause", []);
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, pauseData);
            await multisig.connect(owner2).confirmTransaction(0);

            // Then unpause
            const unpauseData = token.interface.encodeFunctionData("unpause", []);
            await multisig.connect(owner2).submitTransaction(tokenAddress, 0, unpauseData);
            await multisig.connect(owner3).confirmTransaction(1);

            // Verify contract is unpaused
            expect(await token.paused()).to.be.false;
        });

        it("Should distribute weekly rewards via multisig", async function () {
            // Add a validator first
            const addValidatorData = token.interface.encodeFunctionData("addValidator", [user1.address]);
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, addValidatorData);
            await multisig.connect(owner2).confirmTransaction(0);

            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]); // 7 days + 1 second
            await ethers.provider.send("evm_mine");

            // Distribute rewards
            const distributeRewardsData = token.interface.encodeFunctionData("distributeWeeklyRewards", []);
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, distributeRewardsData);
            await multisig.connect(owner3).confirmTransaction(1);

            // Verify transaction was executed
            const transaction = await multisig.getTransaction(1);
            expect(transaction.executed).to.be.true;
        });
    });

    describe("MultiSig Wallet Features", function () {
        it("Should require minimum confirmations", async function () {
            const addValidatorData = token.interface.encodeFunctionData("addValidator", [user1.address]);
            
            // Submit transaction
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, addValidatorData);
            
            // Should not be executed with only 1 confirmation
            let transaction = await multisig.getTransaction(0);
            expect(transaction.executed).to.be.false;
            
            // Should be executed with 2 confirmations
            await multisig.connect(owner2).confirmTransaction(0);
            transaction = await multisig.getTransaction(0);
            expect(transaction.executed).to.be.true;
        });

        it("Should allow revoking confirmations", async function () {
            const addValidatorData = token.interface.encodeFunctionData("addValidator", [user1.address]);
            
            // Submit transaction (owner1 auto-confirms)
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, addValidatorData);
            
            // Verify initial confirmation
            expect(await multisig.getConfirmation(0, owner1.address)).to.be.true;
            let transaction = await multisig.getTransaction(0);
            expect(transaction[4]).to.equal(1); // confirmations is at index 4 in the return tuple
            
            // Revoke confirmation
            await multisig.connect(owner1).revokeConfirmation(0);
            
            // Verify confirmation was revoked
            expect(await multisig.getConfirmation(0, owner1.address)).to.be.false;
            transaction = await multisig.getTransaction(0);
            expect(transaction[4]).to.equal(0); // confirmations should be 0
            
            // Add another confirmation - should not execute with just 1
            await multisig.connect(owner2).confirmTransaction(0);
            transaction = await multisig.getTransaction(0);
            expect(transaction[4]).to.equal(1); // confirmations should be 1
            expect(transaction[3]).to.be.false; // executed should be false (index 3)
        });

        it("Should get all confirmations for a transaction", async function () {
            const addValidatorData = token.interface.encodeFunctionData("addValidator", [user1.address]);
            
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, addValidatorData);
            await multisig.connect(owner2).confirmTransaction(0);
            
            const confirmations = await multisig.getConfirmations(0);
            expect(confirmations.length).to.equal(2);
            expect(confirmations).to.include(owner1.address);
            expect(confirmations).to.include(owner2.address);
        });

        it("Should handle ETH transactions", async function () {
            // Send ETH to multisig
            await owner1.sendTransaction({
                to: multisigAddress,
                value: ethers.parseEther("1.0")
            });

            const initialBalance = await ethers.provider.getBalance(user1.address);

            // Send ETH to user1
            await multisig.connect(owner1).submitTransaction(
                user1.address,
                ethers.parseEther("0.5"),
                "0x"
            );
            await multisig.connect(owner2).confirmTransaction(0);

            const finalBalance = await ethers.provider.getBalance(user1.address);
            expect(finalBalance - initialBalance).to.equal(ethers.parseEther("0.5"));
        });
    });

    describe("Edge Cases", function () {
        it("Should not execute failed token transactions", async function () {
            // Try to add invalid validator (zero address)
            const addValidatorData = token.interface.encodeFunctionData("addValidator", [ethers.ZeroAddress]);
            
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, addValidatorData);
            
            // This should fail when owner2 confirms
            await expect(
                multisig.connect(owner2).confirmTransaction(0)
            ).to.be.revertedWith("Tx failed");
        });

        it("Should prevent non-owners from interacting", async function () {
            const addValidatorData = token.interface.encodeFunctionData("addValidator", [user1.address]);
            
            await expect(
                multisig.connect(user1).submitTransaction(tokenAddress, 0, addValidatorData)
            ).to.be.revertedWith("Not owner");
            
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, addValidatorData);
            
            await expect(
                multisig.connect(user1).confirmTransaction(0)
            ).to.be.revertedWith("Not owner");
        });

        it("Should prevent double confirmation", async function () {
            const addValidatorData = token.interface.encodeFunctionData("addValidator", [user1.address]);
            
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, addValidatorData);
            
            await expect(
                multisig.connect(owner1).confirmTransaction(0)
            ).to.be.revertedWith("Tx already confirmed");
        });
    });

    describe("Complex Governance Scenarios", function () {
        it("Should handle multiple concurrent transactions", async function () {
            const addValidator1Data = token.interface.encodeFunctionData("addValidator", [user1.address]);
            const addValidator2Data = token.interface.encodeFunctionData("addValidator", [user2.address]);
            
            // Submit multiple transactions
            await multisig.connect(owner1).submitTransaction(tokenAddress, 0, addValidator1Data);
            await multisig.connect(owner2).submitTransaction(tokenAddress, 0, addValidator2Data);
            
            // Confirm first transaction
            await multisig.connect(owner2).confirmTransaction(0);
            
            // Confirm second transaction  
            await multisig.connect(owner1).confirmTransaction(1);
            
            // Both should be executed
            expect((await multisig.getTransaction(0)).executed).to.be.true;
            expect((await multisig.getTransaction(1)).executed).to.be.true;
            
            // Both validators should be added
            const VALIDATOR_ROLE = await token.VALIDATOR_ROLE();
            expect(await token.hasRole(VALIDATOR_ROLE, user1.address)).to.be.true;
            expect(await token.hasRole(VALIDATOR_ROLE, user2.address)).to.be.true;
        });
    });
});