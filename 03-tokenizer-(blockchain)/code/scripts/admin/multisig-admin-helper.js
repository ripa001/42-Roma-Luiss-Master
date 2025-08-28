const { ethers } = require("hardhat");

/**
 * Helper functions for interacting with the multisig-governed token system
 */
class MultiSigTokenGovernance {
    constructor(multisigAddress, tokenAddress) {
        this.multisigAddress = multisigAddress;
        this.tokenAddress = tokenAddress;
    }

    static async create(multisigAddress, tokenAddress) {
        const governance = new MultiSigTokenGovernance(multisigAddress, tokenAddress);
        await governance.initialize();
        return governance;
    }

    async initialize() {
        this.multisig = await ethers.getContractAt("SimpleMultiSigWallet", this.multisigAddress);
        this.token = await ethers.getContractAt("Trick42Token", this.tokenAddress);
    }

    // Admin Operations
    async proposeAddValidator(validatorAddress, signer) {
        const data = this.token.interface.encodeFunctionData("addValidator", [validatorAddress]);
        const tx = await this.multisig.connect(signer).submitTransaction(
            this.tokenAddress,
            0,
            data
        );
        const receipt = await tx.wait();
        const txIndex = await this.multisig.getTransactionCount() - 1n;
        
        console.log(`📝 Proposed adding validator ${validatorAddress}`);
        console.log(`Transaction index: ${txIndex}`);
        console.log(`Transaction hash: ${receipt.hash}`);
        
        return { txIndex, hash: receipt.hash };
    }

    async proposeRemoveValidator(validatorAddress, signer) {
        const data = this.token.interface.encodeFunctionData("removeValidator", [validatorAddress]);
        const tx = await this.multisig.connect(signer).submitTransaction(
            this.tokenAddress,
            0,
            data
        );
        const receipt = await tx.wait();
        const txIndex = await this.multisig.getTransactionCount() - 1n;
        
        console.log(`📝 Proposed removing validator ${validatorAddress}`);
        console.log(`Transaction index: ${txIndex}`);
        console.log(`Transaction hash: ${receipt.hash}`);
        
        return { txIndex, hash: receipt.hash };
    }

    async proposeUpdateValidatorReputation(validatorAddress, reputation, signer) {
        const data = this.token.interface.encodeFunctionData("updateValidatorReputation", [
            validatorAddress,
            reputation
        ]);
        const tx = await this.multisig.connect(signer).submitTransaction(
            this.tokenAddress,
            0,
            data
        );
        const receipt = await tx.wait();
        const txIndex = await this.multisig.getTransactionCount() - 1n;
        
        console.log(`📝 Proposed updating validator ${validatorAddress} reputation to ${reputation}`);
        console.log(`Transaction index: ${txIndex}`);
        console.log(`Transaction hash: ${receipt.hash}`);
        
        return { txIndex, hash: receipt.hash };
    }

    async proposePause(signer) {
        const data = this.token.interface.encodeFunctionData("pause", []);
        const tx = await this.multisig.connect(signer).submitTransaction(
            this.tokenAddress,
            0,
            data
        );
        const receipt = await tx.wait();
        const txIndex = await this.multisig.getTransactionCount() - 1n;
        
        console.log(`📝 Proposed pausing the contract`);
        console.log(`Transaction index: ${txIndex}`);
        console.log(`Transaction hash: ${receipt.hash}`);
        
        return { txIndex, hash: receipt.hash };
    }

    async proposeUnpause(signer) {
        const data = this.token.interface.encodeFunctionData("unpause", []);
        const tx = await this.multisig.connect(signer).submitTransaction(
            this.tokenAddress,
            0,
            data
        );
        const receipt = await tx.wait();
        const txIndex = await this.multisig.getTransactionCount() - 1n;
        
        console.log(`📝 Proposed unpausing the contract`);
        console.log(`Transaction index: ${txIndex}`);
        console.log(`Transaction hash: ${receipt.hash}`);
        
        return { txIndex, hash: receipt.hash };
    }

    async proposeDistributeWeeklyRewards(signer) {
        const data = this.token.interface.encodeFunctionData("distributeWeeklyRewards", []);
        const tx = await this.multisig.connect(signer).submitTransaction(
            this.tokenAddress,
            0,
            data
        );
        const receipt = await tx.wait();
        const txIndex = await this.multisig.getTransactionCount() - 1n;
        
        console.log(`📝 Proposed distributing weekly rewards`);
        console.log(`Transaction index: ${txIndex}`);
        console.log(`Transaction hash: ${receipt.hash}`);
        
        return { txIndex, hash: receipt.hash };
    }

    // Multisig Operations
    async confirmTransaction(txIndex, signer) {
        const tx = await this.multisig.connect(signer).confirmTransaction(txIndex);
        const receipt = await tx.wait();
        
        console.log(`✅ Confirmed transaction ${txIndex}`);
        console.log(`Confirmation hash: ${receipt.hash}`);
        
        const transaction = await this.multisig.getTransaction(txIndex);
        if (transaction.executed) {
            console.log(`🚀 Transaction ${txIndex} has been executed!`);
        } else {
            console.log(`⏳ Transaction ${txIndex} needs more confirmations`);
            console.log(`Current confirmations: ${transaction.confirmations}/${await this.multisig.required()}`);
        }
        
        return receipt;
    }

    async revokeConfirmation(txIndex, signer) {
        const tx = await this.multisig.connect(signer).revokeConfirmation(txIndex);
        const receipt = await tx.wait();
        
        console.log(`❌ Revoked confirmation for transaction ${txIndex}`);
        console.log(`Revocation hash: ${receipt.hash}`);
        
        return receipt;
    }

    // View Functions
    async getTransaction(txIndex) {
        const transaction = await this.multisig.getTransaction(txIndex);
        const confirmations = await this.multisig.getConfirmations(txIndex);
        const required = await this.multisig.required();
        
        console.log(`\n📋 Transaction ${txIndex}:`);
        console.log(`Destination: ${transaction.destination}`);
        console.log(`Value: ${ethers.formatEther(transaction.value)} ETH`);
        console.log(`Executed: ${transaction.executed}`);
        console.log(`Confirmations: ${transaction.confirmations}/${required}`);
        console.log(`Confirmed by: ${confirmations.join(', ')}`);
        
        return {
            ...transaction,
            confirmations: confirmations,
            required: required
        };
    }

    async getOwners() {
        return await this.multisig.getOwners();
    }

    async getRequiredConfirmations() {
        return await this.multisig.required();
    }

    async getPendingTransactions() {
        const count = await this.multisig.getTransactionCount();
        const transactions = [];
        
        for (let i = 0; i < count; i++) {
            const tx = await this.multisig.getTransaction(i);
            if (!tx.executed) {
                transactions.push({
                    index: i,
                    ...tx
                });
            }
        }
        
        return transactions;
    }

    async getTokenInfo() {
        const name = await this.token.name();
        const symbol = await this.token.symbol();
        const totalSupply = await this.token.totalSupply();
        const maxSupply = await this.token.MAX_SUPPLY();
        const paused = await this.token.paused();
        
        console.log(`\n🎯 Token Information:`);
        console.log(`Name: ${name}`);
        console.log(`Symbol: ${symbol}`);
        console.log(`Total Supply: ${ethers.formatEther(totalSupply)}`);
        console.log(`Max Supply: ${ethers.formatEther(maxSupply)}`);
        console.log(`Paused: ${paused}`);
        
        return {
            name,
            symbol,
            totalSupply,
            maxSupply,
            paused
        };
    }

    async getValidatorInfo(validatorAddress) {
        const info = await this.token.getValidatorInfo(validatorAddress);
        const VALIDATOR_ROLE = await this.token.VALIDATOR_ROLE();
        const hasRole = await this.token.hasRole(VALIDATOR_ROLE, validatorAddress);
        
        console.log(`\n👤 Validator ${validatorAddress}:`);
        console.log(`Active: ${info.isActive}`);
        console.log(`Has Role: ${hasRole}`);
        console.log(`Reputation: ${info.reputation}`);
        console.log(`Total Validations: ${info.totalValidations}`);
        console.log(`Staked Amount: ${ethers.formatEther(info.stakedAmount)}`);
        console.log(`Total Earned: ${ethers.formatEther(info.totalEarned)}`);
        
        return {
            ...info,
            hasRole
        };
    }

    // Utility Functions
    async logStatus() {
        console.log(`\n🏦 MultiSig Wallet: ${this.multisigAddress}`);
        console.log(`🎯 Token Contract: ${this.tokenAddress}`);
        
        const owners = await this.getOwners();
        const required = await this.getRequiredConfirmations();
        const pendingTxs = await this.getPendingTransactions();
        
        console.log(`👥 Owners: ${owners.join(', ')}`);
        console.log(`🔢 Required Confirmations: ${required}`);
        console.log(`⏳ Pending Transactions: ${pendingTxs.length}`);
        
        if (pendingTxs.length > 0) {
            console.log(`\n📋 Pending Transactions:`);
            for (const tx of pendingTxs) {
                console.log(`  ${tx.index}: ${tx.confirmations}/${required} confirmations`);
            }
        }
        
        await this.getTokenInfo();
    }
}

module.exports = { MultiSigTokenGovernance };
