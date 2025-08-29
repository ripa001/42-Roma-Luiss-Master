# 🎯 SKATE42Token Scripts

This folder contains all interaction and testing scripts for the SKATE42Token ecosystem.

## 📁 Structure

```
scripts/
├── admin/
│   ├── multisig-admin-helper.js     # MultiSig governance utility class
│   └── debug-multisig.js            # Debug multisig operations
├── user/
│   ├── get-tokens.js                # Get tokens for testing
│   ├── get-more-tokens.js           # Request additional tokens
│   ├── check-my-balance.js          # Check token balance
│   └── check-balance.js             # Balance checker utility
└── README.md                        # This file
```

## 🚀 Quick Start

### For Users 👤

```bash
# Check your token balance
npx hardhat run scripts/user/check-my-balance.js --network bnbTestnet

# Get tokens for testing
npx hardhat run scripts/user/get-tokens.js --network bnbTestnet
```

### For Admins �️

```bash
# Use multisig governance utilities
npx hardhat run scripts/admin/multisig-admin-helper.js --network bnbTestnet

# Debug multisig operations
npx hardhat run scripts/admin/debug-multisig.js --network bnbTestnet
```

### For Testing 🧪

```bash
# Complete system test
npx hardhat run scripts/full-workflow-test.js --network bnbTestnet

# Community workflow simulation
npx hardhat run scripts/community-test.js --network bnbTestnet

# MetaMask integration test
npx hardhat run scripts/test-with-metamask.js --network bnbTestnet
```

## 📋 Script Categories

### 👤 User Scripts (`user/`)
- **Purpose**: End-user interactions with the token
- **Features**: Balance checks, token requests, basic operations
- **Target**: Regular users, skaters, validators

### 🛡️ Admin Scripts (`admin/`)
- **Purpose**: Administrative and governance operations
- **Features**: MultiSig operations, validator management, system controls
- **Target**: Project administrators, governance participants

### 🧪 Testing Scripts (root)
- **Purpose**: System testing, validation, integration tests
- **Features**: Comprehensive testing, workflow simulation, debugging
- **Target**: Developers, QA, integration testing

## 🎯 Key Scripts

### `full-workflow-test.js` ⭐ **RECOMMENDED**
Complete system test covering:
- Video submission and validation
- Token rewards distribution  
- MultiSig governance operations
- MetaMask integration

### `community-test.js`
Simulates real community interactions:
- Multiple user scenarios
- Validator rewards
- Community governance

### `admin/multisig-admin-helper.js`
Powerful governance utility:
- Add/remove validators
- Update system parameters
- Emergency controls
- Transaction management

## 🔧 Prerequisites

1. **Deployed contracts** (use deployment scripts first)
2. **BSC testnet setup** in hardhat.config.js
3. **deployment-info.json** with contract addresses
4. **BNB in wallet** for gas fees

## 🌐 Network Support

- **BSC Testnet** (recommended): `--network bnbTestnet`
- **BSC Mainnet**: `--network bnbMainnet`
- **Localhost**: `--network localhost`

## � MetaMask Integration

All scripts support MetaMask integration:
1. **Import token**: Use contract address from deployment-info.json
2. **View transactions**: BSCScan links provided in output
3. **Interact directly**: Use MetaMask with contract addresses

## 🔒 Security Notes

- **Private keys**: Never hardcode private keys in scripts
- **Testnet only**: Most scripts designed for testnet use
- **Gas limits**: Scripts include appropriate gas limit settings
- **Error handling**: Comprehensive error handling and recovery

## 🆘 Troubleshooting

### Common Issues:
- **"deployment-info.json not found"**: Run deployment scripts first
- **"Insufficient gas"**: Ensure wallet has BNB
- **"Network timeout"**: Check network configuration
- **"Contract not deployed"**: Verify contract addresses

### Debug Commands:
```bash
# Check deployment status
ls -la deployment-info.json

# Verify network connection
npx hardhat console --network bnbTestnet

# Check contract deployment
npx hardhat run scripts/admin/debug-multisig.js --network bnbTestnet
```

## 📚 Related Documentation

- **Deployment**: `../deployment/README.md`
- **User Guide**: `../documentation/user-guide.md`
- **API Reference**: Contract documentation in `../contracts/`
- **Testing Guide**: Test documentation in `../test/`
