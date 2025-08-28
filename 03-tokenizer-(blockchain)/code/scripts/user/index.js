/**
 * 👤 SKATE42Token User Scripts Index
 * 
 * This module provides easy access to all user-related functionality.
 */

const { ethers } = require("hardhat");
const fs = require('fs');

// User utility functions
class UserTools {
    constructor() {
        this.deploymentInfo = null;
        this.token = null;
    }

    async init() {
        try {
            this.deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
            this.token = await ethers.getContractAt("Trick42Token", this.deploymentInfo.token);
            return this;
        } catch (error) {
            throw new Error("deployment-info.json not found. Please deploy contracts first.");
        }
    }

    async getBalance(address) {
        if (!address) {
            const [signer] = await ethers.getSigners();
            address = signer.address;
        }
        const balance = await this.token.balanceOf(address);
        return ethers.formatEther(balance);
    }

    async getTokenInfo() {
        const name = await this.token.name();
        const symbol = await this.token.symbol();
        const totalSupply = await this.token.totalSupply();
        const decimals = await this.token.decimals();

        return {
            name,
            symbol,
            totalSupply: ethers.formatEther(totalSupply),
            decimals,
            address: this.deploymentInfo.token
        };
    }

    async isValidator(address) {
        if (!address) {
            const [signer] = await ethers.getSigners();
            address = signer.address;
        }
        const VALIDATOR_ROLE = await this.token.VALIDATOR_ROLE();
        return await this.token.hasRole(VALIDATOR_ROLE, address);
    }

    getBSCScanLink(type = 'token') {
        const baseUrl = 'https://testnet.bscscan.com';
        switch (type) {
            case 'token':
                return `${baseUrl}/address/${this.deploymentInfo.token}`;
            case 'multisig':
                return `${baseUrl}/address/${this.deploymentInfo.multisigWallet}`;
            default:
                return baseUrl;
        }
    }
}

module.exports = {
    UserTools,
    
    // Quick access function
    async createUserTools() {
        const tools = new UserTools();
        return await tools.init();
    }
};

/**
 * Usage Examples:
 * 
 * const { createUserTools } = require('./user');
 * const userTools = await createUserTools();
 * const balance = await userTools.getBalance();
 * console.log(`Your balance: ${balance} 42SK8`);
 */
