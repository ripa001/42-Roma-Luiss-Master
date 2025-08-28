# 🔐 SKATE42Token MultiSig Integration Guide

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Operations Guide](#operations-guide)
5. [Security Guidelines](#security-guidelines)
6. [Troubleshooting](#troubleshooting)

## Overview

### What is MultiSig Governance?

Multi-signature (multisig) governance requires multiple authorized parties to approve transactions before they can be executed. This eliminates single points of failure and provides transparent, democratic control over critical functions.

### Why Use MultiSig for SKATE42Token?

- **Security**: No single person can compromise the system
- **Transparency**: All governance decisions are recorded on-chain  
- **Decentralization**: Distributed control among trusted parties
- **Accountability**: Clear audit trail of all administrative actions

### Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Signers       │    │  SimpleMultiSig  │    │ SKATE42Token    │
│  (2-of-3)       │───▶│     Wallet       │───▶│   Contract      │
│                 │    │                  │    │                 │
│ • Admin 1       │    │ • Submit Tx      │    │ • Admin funcs   │
│ • Admin 2       │    │ • Confirm Tx     │    │ • Validator mgmt│
│ • Admin 3       │    │ • Execute Tx     │    │ • Pause/Unpause │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Quick Start

### 1. Deploy the System

```bash
# Clone and setup
git clone <repo>
cd 03-tokenizer-(blockchain)/code
npm install

# Deploy with multisig governance
npx hardhat run scripts/deploy-with-multisig.js --network localhost
```

### 2. Verify Deployment

```bash
# Run integration tests
npx hardhat test test/TokenMultiSigIntegration.test.js

# Check governance status
node scripts/check-governance-status.js
```

### 3. Basic Operation

```javascript
// Initialize governance helper
const { MultiSigTokenGovernance } = require('./scripts/multisig-admin-helper.js');
const governance = await MultiSigTokenGovernance.create(multisigAddr, tokenAddr);

// Add validator (requires 2 signatures)
await governance.proposeAddValidator(validatorAddr, signer1);
await governance.confirmTransaction(0, signer2);
```

## Detailed Setup

### Prerequisites

- Node.js 16+
- Hardhat development environment
- 3+ Ethereum accounts with private keys
- Test ETH for gas fees

### 1. Environment Configuration

Create `.env` file:
```env
# Network configuration
PRIVATE_KEY_1=0x...  # First multisig owner
PRIVATE_KEY_2=0x...  # Second multisig owner  
PRIVATE_KEY_3=0x...  # Third multisig owner

# Network URLs
MAINNET_RPC_URL=https://...
TESTNET_RPC_URL=https://...

# Optional: Etherscan API for verification
ETHERSCAN_API_KEY=...
```

### 2. Customize Deployment

Edit `scripts/deploy-with-multisig.js`:

```javascript
// Configure multisig parameters
const MULTISIG_OWNERS = [
    "0x...", // Owner 1 address
    "0x...", // Owner 2 address  
    "0x..."  // Owner 3 address
];

const REQUIRED_CONFIRMATIONS = 2; // 2-of-3 multisig
```

### 3. Deploy to Testnet

```bash
# Deploy to BSC Testnet
npx hardhat run scripts/deploy-with-multisig.js --network bscTestnet

# Verify contracts (optional)
npx hardhat verify --network bscTestnet <contract-address>
```

### 4. Post-Deployment Verification

```javascript
// Verify governance transfer
const token = await ethers.getContractAt("Trick42Token", tokenAddress);
const multisig = await ethers.getContractAt("SimpleMultiSigWallet", multisigAddress);

// Check admin roles
const ADMIN_ROLE = await token.ADMIN_ROLE();
console.log("Multisig has admin role:", await token.hasRole(ADMIN_ROLE, multisigAddress));
console.log("Deployer has admin role:", await token.hasRole(ADMIN_ROLE, deployerAddress));
```

## Operations Guide

### Validator Management

#### Add Validator

```javascript
// Method 1: Using helper script
const governance = await MultiSigTokenGovernance.create(multisigAddr, tokenAddr);
const { txIndex } = await governance.proposeAddValidator(validatorAddr, signer1);
await governance.confirmTransaction(txIndex, signer2);

// Method 2: Direct contract interaction
const addValidatorData = token.interface.encodeFunctionData("addValidator", [validatorAddr]);
await multisig.connect(signer1).submitTransaction(tokenAddr, 0, addValidatorData);
await multisig.connect(signer2).confirmTransaction(0);
```

#### Remove Validator

```javascript
const { txIndex } = await governance.proposeRemoveValidator(validatorAddr, signer1);
await governance.confirmTransaction(txIndex, signer2);
```

#### Update Validator Reputation

```javascript
const { txIndex } = await governance.proposeUpdateValidatorReputation(
    validatorAddr, 
    150,  // new reputation score
    signer1
);
await governance.confirmTransaction(txIndex, signer2);
```

### Emergency Controls

#### Pause Contract

```javascript
// Emergency pause (useful for security incidents)
const { txIndex } = await governance.proposePause(signer1);
await governance.confirmTransaction(txIndex, signer2);

// Verify paused state
console.log("Contract paused:", await token.paused());
```

#### Unpause Contract

```javascript
const { txIndex } = await governance.proposeUnpause(signer1);
await governance.confirmTransaction(txIndex, signer2);
```

### Reward Distribution

```javascript
// Distribute weekly validator rewards
const { txIndex } = await governance.proposeDistributeWeeklyRewards(signer1);
await governance.confirmTransaction(txIndex, signer2);
```

### Transaction Management

#### Check Pending Transactions

```javascript
// Get all pending transactions
const pendingTxs = await governance.getPendingTransactions();
console.log(`${pendingTxs.length} transactions pending`);

// Get specific transaction details
const txDetails = await governance.getTransaction(0);
console.log("Confirmations:", txDetails.confirmations.length, "/", txDetails.required);
```

#### Revoke Confirmation

```javascript
// Signer can change their mind before execution
await governance.revokeConfirmation(0, signer1);
```

#### Monitor Transaction Status

```javascript
// Watch for confirmation events
multisig.on("ConfirmTransaction", (owner, txIndex) => {
    console.log(`${owner} confirmed transaction ${txIndex}`);
});

// Watch for execution events  
multisig.on("ExecuteTransaction", (owner, txIndex) => {
    console.log(`Transaction ${txIndex} executed by ${owner}`);
});
```

## Security Guidelines

### Key Management

1. **Hardware Wallets**: Use hardware wallets for owner keys
2. **Key Separation**: Never store multiple owner keys together
3. **Backup Strategy**: Secure backup of all owner keys
4. **Regular Rotation**: Consider periodic key rotation

### Operational Security

1. **Verify Transactions**: Always verify transaction details before signing
2. **Test First**: Test all operations on testnet first
3. **Monitor Activity**: Set up alerts for unexpected transactions
4. **Documentation**: Keep detailed records of all governance decisions

### Smart Contract Security

1. **Code Audits**: Professional audit before mainnet deployment
2. **Testing**: Comprehensive test coverage (>95%)
3. **Upgrades**: Plan for potential contract upgrades
4. **Monitoring**: Real-time monitoring of contract state

### Multisig Best Practices

```javascript
// Always verify transaction details
const tx = await multisig.getTransaction(txIndex);
console.log("Destination:", tx.destination);
console.log("Value:", ethers.formatEther(tx.value));
console.log("Data:", tx.data);

// Decode function call for verification
if (tx.destination === tokenAddress && tx.data !== "0x") {
    const decoded = token.interface.parseTransaction({ data: tx.data });
    console.log("Function:", decoded.name);
    console.log("Args:", decoded.args);
}
```

## Troubleshooting

### Common Issues

#### 1. Transaction Won't Execute

**Symptoms**: Transaction confirmed but not executed

**Causes & Solutions**:
```javascript
// Check confirmation count
const tx = await multisig.getTransaction(txIndex);
const required = await multisig.required();
if (tx.confirmations < required) {
    console.log(`Need ${required - tx.confirmations} more confirmations`);
}

// Check if already executed
if (tx.executed) {
    console.log("Transaction already executed");
}

// Check if destination call will fail
// Test the call manually first
```

#### 2. Cannot Confirm Transaction

**Symptoms**: `confirmTransaction()` call fails

**Solutions**:
```javascript
// Check if already confirmed
const alreadyConfirmed = await multisig.getConfirmation(txIndex, signerAddr);
if (alreadyConfirmed) {
    console.log("Already confirmed by this signer");
}

// Check if signer is owner
const isOwner = await multisig.isOwner(signerAddr);
if (!isOwner) {
    console.log("Signer is not a multisig owner");
}
```

#### 3. Function Call Fails

**Symptoms**: Transaction executes but internal call fails

**Solutions**:
```javascript
// Check token contract state
const isPaused = await token.paused();
const hasRole = await token.hasRole(ADMIN_ROLE, multisigAddr);

// Verify function parameters
// Test function call directly (will revert with error)
try {
    await token.connect(multisigAddr).addValidator(validatorAddr);
} catch (error) {
    console.log("Call would fail:", error.message);
}
```

### Recovery Procedures

#### Compromised Owner Key

1. **Immediate Actions**:
   - Other owners should avoid confirming any pending transactions
   - Deploy new multisig wallet with replacement owner
   - Transfer admin roles to new multisig

2. **Migration Process**:
   ```javascript
   // Deploy new multisig
   const newMultisig = await deployNewMultisig(newOwners, required);
   
   // Transfer admin roles
   const grantRoleData = token.interface.encodeFunctionData("grantRole", [
       ADMIN_ROLE, 
       newMultisigAddr
   ]);
   await oldMultisig.submitTransaction(tokenAddr, 0, grantRoleData);
   
   // Revoke old multisig roles
   const revokeRoleData = token.interface.encodeFunctionData("revokeRole", [
       ADMIN_ROLE,
       oldMultisigAddr  
   ]);
   await newMultisig.submitTransaction(tokenAddr, 0, revokeRoleData);
   ```

#### Lost Owner Key

1. **Assessment**: Determine if remaining owners can still meet requirements
2. **Continued Operation**: If yes, continue with reduced owner set
3. **Replacement**: Deploy new multisig if needed for full security

### Emergency Procedures

#### Circuit Breaker

```javascript
// Emergency pause if suspicious activity detected
const pauseData = token.interface.encodeFunctionData("pause", []);

// Submit with high priority
await multisig.submitTransaction(tokenAddr, 0, pauseData);

// Get second confirmation ASAP  
await multisig.connect(signer2).confirmTransaction(txIndex);
```

#### Recovery Mode

```javascript
// If multisig becomes unusable, use emergency admin (if exists)
// This should be a last resort and planned in advance

// Alternative: Deploy proxy pattern for upgradeability
// This allows migration to new governance system
```

### Getting Help

For additional support:

1. **Documentation**: Check the comprehensive docs in `/documentation/`
2. **Tests**: Review test cases in `/test/` for examples
3. **Community**: Join the project Discord/Telegram
4. **Issues**: Report bugs on GitHub repository

### Monitoring Scripts

Create monitoring scripts for production:

```javascript
// governance-monitor.js
setInterval(async () => {
    const pendingTxs = await governance.getPendingTransactions();
    if (pendingTxs.length > 0) {
        console.log(`⚠️  ${pendingTxs.length} pending governance transactions`);
        // Send alerts to administrators
    }
    
    const isPaused = await token.paused();
    if (isPaused) {
        console.log("🚨 Token contract is PAUSED");
        // Send urgent alert
    }
}, 60000); // Check every minute
```

This guide provides comprehensive coverage of the multisig integration. The system is designed to be secure, transparent, and easy to operate while maintaining the highest standards of decentralized governance.