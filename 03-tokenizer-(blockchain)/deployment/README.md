# 🚀 SKATE42Token Deployment Scripts

This folder contains all the deployment scripts for the SKATE42Token ecosystem.

## 📁 Structure

```
deployment/
├── scripts/
│   ├── deploy.js                    # Original basic deployment
│   ├── deploy-simple-testnet.js     # Production BSC testnet deployment ⭐
│   ├── deploy-with-multisig.js      # Full multisig governance deployment
│   └── deploy-to-testnet.js         # Legacy deployment script
├── assets/
│   └── logo.png                     # Token logo
├── deployment-guide.md              # Detailed deployment guide
├── .env.example                     # Environment variables template
└── README.md                        # This file
```

## 🎯 Quick Start

### For BSC Testnet (Recommended)

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env with your PRIVATE_KEY and BSC_API_KEY

# 2. Deploy to BSC Testnet
cd ../code
npx hardhat run ../deployment/scripts/deploy-simple-testnet.js --network bnbTestnet
```

### For Production with MultiSig

```bash
# Deploy with full multisig governance
npx hardhat run ../deployment/scripts/deploy-with-multisig.js --network bnbTestnet
```

## 📋 Scripts Overview

### `deploy-simple-testnet.js` ⭐ **RECOMMENDED**
- **Purpose**: Production-ready deployment for BSC testnet
- **Features**: 1-of-1 multisig for testing, governance transfer, comprehensive logging
- **Output**: Creates `deployment-info.json` with contract addresses
- **Use Case**: Testing, development, demos

### `deploy-with-multisig.js`
- **Purpose**: Full production deployment with real multisig
- **Features**: 2-of-3 multisig, multiple owners, complete governance setup
- **Use Case**: Production mainnet deployment

### `deploy-to-testnet.js` (Legacy)
- **Purpose**: Simple deployment without multisig
- **Status**: Deprecated, use `deploy-simple-testnet.js` instead

## 📊 After Deployment

1. **Contract addresses** are saved to `deployment-info.json`
2. **BSCScan links** are provided in console output
3. **MetaMask integration** ready with token address
4. **Admin functions** transferred to multisig wallet

## 🔒 Security Notes

- **Testnet**: Uses 1-of-1 multisig for easy testing
- **Mainnet**: Use 2-of-3 or 3-of-5 multisig with trusted parties
- **Private keys**: Never commit `.env` files to version control
- **Verification**: All contracts auto-verify on BSCScan

## 🌐 Supported Networks

- **BSC Testnet**: Chain ID 97 (recommended for testing)
- **BSC Mainnet**: Chain ID 56 (production)
- **Localhost**: For local development

## 📱 MetaMask Integration

After deployment, users can:
1. Add BSC Testnet to MetaMask
2. Import token using contract address from `deployment-info.json`
3. View balances and transactions
4. Interact with smart contracts

## 🆘 Troubleshooting

- **Gas issues**: Ensure you have BNB for gas fees
- **Network errors**: Check RPC endpoints in `hardhat.config.js`
- **Verification failed**: BSC API key may be missing or invalid
- **Multisig issues**: Check owner addresses and required confirmations

## 📚 Next Steps

After deployment, see:
- `../code/scripts/testing/` - Testing scripts
- `../code/scripts/user/` - User interaction scripts
- `../code/scripts/admin/` - Admin and governance tools
