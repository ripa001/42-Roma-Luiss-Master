# 🛹 42Skate Token Scripts

This directory contains development and interaction scripts for the 42Skate Token project.

## 📁 Directory Structure

### Root Scripts (Interactive/User Actions)
- `get-tokens.js` - Get your first 42SK8 tokens through trick validation
- `get-more-tokens.js` - Get additional tokens by validating multiple tricks

### 🧪 Testing (`testing/`)
- `test-token.js` - Comprehensive token functionality testing
- `test-validation.js` - Test the trick validation system

### 🔧 Tools (`tools/`)
- `check-balance.js` - Check token balance for any address
- `check-my-balance.js` - Check your own token balance

## 🚀 Usage

Run scripts from the `code/` directory using Hardhat:

```bash
# Interactive scripts (get tokens)
npx hardhat run scripts/get-tokens.js --network bnbTestnet
npx hardhat run scripts/get-more-tokens.js --network bnbTestnet

# Testing scripts
npx hardhat run scripts/testing/test-token.js --network bnbTestnet

# Utility scripts
npx hardhat run scripts/tools/check-balance.js --network bnbTestnet
```

## 📋 Notes

- All scripts use ethers.js v6 syntax
- Scripts are configured for BSC Testnet (Chain ID: 97)
- Make sure you have testnet BNB for gas fees
- Contract address is hardcoded in scripts: `0x8b0c3e39e1fF40001D94B0f2094b64aDF4406d58`
