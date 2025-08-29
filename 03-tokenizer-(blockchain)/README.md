# 🛹 SKATE42Token - Decentralized Skateboarding Ecosystem

[![BSC Testnet](https://img.shields.io/badge/BSC-Testnet-yellow)](https://testnet.bscscan.com)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue)](https://soliditylang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🎯 Overview

SKATE42Token revolutionizes the skateboarding community by creating a **decentralized validation and reward system** for skateboarding tricks. Built on **BNB Smart Chain**, it bridges traditional skateboarding culture with blockchain technology, creating permanent, verifiable records of achievements while fostering community engagement.

### 🚀 Why SKATE42Token?

- **🏆 Skill Recognition**: Validate and reward skateboarding achievements
- **👥 Community Governance**: Decentralized decision-making via MultiSig
- **📹 Video Validation**: Submit videos, get validated by community validators
- **💰 Instant Rewards**: Earn 42SK8 tokens for validated tricks
- **🔒 Permanent Records**: Immutable skateboarding achievement history

## ⚡ Why BNB Smart Chain?

- **💸 Low Fees**: ~$0.01 per validation (vs $20+ on Ethereum)
- **🚀 High Performance**: 3-second transaction finality
- **🔧 EVM Compatible**: Leverage existing Solidity infrastructure
- **🌍 Growing Ecosystem**: 150M+ users, vibrant dApp community
- **📈 Scalable**: 2,000+ TPS for mass adoption

## 🏗️ Architecture

```
SKATE42Token Ecosystem
├── 🎯 SKATE42Token.sol           # Main ERC20 token contract
├── 🏛️  SimpleMultiSigWallet.sol  # Decentralized governance
├── 📹 Video Validation System    # Submit/validate trick videos
├── 👥 Validator Network          # Community-driven validation
└── 🔐 Role-Based Access Control  # Secure admin functions
```

## 📊 Token Details

- **Name**: SKATE42Token (Trick42Token)
- **Symbol**: 42SK8
- **Decimals**: 18
- **Network**: BNB Smart Chain Testnet
- **Chain ID**: 97
- **Current Supply**: Dynamic (minted per validation)
- **Max Daily Mint**: 500 42SK8 per validator

## 🎮 Key Features

### 🎬 Video Validation System
- Submit skateboarding trick videos with difficulty claims
- Community validators assess and reward performances
- Automatic token distribution based on difficulty ratings

### 🏆 Validator Economy
- Stake tokens to become a validator
- Earn commissions for accurate validations
- Reputation system with performance tracking
- Daily mint limits to prevent inflation

### 🏛️ MultiSig Governance
- Decentralized control of admin functions
- Multi-signature wallet for critical operations
- Community-driven parameter updates
- Transparent governance processes

### 🔒 Security Features
- Role-based access control (OpenZeppelin)
- Pausable contract for emergencies
- Reentrancy protection
- Validation cooldowns to prevent spam

## 📁 Project Structure

```
03-tokenizer-(blockchain)/
├── 📋 README.md
├── 💼 code/
│   ├── 📜 contracts/
│   │   ├── SKATE42Token.sol      # Main token contract
│   │   └── SimpleMultiSigWallet.sol
│   ├── 🧪 test/
│   │   └── [70+ comprehensive tests]
│   ├── 📱 scripts/
│   │           ...
│   └── ⚙️ hardhat.config.js
├── 🚀 deployment/
│   ├── scripts/
│   │           ...
│   ├── deployment-guide.md
│   └── .env.example
└── 📚 documentation/
    ├── user-guide.md
    ├── multisig-integration-guide.md
    └── whitepaper.md
```

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- MetaMask wallet
- Test BNB from [Faucet](https://testnet.bnbchain.org/faucet-smart)

### 2. Installation
```bash
cd code
npm install
```

### 3. Deploy to BSC Testnet
```bash
# Set up environment
cp ../deployment/.env.example ../deployment/.env
# Add your PRIVATE_KEY to .env

# Deploy contracts
npx hardhat run ../deployment/scripts/deploy-simple-testnet.js --network bnbTestnet
```

### 4. Test Everything
```bash
# Run complete system test
npx hardhat run scripts/full-workflow-test.js --network bnbTestnet

# Test community features
npx hardhat run scripts/community-test.js --network bnbTestnet
```

## 🎯 Usage Examples

### For Skaters 🛹
```bash
# Check your balance
npx hardhat run scripts/user/check-my-balance.js --network bnbTestnet

# Submit a video (coming soon)
# Videos currently validated through validator interface
```

### For Validators 🏆
```bash
# Test validation workflow
npx hardhat run scripts/full-workflow-test.js --network bnbTestnet

# Check validator status
npx hardhat run scripts/admin/debug-multisig.js --network bnbTestnet
```

### For Admins 🛡️
```bash
# Use governance tools
npx hardhat run scripts/admin/multisig-admin-helper.js --network bnbTestnet
```

## 📱 MetaMask Integration

1. **Add BSC Testnet** to MetaMask
2. **Import Token**: Use contract address from deployment
3. **View Balance**: See your 42SK8 tokens
4. **Interact**: Use BSCScan for advanced features

## 🔬 Testing

Our comprehensive test suite includes **70+ tests** covering:
- ✅ Token functionality (minting, burning, transfers)
- ✅ Video submission and validation workflows
- ✅ Validator role management and staking
- ✅ MultiSig governance operations
- ✅ Security features and access controls
- ✅ Edge cases and error handling

```bash
# Run all tests
npm test

# Run specific test category
npx hardhat test test/Token.test.js
npx hardhat test test/VideoFeatures.test.js
npx hardhat test test/ValidatorRewards.test.js
```

# Run tests
npx hardhat test

# Deploy to BNB Testnet
npx hardhat run deployment/scripts/deploy.js --network bnbTestnet
```

### Interacting with the Contract

```bash
# Verify contract on BscScan
npx hardhat verify --network bnbTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Use Hardhat console for interaction
npx hardhat console --network bnbTestnet
```

## Design Decisions

### Minting Restrictions
- Only validators can mint new tokens to prevent inflation
- Minting is tied to trick validation events
- Daily minting limits per validator

### Validator System
- Multi-signature approval for adding new validators
- Validators stake T42 tokens as collateral
- Reputation-based validator selection

### Security Measures
- OpenZeppelin contracts for battle-tested security
- Reentrancy guards on all state-changing functions
- Access control for administrative functions
- Pausable mechanism for emergency situations

## Use Cases

1. **Trick Competitions**: Entry tokens for online/offline competitions
2. **Skill Verification**: Proof of trick mastery for sponsorships
3. **Community Rewards**: Incentivizing trick tutorials and mentorship
4. **Event Access**: VIP access to skateboarding events
5. **Marketplace**: Trading trick NFTs or skateboarding gear

## Future Roadmap

- Q2 2025: Mobile app integration for video submissions
- Q3 2025: AI-powered trick detection system
- Q4 2025: Partnership with major skateboarding brands
- Q1 2026: DAO governance implementation

## Contributing

We welcome contributions! Please see our contributing guidelines in the documentation folder.

## License

MIT License - see LICENSE file for details

## Contact

- Website: https://trick42.io (Coming Soon)
- Twitter: @Trick42Token
- Discord: Trick42 Community

---

Built with ❤️ by the skateboarding and blockchain community