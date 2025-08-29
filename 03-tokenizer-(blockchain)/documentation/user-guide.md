# 42Skate Token User Guide

## Welcome to the Future of Skateboarding! 🛹

This guide will help you get started with 42Skate Token (42SK8), whether you're a skater looking to earn tokens, a validator wanting to support the community, or just interested in the ecosystem.

## Table of Contents

1. [Getting Started](#getting-started)
2. [For Skaters](#for-skaters)
3. [For Validators](#for-validators)
4. [Using Your Tokens](#using-your-tokens)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

npx hardhat run ../deployment/scripts/deploy-basic.js --network localhost


## 1. Getting Started

### What You'll Need

- **MetaMask Wallet** - [Download here](https://metamask.io/)
- **Test BNB** - For gas fees (get free from [faucet](https://testnet.bnbchain.org/faucet-smart))
- **Trick42 Tokens** - Earned through validations

### Setting Up MetaMask

#### Step 1: Install MetaMask
1. Go to [metamask.io](https://metamask.io/)
2. Download for your browser/mobile
3. Create a new wallet
4. **SAVE YOUR SEED PHRASE SECURELY!**

#### Step 2: Add BNB Testnet
1. Click the network dropdown (usually says "Ethereum Mainnet")
2. Click "Add Network"
3. Enter these details:
   - **Network Name**: BNB Smart Chain Testnet
   - **RPC URL**: `https://data-seed-prebsc-1-s1.binance.org:8545/`
   - **Chain ID**: `97`
   - **Symbol**: `tBNB`
   - **Explorer**: `https://testnet.bscscan.com`

#### Step 3: Get Test BNB
1. Copy your wallet address (click account name)
2. Go to [BNB Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
3. Paste your address
4. Complete captcha
5. Click "Give me BNB"

#### Step 4: Add 42SK8 Token
1. In MetaMask, click "Import Tokens"
2. Enter Token Address: `[CONTRACT_ADDRESS]`
3. Symbol should auto-fill as "42SK8"
4. Click "Add Custom Token"

---

## 2. For Skaters

### How to Earn 42SK8 Tokens

Tokens are earned when a validator confirms your tricks. Here's how it works:

1. **Perform a Trick** - Land it clean!
2. **Get Validated** - A validator witnesses and confirms
3. **Receive Tokens** - Automatically sent to your wallet

### Token Rewards by Difficulty

| Trick Difficulty | Examples | 42SK8 Reward |
|-----------------|----------|------------|
| 1-2 (Basic) | Ollie, Manual | 5-10 42SK8 |
| 3-4 (Easy) | Kickflip, Boardslide | 15-20 42SK8 |
| 5-6 (Medium) | Tre Flip, Blunt | 25-30 42SK8 |
| 7-8 (Hard) | Laser Flip, Nollie Inward Heel | 35-40 42SK8 |
| 9-10 (Pro) | 900, Triple Kickflip | 45-50 42SK8 |

### Validation Rules

- **Cooldown**: 5 minutes between validations
- **Clean Landing**: Trick must be landed properly
- **Original**: No repeated tricks in same session
- **Witnessed**: Validator must see the trick

### Building Your Reputation

- Consistent progression increases credibility
- Higher difficulty tricks boost reputation
- Community engagement matters
- Clean style counts!

---

## 3. For Validators

### Becoming a Validator

Validators are trusted community members who verify tricks. Requirements:

1. **Nomination** - Community or admin nomination
2. **Knowledge** - Deep understanding of skateboarding
3. **Commitment** - Regular availability
4. **Integrity** - Fair and honest assessments

### Validator Responsibilities

#### Assessing Tricks
- Verify trick completion
- Rate difficulty (1-10)
- Ensure authenticity
- Maintain standards

#### Daily Limits
- Maximum 1,000 42SK8 can be minted per day
- Prevents inflation
- Ensures fair distribution

#### Best Practices
1. **Be Fair** - Consistent standards
2. **Be Present** - Active at spots/events
3. **Be Supportive** - Encourage progression
4. **Be Honest** - No favoritism

### Validator Commands (Technical)

If you're interacting via contract:

```javascript
// Validate a trick
validateTrick(skaterAddress, "Kickflip", 5)

// Check your daily limit
getValidatorInfo(yourAddress)
```

---

## 4. Using Your Tokens

### Current Uses

1. **Reputation** - Prove your skills
2. **Event Entry** - Token-gated competitions
3. **Trading** - Exchange with others
4. **Holding** - Build your collection

### Future Uses (Roadmap)

1. **Gear Purchases** - Partner shops
2. **NFT Minting** - Trick video NFTs
3. **Voting Rights** - Governance participation
4. **Staking** - Earn rewards

### Transferring Tokens

#### Send via MetaMask:
1. Open MetaMask
2. Select 42SK8 token
3. Click "Send"
4. Enter recipient address
5. Enter amount
6. Confirm transaction

#### Send via BscScan:
1. Go to contract on BscScan
2. Connect wallet
3. Use `transfer` function
4. Enter details
5. Write transaction

---

## 5. Common Tasks

### Check Your Balance

**MetaMask**: 
- Open wallet, view 42SK8 balance

**BscScan**:
1. Go to [testnet.bscscan.com](https://testnet.bscscan.com)
2. Search your address
3. Check token balances

### View Your Validations

On BscScan:
1. Go to 42SK8 contract
2. Click "Read Contract"
3. Use `getValidation` with ID

### Find Validators

- Check local skate spots
- Join Discord community
- Attend 42SK8 events
- Ask in forums

### Report Issues

1. Document the problem
2. Include transaction hash
3. Contact support on Discord
4. Be patient - we're here to help!

---

## 6. Troubleshooting

### Common Issues & Solutions

#### "Insufficient Funds" Error
- **Problem**: Not enough BNB for gas
- **Solution**: Get more test BNB from faucet

#### Transaction Failed
- **Problem**: Various reasons
- **Solutions**:
  - Check you're on right network
  - Increase gas limit
  - Wait and retry
  - Check wallet connection

#### Can't See Tokens
- **Problem**: 42SK8 not showing in wallet
- **Solution**: Import token contract address

#### Validation Not Working
- **Problem**: Can't get validated
- **Possible Issues**:
  - Still in cooldown period
  - Validator daily limit reached
  - Contract paused
  - Invalid trick parameters

### MetaMask Tips

1. **Always verify** network (BNB Testnet)
2. **Keep seed phrase** secure and private
3. **Don't share** private keys
4. **Use hardware wallet** for large amounts
5. **Clear cache** if issues persist

---

## 7. FAQ

### General Questions

**Q: What is Trick42 Token?**
A: A blockchain token that rewards skateboarders for landing tricks, creating a permanent record of achievements.

**Q: Is this real money?**
A: Currently on testnet with no real value. Future mainnet deployment will have real value.

**Q: How do tricks get validated?**
A: Approved validators witness tricks and submit validation transactions.

**Q: Can I validate my own tricks?**
A: No, self-validation is not allowed to maintain integrity.

### Token Questions

**Q: How many tokens exist?**
A: Maximum supply is 42 million 42SK8, minted gradually through validations.

**Q: Can I buy 42SK8?**
A: Currently earned only through validations. Future exchanges possible.

**Q: What affects token rewards?**
A: Trick difficulty (1-10 scale) determines reward amount.

**Q: Is there a minimum to transfer?**
A: No minimum, but consider gas fees.

### Technical Questions

**Q: What blockchain is this on?**
A: BNB Smart Chain (Testnet currently, mainnet planned).

**Q: Are contracts audited?**
A: Testnet contracts are unaudited. Mainnet will be professionally audited.

**Q: Can I integrate 42SK8 in my app?**
A: Yes! Contract is open source. Check documentation.

**Q: What's the contract address?**
A: `[CONTRACT_ADDRESS_HERE]`

### Validator Questions

**Q: How do I become a validator?**
A: Get nominated by community or admins based on skateboarding knowledge and reputation.

**Q: What are validator limits?**
A: 1,000 42SK8 daily mint limit per validator.

**Q: Can validators be removed?**
A: Yes, for inactivity or unfair validations.

**Q: Do validators get paid?**
A: Currently no direct payment, but future incentive models planned.

### Future Questions

**Q: When mainnet?**
A: After thorough testing and audit completion.

**Q: Mobile app coming?**
A: Yes, planned for Q2 2025.

**Q: Will there be competitions?**
A: Yes, token-gated events planned.

**Q: Can I suggest features?**
A: Absolutely! Join our Discord.

---

## Need More Help?

### Contact Us

- **Discord**: [Join Server]
- **Twitter**: @Trick42Token  
- **Email**: support@trick42.io
- **Website**: https://trick42.io (Coming Soon)

### Resources

- [Contract on BscScan](https://testnet.bscscan.com/address/[CONTRACT])
- [GitHub Repository](#)
- [Video Tutorials](#)
- [Community Forum](#)

---

## Safety Reminders

1. **Never share** your private key or seed phrase
2. **Always verify** you're on the correct network
3. **Double-check** addresses before sending
4. **Start small** when learning
5. **Ask questions** - community is here to help!

---

*Keep skating, keep progressing, keep earning! 🛹*

**Version**: 1.0  
**Last Updated**: January 2025