// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title 42Skate Token
 * @dev BEP-20 Token for Skateboarding Trick Validation
 * 
 * This token serves as a reputation and reward system for the skateboarding community.
 * Validators can mint tokens to reward skaters for successfully performed tricks.
 */
contract Trick42Token is ERC20, ERC20Burnable, Pausable, AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Token metadata
    string public logoURI = "https://raw.githubusercontent.com/ripa001/42-Roma-Luiss-Master/refs/heads/main/03-tokenizer-(blockchain)/deployment/assets/logo.png";
    string public website = "https://42skate.io";
    string public description = "42Skate Token - Decentralized Skateboarding Trick Validation on BNB Chain";
    
    // Token economics
    uint256 public constant MAX_SUPPLY = 42_000_000 * 10**18; // 42 million tokens
    uint256 public constant DAILY_MINT_LIMIT = 1000 * 10**18; // 1000 tokens per validator per day
    uint256 public constant VALIDATION_COOLDOWN = 300; // 5 minutes between validations
    uint256 public constant VIDEO_EXPIRY_TIME = 7 days; // Video submission expires after 7 days
    
    // Validator reward economics
    uint256 public constant VALIDATOR_BASE_COMMISSION = 10; // 10% of minted tokens to validator
    uint256 public constant HIGH_REPUTATION_BONUS = 5; // Additional 5% for reputation >= 150
    uint256 public constant ACTIVITY_BONUS_THRESHOLD = 10; // Validations per day for bonus
    uint256 public constant ACTIVITY_BONUS_RATE = 3; // Additional 3% for high activity
    uint256 public constant WEEKLY_REWARD_POOL = 1000 * 10**18; // 1000 tokens weekly pool
    uint256 public constant VALIDATOR_STAKING_REQUIREMENT = 100 * 10**18; // 100 T42 to become validator
    
    // Video submission and validation structures
    struct VideoSubmission {
        address skater;
        string videoHash; // IPFS hash or platform video ID
        string videoUrl;  // Direct link to video
        string trickType;
        uint256 claimedDifficulty; // What skater claims (1-10)
        uint256 timestamp;
        bool isValidated;
        bool isExpired;
    }
    
    struct TrickValidation {
        address skater;
        address validator;
        uint256 videoId;
        uint256 amount;
        string trickType;
        uint256 timestamp;
        uint256 difficulty; // Final difficulty assigned by validator
        string validationNotes; // Optional validator comments
    }
    
    struct ValidatorInfo {
        bool isActive;
        uint256 totalValidations;
        uint256 dailyMinted;
        uint256 lastMintDay;
        uint256 reputation;
        uint256 stakedAmount; // Tokens staked by validator
        uint256 totalEarned; // Total rewards earned
        uint256 weeklyValidations; // Validations in current week
        uint256 lastWeekReset; // Last time weekly counter was reset
        uint256 lastRewardClaim; // Last time rewards were claimed
    }
    
    // State variables
    mapping(address => ValidatorInfo) public validators;
    mapping(address => uint256) public lastValidationTime;
    mapping(uint256 => TrickValidation) public validations;
    mapping(uint256 => VideoSubmission) public videoSubmissions;
    mapping(address => uint256[]) public skaterSubmissions; // Track submissions per skater
    mapping(address => uint256) public pendingRewards; // Rewards waiting to be claimed
    address[] public activeValidators; // Array of active validator addresses
    uint256 public validationCounter;
    uint256 public videoCounter;
    uint256 public totalMinted;
    uint256 public totalRewardPool; // Total accumulated rewards for distribution
    uint256 public lastWeeklyDistribution; // Last time weekly rewards were distributed
    
    // Events
    event VideoSubmitted(
        uint256 indexed videoId,
        address indexed skater,
        string videoHash,
        string videoUrl,
        string trickType,
        uint256 claimedDifficulty
    );
    
    event VideoValidated(
        uint256 indexed videoId,
        uint256 indexed validationId,
        address indexed skater,
        address validator,
        uint256 amount,
        string trickType,
        uint256 finalDifficulty,
        string validationNotes
    );
    
    event VideoRejected(
        uint256 indexed videoId,
        address indexed validator,
        string reason
    );
    
    event TrickValidated(
        uint256 indexed validationId,
        address indexed skater,
        address indexed validator,
        uint256 amount,
        string trickType,
        uint256 difficulty
    );
    
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event ValidatorReputationUpdated(address indexed validator, uint256 newReputation);
    event ValidatorRewardPaid(address indexed validator, uint256 amount, string rewardType);
    event ValidatorStaked(address indexed validator, uint256 amount);
    event ValidatorUnstaked(address indexed validator, uint256 amount);
    event WeeklyRewardsDistributed(uint256 totalAmount, uint256 validatorCount);
    
    /**
     * @dev Constructor initializes the token with name and symbol
     */
    constructor() ERC20("42Skate", "42SK8") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        
        // Initialize the first validator
        validators[msg.sender] = ValidatorInfo({
            isActive: true,
            totalValidations: 0,
            dailyMinted: 0,
            lastMintDay: 0,
            reputation: 100,
            stakedAmount: 0,
            totalEarned: 0,
            weeklyValidations: 0,
            lastWeekReset: block.timestamp,
            lastRewardClaim: block.timestamp
        });
        
        activeValidators.push(msg.sender);
        lastWeeklyDistribution = block.timestamp;
    }
    
    /**
     * @dev Submit a video for trick validation
     * @param videoHash IPFS hash or unique identifier of the video
     * @param videoUrl Direct URL to access the video
     * @param trickType Type/name of the trick performed
     * @param claimedDifficulty Difficulty claimed by skater (1-10)
     */
    function submitVideo(
        string memory videoHash,
        string memory videoUrl,
        string memory trickType,
        uint256 claimedDifficulty
    ) external whenNotPaused nonReentrant {
        require(bytes(videoHash).length > 0, "Video hash required");
        require(bytes(videoUrl).length > 0, "Video URL required");
        require(bytes(trickType).length > 0, "Trick type required");
        require(claimedDifficulty >= 1 && claimedDifficulty <= 10, "Invalid difficulty");
        
        uint256 videoId = videoCounter++;
        
        videoSubmissions[videoId] = VideoSubmission({
            skater: msg.sender,
            videoHash: videoHash,
            videoUrl: videoUrl,
            trickType: trickType,
            claimedDifficulty: claimedDifficulty,
            timestamp: block.timestamp,
            isValidated: false,
            isExpired: false
        });
        
        skaterSubmissions[msg.sender].push(videoId);
        
        emit VideoSubmitted(
            videoId,
            msg.sender,
            videoHash,
            videoUrl,
            trickType,
            claimedDifficulty
        );
    }
    
    /**
     * @dev Validate a submitted video and mint tokens
     * @param videoId ID of the video submission to validate
     * @param finalDifficulty Final difficulty rating assigned by validator (1-10)
     * @param validationNotes Optional notes from validator
     */
    function validateVideo(
        uint256 videoId,
        uint256 finalDifficulty,
        string memory validationNotes
    ) external onlyRole(VALIDATOR_ROLE) whenNotPaused nonReentrant {
        require(videoId < videoCounter, "Invalid video ID");
        require(finalDifficulty >= 1 && finalDifficulty <= 10, "Invalid difficulty");
        
        VideoSubmission storage submission = videoSubmissions[videoId];
        require(submission.skater != address(0), "Video not found");
        require(submission.skater != msg.sender, "Cannot validate own videos");
        require(!submission.isValidated, "Video already validated");
        require(!submission.isExpired, "Video submission expired");
        require(
            block.timestamp <= submission.timestamp + VIDEO_EXPIRY_TIME,
            "Video submission expired"
        );
        
        ValidatorInfo storage validator = validators[msg.sender];
        require(validator.isActive, "Validator not active");
        
        // Check cooldown
        require(
            block.timestamp >= lastValidationTime[msg.sender] + VALIDATION_COOLDOWN,
            "Validation cooldown active"
        );
        
        // Reset daily minted if it's a new day
        uint256 currentDay = block.timestamp / 1 days;
        if (validator.lastMintDay < currentDay) {
            validator.lastMintDay = currentDay;
            validator.dailyMinted = 0;
        }
        
        // Calculate reward based on final difficulty
        uint256 baseReward = 10 * 10**18; // 10 T42 base
        uint256 reward = baseReward * finalDifficulty / 2;
        
        require(
            validator.dailyMinted + reward <= DAILY_MINT_LIMIT,
            "Daily mint limit exceeded"
        );
        require(
            totalMinted + reward <= MAX_SUPPLY,
            "Max supply exceeded"
        );
        
        // Mark video as validated
        submission.isValidated = true;
        
        // Mint tokens
        _mint(submission.skater, reward);
        totalMinted += reward;
        
        // Calculate and assign validator rewards
        uint256 validatorReward = calculateValidatorReward(msg.sender, reward);
        if (validatorReward > 0) {
            _mint(msg.sender, validatorReward);
            totalMinted += validatorReward;
            validators[msg.sender].totalEarned += validatorReward;
            
            emit ValidatorRewardPaid(msg.sender, validatorReward, "validation_commission");
        }
        
        // Update validator stats
        validator.dailyMinted += reward;
        validator.totalValidations++;
        validator.weeklyValidations++;
        lastValidationTime[msg.sender] = block.timestamp;
        
        // Reset weekly counter if needed
        if (block.timestamp >= validator.lastWeekReset + 7 days) {
            validator.weeklyValidations = 1; // Current validation
            validator.lastWeekReset = block.timestamp;
        }
        
        // Record validation
        uint256 validationId = validationCounter++;
        validations[validationId] = TrickValidation({
            skater: submission.skater,
            validator: msg.sender,
            videoId: videoId,
            amount: reward,
            trickType: submission.trickType,
            timestamp: block.timestamp,
            difficulty: finalDifficulty,
            validationNotes: validationNotes
        });
        
        emit VideoValidated(
            videoId,
            validationId,
            submission.skater,
            msg.sender,
            reward,
            submission.trickType,
            finalDifficulty,
            validationNotes
        );
        // Emit an event to signal that the trick has been validated and reward distributed
        emit TrickValidated(
            validationId,
            submission.skater,
            msg.sender,
            reward,
            submission.trickType,
            finalDifficulty
        );
    }
    
    /**
     * @dev Reject a video submission with reason
     * @param videoId ID of the video submission to reject
     * @param reason Reason for rejection
     */
    function rejectVideo(
        uint256 videoId,
        string memory reason
    ) external onlyRole(VALIDATOR_ROLE) whenNotPaused {
        require(videoId < videoCounter, "Invalid video ID");
        require(bytes(reason).length > 0, "Rejection reason required");
        // Load the video submission from storage
        VideoSubmission storage submission = videoSubmissions[videoId];
        require(submission.skater != address(0), "Video not found");
        require(submission.skater != msg.sender, "Cannot reject own videos");
        require(!submission.isValidated, "Video already validated");
        require(!submission.isExpired, "Video already expired");
        // Mark the video as expired/rejected
        submission.isExpired = true;
        // Emit an event to signal rejection
        emit VideoRejected(videoId, msg.sender, reason);
    }
    
    /**
     * @dev Calculate validator rewards based on commission, reputation and activity
     * @param validator Address of the validator
     * @param baseReward Base reward amount for the validation
     */
    function calculateValidatorReward(address validator, uint256 baseReward) internal view returns (uint256) {
        ValidatorInfo storage validatorInfo = validators[validator];
        // Calculate the base commission for the validator
        uint256 commission = (baseReward * VALIDATOR_BASE_COMMISSION) / 100;
        // Add a bonus if the validator has high reputation
        if (validatorInfo.reputation >= 150) {
            commission += (baseReward * HIGH_REPUTATION_BONUS) / 100;
        }
        // Add an activity bonus if the validator has validated enough tricks this week
        if (validatorInfo.weeklyValidations >= ACTIVITY_BONUS_THRESHOLD) {
            commission += (baseReward * ACTIVITY_BONUS_RATE) / 100;
        }
        // Return the total commission (base + bonuses)
        return commission;
    }

    /**
     * @dev Stake tokens to become a validator
     * @param amount Amount of tokens to stake
     */
    function stakeToValidator(uint256 amount) external whenNotPaused nonReentrant {
        require(amount >= VALIDATOR_STAKING_REQUIREMENT, "Insufficient stake amount");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        // Transfer tokens from the user to the contract for staking
        _transfer(msg.sender, address(this), amount);
        // If the user is not already a validator, add them as a new validator
        if (!validators[msg.sender].isActive) {
            _grantRole(VALIDATOR_ROLE, msg.sender);
            validators[msg.sender] = ValidatorInfo({
                isActive: true,
                totalValidations: 0,
                dailyMinted: 0,
                lastMintDay: 0,
                reputation: 100,
                stakedAmount: amount,
                totalEarned: 0,
                weeklyValidations: 0,
                lastWeekReset: block.timestamp,
                lastRewardClaim: block.timestamp
            });
            activeValidators.push(msg.sender);
            emit ValidatorAdded(msg.sender);
        } else {
            // If already a validator, just increase their staked amount
            validators[msg.sender].stakedAmount += amount;
        }
        // Emit an event to signal staking
        emit ValidatorStaked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens and remove validator status
     * @param amount Amount of tokens to unstake
     */
    function unstakeValidator(uint256 amount) external nonReentrant {
        require(validators[msg.sender].isActive, "Not an active validator");
        require(validators[msg.sender].stakedAmount >= amount, "Insufficient staked amount");
        // Decrease the staked amount
        validators[msg.sender].stakedAmount -= amount;
        // If the staked amount falls below the requirement, remove validator status
        if (validators[msg.sender].stakedAmount < VALIDATOR_STAKING_REQUIREMENT) {
            validators[msg.sender].isActive = false;
            _revokeRole(VALIDATOR_ROLE, msg.sender);
            // Remove the validator from the activeValidators array
            for (uint256 i = 0; i < activeValidators.length; i++) {
                if (activeValidators[i] == msg.sender) {
                    activeValidators[i] = activeValidators[activeValidators.length - 1];
                    activeValidators.pop();
                    break;
                }
            }
            emit ValidatorRemoved(msg.sender);
        }
        // Transfer the unstaked tokens back to the user
        _transfer(address(this), msg.sender, amount);
        emit ValidatorUnstaked(msg.sender, amount);
    }
    
    /**
     * @dev Distribute weekly rewards to active validators
     * Only admin can trigger this
     */
    function distributeWeeklyRewards() external onlyRole(ADMIN_ROLE) {
        require(block.timestamp >= lastWeeklyDistribution + 7 days, "Weekly distribution too early");
        require(activeValidators.length > 0, "No active validators");
        // Count the number of active validators and their total weekly validations
        uint256 totalActiveValidators = 0;
        uint256 totalWeeklyValidations = 0;
        for (uint256 i = 0; i < activeValidators.length; i++) {
            address validator = activeValidators[i];
            if (validators[validator].isActive) {
                totalActiveValidators++;
                totalWeeklyValidations += validators[validator].weeklyValidations;
            }
        }
        // If there are validations, distribute the weekly reward pool proportionally
        if (totalWeeklyValidations > 0) {
            for (uint256 i = 0; i < activeValidators.length; i++) {
                address validator = activeValidators[i];
                if (validators[validator].isActive && validators[validator].weeklyValidations > 0) {
                    // Each validator gets a share based on their activity
                    uint256 validatorShare = (WEEKLY_REWARD_POOL * validators[validator].weeklyValidations) / totalWeeklyValidations;
                    pendingRewards[validator] += validatorShare;
                    // Reset weekly validations for the next week
                    validators[validator].weeklyValidations = 0;
                }
            }
            totalRewardPool += WEEKLY_REWARD_POOL;
            emit WeeklyRewardsDistributed(WEEKLY_REWARD_POOL, totalActiveValidators);
        }
        // Update the last distribution timestamp
        lastWeeklyDistribution = block.timestamp;
    }
    
    /**
     * @dev Claim pending rewards
     */
    function claimRewards() external nonReentrant {
        uint256 reward = pendingRewards[msg.sender];
        require(reward > 0, "No pending rewards");
        // Reset the pending rewards and update stats
        pendingRewards[msg.sender] = 0;
        validators[msg.sender].totalEarned += reward;
        validators[msg.sender].lastRewardClaim = block.timestamp;
        // Mint the reward tokens to the validator
        _mint(msg.sender, reward);
        totalMinted += reward;
        // Emit an event for the reward claim
        emit ValidatorRewardPaid(msg.sender, reward, "weekly_distribution");
    }
    
    /**
     * @dev Get validator reward information
     * @param validator Address of the validator
     */
    function getValidatorRewards(address validator) external view returns (
        uint256 totalEarned,
        uint256 pendingReward,
        uint256 stakedAmount,
        uint256 weeklyValidations
    ) {
        ValidatorInfo storage info = validators[validator];
        // Return the validator's total earned, pending rewards, staked amount, and weekly validations
        return (
            info.totalEarned,
            pendingRewards[validator],
            info.stakedAmount,
            info.weeklyValidations
        );
    }
    
    /**
     * @dev Get video submission details
     * @param videoId ID of the video submission
     */
    function getVideoSubmission(uint256 videoId) external view returns (
        address skater,
        string memory videoHash,
        string memory videoUrl,
        string memory trickType,
        uint256 claimedDifficulty,
        uint256 timestamp,
        bool isValidated,
        bool isExpired
    ) {
        require(videoId < videoCounter, "Invalid video ID");
        // Load the video submission and return its details
        VideoSubmission storage submission = videoSubmissions[videoId];
        return (
            submission.skater,
            submission.videoHash,
            submission.videoUrl,
            submission.trickType,
            submission.claimedDifficulty,
            submission.timestamp,
            submission.isValidated,
            submission.isExpired
        );
    }
    
    /**
     * @dev Get all video submissions by a skater
     * @param skater Address of the skater
     */
    function getSkaterSubmissions(address skater) external view returns (uint256[] memory) {
        // Return all video submission IDs for a given skater
        return skaterSubmissions[skater];
    }
    
    /**
     * @dev Get pending video submissions (not validated and not expired)
     * @param offset Starting index for pagination
     * @param limit Maximum number of results
     */
    function getPendingVideos(uint256 offset, uint256 limit) external view returns (
        uint256[] memory videoIds,
        address[] memory skaters,
        string[] memory trickTypes,
        uint256[] memory difficulties
    ) {
        require(limit > 0 && limit <= 50, "Invalid limit"); // Max 50 results
        // Temporary arrays to collect results
        uint256[] memory tempIds = new uint256[](limit);
        address[] memory tempSkaters = new address[](limit);
        string[] memory tempTricks = new string[](limit);
        uint256[] memory tempDifficulties = new uint256[](limit);
        uint256 count = 0;
        uint256 currentIndex = 0;
        // Iterate through all video submissions and collect pending ones
        for (uint256 i = 0; i < videoCounter && count < limit; i++) {
            VideoSubmission storage submission = videoSubmissions[i];
            if (!submission.isValidated && !submission.isExpired && 
                block.timestamp <= submission.timestamp + VIDEO_EXPIRY_TIME) {
                if (currentIndex >= offset) {
                    tempIds[count] = i;
                    tempSkaters[count] = submission.skater;
                    tempTricks[count] = submission.trickType;
                    tempDifficulties[count] = submission.claimedDifficulty;
                    count++;
                }
                currentIndex++;
            }
        }
        // Resize arrays to the actual number of results
        videoIds = new uint256[](count);
        skaters = new address[](count);
        trickTypes = new string[](count);
        difficulties = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            videoIds[i] = tempIds[i];
            skaters[i] = tempSkaters[i];
            trickTypes[i] = tempTricks[i];
            difficulties[i] = tempDifficulties[i];
        }
    }

    /**
     * @dev Legacy function - kept for backward compatibility
     * @param skater Address of the skater who performed the trick
     * @param trickType Type/name of the trick performed
     * @param difficulty Difficulty rating of the trick (1-10)
     */
    function validateTrick(
        address skater,
        string memory trickType,
        uint256 difficulty
    ) external onlyRole(VALIDATOR_ROLE) whenNotPaused nonReentrant {
        require(skater != address(0), "Invalid skater address");
        require(skater != msg.sender, "Cannot validate own tricks");
        require(difficulty >= 1 && difficulty <= 10, "Invalid difficulty");
        require(validators[msg.sender].isActive, "Validator not active");
        // Enforce a cooldown between validations for the same skater
        require(
            block.timestamp >= lastValidationTime[skater] + VALIDATION_COOLDOWN,
            "Validation cooldown not met"
        );
        // Enforce daily minting limit for the validator
        uint256 currentDay = block.timestamp / 86400;
        ValidatorInfo storage validator = validators[msg.sender];
        if (validator.lastMintDay < currentDay) {
            validator.dailyMinted = 0;
            validator.lastMintDay = currentDay;
        }
        // Calculate the reward based on trick difficulty
        uint256 baseReward = 10 * 10**18; // 10 T42 base
        uint256 reward = baseReward * difficulty / 2;
        require(
            validator.dailyMinted + reward <= DAILY_MINT_LIMIT,
            "Daily mint limit exceeded"
        );
        require(
            totalMinted + reward <= MAX_SUPPLY,
            "Max supply exceeded"
        );
        // Mint tokens to the skater
        _mint(skater, reward);
        totalMinted += reward;
        // Calculate and mint validator commission and bonuses
        uint256 validatorReward = calculateValidatorReward(msg.sender, reward);
        if (validatorReward > 0) {
            _mint(msg.sender, validatorReward);
            totalMinted += validatorReward;
            validators[msg.sender].totalEarned += validatorReward;
            emit ValidatorRewardPaid(msg.sender, validatorReward, "validation_commission");
        }
        // Update validator statistics
        validator.dailyMinted += reward;
        validator.totalValidations++;
        validator.weeklyValidations++;
        // Reset weekly counter if a week has passed
        if (block.timestamp >= validator.lastWeekReset + 7 days) {
            validator.weeklyValidations = 1; // Current validation
            validator.lastWeekReset = block.timestamp;
        }
        // Update the last validation time for the skater
        lastValidationTime[skater] = block.timestamp;
        // Record the validation in the mapping
        validations[validationCounter] = TrickValidation({
            skater: skater,
            validator: msg.sender,
            videoId: 0, // No video for legacy validations
            amount: reward,
            trickType: trickType,
            timestamp: block.timestamp,
            difficulty: difficulty,
            validationNotes: "Legacy validation - no video"
        });
        // Emit an event for the validation
        emit TrickValidated(
            validationCounter,
            skater,
            msg.sender,
            reward,
            trickType,
            difficulty
        );
        // Increment the validation counter
        validationCounter++;
    }
    
    /**
     * @dev Adds a new validator
     * @param validator Address to grant validator role
     */
    function addValidator(address validator) external onlyRole(ADMIN_ROLE) {
        require(validator != address(0), "Invalid address");
        require(!validators[validator].isActive, "Already a validator");
        // Grant the validator role and initialize their info
        grantRole(VALIDATOR_ROLE, validator);
        validators[validator] = ValidatorInfo({
            isActive: true,
            totalValidations: 0,
            dailyMinted: 0,
            lastMintDay: 0,
            reputation: 100,
            stakedAmount: 0,
            totalEarned: 0,
            weeklyValidations: 0,
            lastWeekReset: block.timestamp,
            lastRewardClaim: block.timestamp
        });
        // Add to the list of active validators
        activeValidators.push(validator);
        emit ValidatorAdded(validator);
    }
    
    /**
     * @dev Removes a validator
     * @param validator Address to revoke validator role
     */
    function removeValidator(address validator) external onlyRole(ADMIN_ROLE) {
        require(validators[validator].isActive, "Not a validator");
        // Revoke the validator role and mark as inactive
        revokeRole(VALIDATOR_ROLE, validator);
        validators[validator].isActive = false;
        // Remove from the activeValidators array
        for (uint256 i = 0; i < activeValidators.length; i++) {
            if (activeValidators[i] == validator) {
                activeValidators[i] = activeValidators[activeValidators.length - 1];
                activeValidators.pop();
                break;
            }
        }
        // If validator has staked tokens, they can still unstake them but won't receive new rewards
        emit ValidatorRemoved(validator);
    }
    
    /**
     * @dev Updates validator reputation
     * @param validator Address of the validator
     * @param reputation New reputation score
     */
    function updateValidatorReputation(
        address validator,
        uint256 reputation
    ) external onlyRole(ADMIN_ROLE) {
        require(validators[validator].isActive, "Not an active validator");
        require(reputation <= 1000, "Invalid reputation score");
        // Update the validator's reputation score
        validators[validator].reputation = reputation;
        emit ValidatorReputationUpdated(validator, reputation);
    }
    
    /**
     * @dev Gets validation details
     * @param validationId ID of the validation
     */
    function getValidation(uint256 validationId) 
        external 
        view 
        returns (TrickValidation memory) 
    {
        require(validationId < validationCounter, "Invalid validation ID");
        // Return the TrickValidation struct for the given ID
        return validations[validationId];
    }
    
    /**
     * @dev Gets validator information
     * @param validator Address of the validator
     */
    function getValidatorInfo(address validator) 
        external 
        view 
        returns (ValidatorInfo memory) 
    {
        // Return the ValidatorInfo struct for the given address
        return validators[validator];
    }
    
    /**
     * @dev Pauses all token transfers and validations
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        // Pause all contract operations (transfers, validations, etc.)
        _pause();
    }
    
    /**
     * @dev Unpauses all token transfers and validations
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        // Unpause all contract operations
        _unpause();
    }
    
    /**
     * @dev Get all active validators
     */
    function getActiveValidators() external view returns (address[] memory) {
        // Return the list of currently active validators
        return activeValidators;
    }
    
    /**
     * @dev Get total reward pool statistics
     */
    function getRewardPoolStats() external view returns (
        uint256 totalPool,
        uint256 lastDistribution,
        uint256 nextDistribution
    ) {
        // Return statistics about the total reward pool and distribution schedule
        return (
            totalRewardPool,
            lastWeeklyDistribution,
            lastWeeklyDistribution + 7 days
        );
    }
    
    /**
     * @dev Get validator leaderboard (top validators by activity)
     * @param limit Maximum number of validators to return
     */
    function getValidatorLeaderboard(uint256 limit) external view returns (
        address[] memory validators_list,
        uint256[] memory totalValidations,
        uint256[] memory totalEarnings,
        uint256[] memory reputations
    ) {
        require(limit > 0 && limit <= 50, "Invalid limit");
        // Prepare arrays to return leaderboard data
        uint256 count = activeValidators.length < limit ? activeValidators.length : limit;
        validators_list = new address[](count);
        totalValidations = new uint256[](count);
        totalEarnings = new uint256[](count);
        reputations = new uint256[](count);
        // Populate arrays with validator stats (could be sorted for a true leaderboard)
        for (uint256 i = 0; i < count; i++) {
            address validator = activeValidators[i];
            validators_list[i] = validator;
            totalValidations[i] = validators[validator].totalValidations;
            totalEarnings[i] = validators[validator].totalEarned;
            reputations[i] = validators[validator].reputation;
        }
    }
    
    /**
     * @dev Update token logo URI
     * @param newLogoURI New logo URI
     */
    function updateLogoURI(string memory newLogoURI) external onlyRole(ADMIN_ROLE) {
        logoURI = newLogoURI;
    }
    
    /**
     * @dev Update token website
     * @param newWebsite New website URL
     */
    function updateWebsite(string memory newWebsite) external onlyRole(ADMIN_ROLE) {
        website = newWebsite;
    }
    
    /**
     * @dev Update token description
     * @param newDescription New description
     */
    function updateDescription(string memory newDescription) external onlyRole(ADMIN_ROLE) {
        description = newDescription;
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        // Ensure token transfers are only allowed when not paused
        super._beforeTokenTransfer(from, to, amount);
    }
}