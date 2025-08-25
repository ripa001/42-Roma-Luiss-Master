# SKATE42Token Project: Main Concepts Explained

This document provides a high-level, didactic explanation of the main concepts, architecture, and features of the SKATE42Token blockchain project. It is intended for developers, contributors, and anyone interested in understanding how the system works.

---

## 1. Project Overview

SKATE42Token is a blockchain-based platform designed to incentivize and reward skaters and validators for submitting and validating skateboarding trick videos. The system uses a custom ERC20 token (T42) and a set of smart contracts to manage:
- Token minting and transfers
- Video submission and validation
- Validator staking, reputation, and rewards
- Weekly reward pools and leaderboards

---

## 2. Key Actors

- **Skater:** A user who submits videos of skateboarding tricks to earn T42 tokens.
- **Validator:** A user who stakes tokens to gain the right to validate submitted videos. Validators earn rewards for honest and active participation.
- **Admin:** A privileged role that can manage validators, pause/unpause the contract, and trigger weekly reward distributions.

---

## 3. Main Features

### 3.1 Token (T42)
- Implements the ERC20 standard for fungible tokens.
- Used for staking, rewards, and all economic activities in the platform.
- Minted as rewards for skaters and validators.

### 3.2 Video Submission & Validation
- Skaters submit videos (IPFS hash or YouTube link) with trick type and claimed difficulty.
- Validators review and validate videos, assigning a final difficulty and optional notes.
- Each validation mints T42 tokens for the skater and a commission for the validator.
- Videos can be rejected with a reason, and submissions expire after a set time.

### 3.3 Validator Staking & Roles
- Users must stake a minimum amount of T42 to become validators.
- Validators are managed via roles (using OpenZeppelin AccessControl).
- Unstaking below the minimum removes validator status.

### 3.4 Validator Rewards System
- **Commission:** Validators earn a percentage of the reward for each validation.
- **Reputation Bonus:** High-reputation validators earn extra rewards.
- **Activity Bonus:** Validators who validate many tricks in a week earn additional bonuses.
- **Weekly Pool:** A fixed pool of T42 is distributed weekly among active validators, proportional to their activity.
- **Claiming:** Validators must claim their accumulated rewards.

### 3.5 Leaderboards & Stats
- The contract exposes functions to get validator leaderboards, reward pool stats, and video/validation details.
- Transparency and gamification are encouraged.

### 3.6 Pausing & Admin Controls
- The contract can be paused/unpaused by admins for security or upgrades.
- Admins can add/remove validators and update reputations.

---

## 4. Security & Best Practices
- Uses OpenZeppelin libraries for ERC20, AccessControl, Pausable, and ReentrancyGuard.
- Enforces cooldowns, daily mint limits, and maximum supply to prevent abuse.
- All critical actions are protected by role-based access control.

---

## 5. Testing & Development
- The project uses Hardhat, ethers.js, and Mocha/Chai for testing.
- Comprehensive test suites cover all major features and edge cases.
- Tests are located in the `code/test/` directory.

---

## 6. Extensibility
- The system is designed to be modular and upgradable.
- New reward mechanisms, validation types, or governance features can be added.

---

## 7. Getting Started
1. Install dependencies: `npm install`
2. Compile contracts: `npx hardhat compile`
3. Run tests: `npx hardhat test`
4. Deploy contracts: See deployment scripts in `code/scripts/`

---

## 8. Further Reading
- See the main contract: `code/contracts/SKATE42Token.sol`
- See the main test file: `code/test/Token.test.js`
- See the user and deployment guides in the `documentation/` and `deployment/` folders.

---

For any questions or contributions, please refer to the repository documentation or contact the project maintainers.
