# 🚀 SKATE42Token Deployment Guide

## 📋 Prerequisites

Before deploying the SKATE42Token, ensure you have:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **MetaMask** wallet - [Download](https://metamask.io/)
3. **Test BNB** - Get from [BNB Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
4. **BscScan API Key** (optional) - [Get API Key](https://bscscan.com/myapikey)

## 🛠️ Step 1: Environment Setup

### 1.1 Install Dependencies

```bash
cd code
npm install
```

This will install:
- Hardhat development environment
- OpenZeppelin contracts (AccessControl, ERC20, Pausable)
- Testing utilities and scripts
- BSC network configuration

### 1.2 Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your values:
```env
PRIVATE_KEY=your_metamask_private_key_without_0x
BSC_API_KEY=your_bscscan_api_key_optional
```

**⚠️ Security Warning**: Never commit your `.env` file or share your private key!

## 📱 Step 2: MetaMask Configuration

### 2.1 Add BNB Smart Chain Testnet

1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Add manually with these settings:

- **Network Name**: BSC Testnet
- **RPC URL**: `https://data-seed-prebsc-1-s1.bnbchain.org:8545`
- **Chain ID**: `97`
- **Currency Symbol**: `BNB`
- **Block Explorer**: `https://testnet.bscscan.com`

### 2.2 Get Test BNB

1. Visit [BNB Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
2. Connect your MetaMask wallet
3. Request test BNB (you need ~0.1 BNB for deployment)
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **Chain ID**: 97
- **Currency Symbol**: tBNB
- **Block Explorer**: https://testnet.bscscan.com

### 2.2 Get Test BNB

1. Visit [BNB Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
2. Enter your MetaMask address
3. Complete captcha and request 0.5 BNB
4. Wait for transaction confirmation

## Step 3: Compile and Test

### 3.1 Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 10 Solidity files successfully
```

### 3.2 Run Tests

```bash
npx hardhat test
```

All tests should pass:
```
Trick42Token
  ✓ Deployment tests...
  ✓ Validator management tests...
  ✓ Trick validation tests...
  ...
```

## Step 4: Deploy to BNB Testnet

### 4.1 Run Deployment Script

```bash
npx hardhat run ../deployment/scripts/deploy.js --network bnbTestnet
```

### 4.2 Expected Output

```
🛹 Starting Trick42Token deployment...
Deploying contracts with account: 0x...
Account balance: 0.5 BNB

📝 Deploying Trick42Token...
✅ Trick42Token deployed to: 0x...

📊 Contract Information:
- Name: Trick42 Token
- Symbol: T42
- Decimals: 18
- Total Supply: 0.0
- Max Supply: 42000000.0

🔐 Access Control:
- Deployer has DEFAULT_ADMIN_ROLE: true
- Deployer has ADMIN_ROLE: true
- Deployer has VALIDATOR_ROLE: true

🎉 Deployment complete!
```

### 4.3 Save Contract Address

Copy and save the deployed contract address from the output.

## Step 5: Verify Contract on BscScan

### 5.1 Automatic Verification

If you provided a BscScan API key, the deployment script attempts automatic verification.

### 5.2 Manual Verification

If automatic verification fails:

```bash
npx hardhat verify --network bnbTestnet YOUR_CONTRACT_ADDRESS
```

### 5.3 Check on BscScan

Visit: `https://testnet.bscscan.com/address/YOUR_CONTRACT_ADDRESS`

## Step 6: Post-Deployment Setup

### 6.1 Add Initial Validators

Using Hardhat console:

```bash
npx hardhat console --network bnbTestnet

const trick42 = await ethers.getContractAt("Trick42Token", "YOUR_CONTRACT_ADDRESS");
await trick42.addValidator("VALIDATOR_ADDRESS");
```

### 6.2 Configure Token in MetaMask

1. Open MetaMask
2. Click "Import Tokens"
3. Enter:
   - Token Address: YOUR_CONTRACT_ADDRESS
   - Token Symbol: T42
   - Decimals: 18

## Step 7: Interact with Contract

### 7.1 Using BscScan

1. Go to your contract on BscScan
2. Click "Contract" → "Write Contract"
3. Connect MetaMask
4. Execute functions

### 7.2 Using Hardhat Console

```javascript
// Connect to deployed contract
const trick42 = await ethers.getContractAt("Trick42Token", "YOUR_CONTRACT_ADDRESS");

// Validate a trick
await trick42.validateTrick("SKATER_ADDRESS", "Kickflip", 5);

// Check balance
const balance = await trick42.balanceOf("SKATER_ADDRESS");
console.log("Balance:", ethers.utils.formatEther(balance));
```

## Troubleshooting

### Common Issues

1. **Insufficient funds**: Ensure you have test BNB from the faucet
2. **Wrong network**: Check MetaMask is on BNB Testnet (Chain ID: 97)
3. **Gas errors**: Increase gas limit in transaction
4. **Nonce issues**: Reset account in MetaMask Settings → Advanced

### Getting Help

- [BNB Chain Documentation](https://docs.bnbchain.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Forum](https://forum.openzeppelin.com/)

## Next Steps

1. **Test thoroughly** on testnet before mainnet
2. **Audit** the smart contract code
3. **Document** all validator procedures
4. **Plan** token distribution strategy
5. **Build** frontend interface for easier interaction

## Security Considerations

- Never deploy to mainnet without proper testing
- Get contract audited before mainnet deployment
- Use multisig wallets for admin functions
- Implement monitoring for unusual activity
- Keep private keys secure and never share them