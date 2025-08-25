# 🚀 Deployment Scripts

This directory contains production deployment scripts for the 42Skate Token project.

## 📁 Contents

- `deploy.js` - Main deployment script for BSC Testnet/Mainnet

## 🛠️ Usage

Deploy to BSC Testnet:
```bash
cd ../code
npx hardhat run ../deployment/scripts/deploy.js --network bnbTestnet
```

Deploy to BSC Mainnet (when ready):
```bash
cd ../code
npx hardhat run ../deployment/scripts/deploy.js --network bnbMainnet
```

## 📋 Requirements

- Sufficient BNB for deployment (at least 0.05 BNB)
- Configured `.env` file with private key
- Network configured in `hardhat.config.js`

## ✅ Current Deployment

- **Network**: BSC Testnet (Chain ID: 97)
- **Contract Address**: `0x8b0c3e39e1fF40001D94B0f2094b64aDF4406d58`
- **Status**: ✅ Successfully deployed and verified
