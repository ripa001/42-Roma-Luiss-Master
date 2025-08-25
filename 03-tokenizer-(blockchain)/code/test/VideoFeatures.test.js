const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Trick42Token - Video Features", function () {
  let trick42Token;
  let owner;
  let validator1;
  let skater1;
  let skater2;
  
  beforeEach(async function () {
    [owner, validator1, skater1, skater2] = await ethers.getSigners();
    
    const Trick42Token = await ethers.getContractFactory("Trick42Token");
    trick42Token = await Trick42Token.deploy();
    await trick42Token.waitForDeployment();
    
    // Add validator
    await trick42Token.addValidator(validator1.address);
  });

  describe("Video Submission", function () {
    it("Should submit a video successfully", async function () {
      const videoHash = "QmTestHash123";
      const videoUrl = "https://youtube.com/watch?v=test123";
      const trickType = "kickflip";
      const claimedDifficulty = 8;

      await expect(
        trick42Token.connect(skater1).submitVideo(
          videoHash,
          videoUrl,
          trickType,
          claimedDifficulty
        )
      ).to.emit(trick42Token, "VideoSubmitted")
       .withArgs(0, skater1.address, videoHash, videoUrl, trickType, claimedDifficulty);

      // Check video details
      const video = await trick42Token.getVideoSubmission(0);
      expect(video.skater).to.equal(skater1.address);
      expect(video.videoHash).to.equal(videoHash);
      expect(video.videoUrl).to.equal(videoUrl);
      expect(video.trickType).to.equal(trickType);
      expect(video.claimedDifficulty).to.equal(claimedDifficulty);
      expect(video.isValidated).to.be.false;
      expect(video.isExpired).to.be.false;
    });

    it("Should not submit video with empty hash", async function () {
      await expect(
        trick42Token.connect(skater1).submitVideo("", "url", "trick", 5)
      ).to.be.revertedWith("Video hash required");
    });

    it("Should not submit video with invalid difficulty", async function () {
      await expect(
        trick42Token.connect(skater1).submitVideo("hash", "url", "trick", 11)
      ).to.be.revertedWith("Invalid difficulty");
    });

    it("Should track skater submissions", async function () {
      await trick42Token.connect(skater1).submitVideo("hash1", "url1", "trick1", 5);
      await trick42Token.connect(skater1).submitVideo("hash2", "url2", "trick2", 7);
      
      const submissions = await trick42Token.getSkaterSubmissions(skater1.address);
      expect(submissions.length).to.equal(2);
      expect(submissions[0]).to.equal(0);
      expect(submissions[1]).to.equal(1);
    });
  });

  describe("Video Validation", function () {
    beforeEach(async function () {
      // Submit a video first
      await trick42Token.connect(skater1).submitVideo(
        "QmTestHash123",
        "https://youtube.com/watch?v=test123",
        "kickflip",
        8
      );
    });

    it("Should validate video and mint tokens", async function () {
      const finalDifficulty = 7;
      const validationNotes = "Good execution, clean landing";
      const expectedReward = ethers.parseEther("35"); // 10 * 7 / 2 = 35

      await expect(
        trick42Token.connect(validator1).validateVideo(0, finalDifficulty, validationNotes)
      ).to.emit(trick42Token, "VideoValidated")
       .withArgs(0, 0, skater1.address, validator1.address, expectedReward, "kickflip", finalDifficulty, validationNotes);

      // Check token balance
      expect(await trick42Token.balanceOf(skater1.address)).to.equal(expectedReward);

      // Check video is marked as validated
      const video = await trick42Token.getVideoSubmission(0);
      expect(video.isValidated).to.be.true;
    });

    it("Should not allow validator to validate own video", async function () {
      // Validator submits video
      await trick42Token.connect(validator1).submitVideo("hash", "url", "trick", 5);
      
      await expect(
        trick42Token.connect(validator1).validateVideo(1, 5, "notes")
      ).to.be.revertedWith("Cannot validate own videos");
    });

    it("Should not validate already validated video", async function () {
      await trick42Token.connect(validator1).validateVideo(0, 7, "notes");
      
      await expect(
        trick42Token.connect(validator1).validateVideo(0, 8, "different notes")
      ).to.be.revertedWith("Video already validated");
    });

    it("Should enforce cooldown between validations", async function () {
      // Submit second video
      await trick42Token.connect(skater2).submitVideo("hash2", "url2", "trick2", 6);
      
      // Validate first video
      await trick42Token.connect(validator1).validateVideo(0, 7, "notes");
      
      // Try to validate second video immediately
      await expect(
        trick42Token.connect(validator1).validateVideo(1, 6, "notes")
      ).to.be.revertedWith("Validation cooldown active");
      
      // Fast forward time
      await time.increase(301); // 5 minutes + 1 second
      
      // Should work now
      await expect(
        trick42Token.connect(validator1).validateVideo(1, 6, "notes")
      ).to.not.be.reverted;
    });

    it("Should reject video with reason", async function () {
      const reason = "Trick not completed properly";
      
      await expect(
        trick42Token.connect(validator1).rejectVideo(0, reason)
      ).to.emit(trick42Token, "VideoRejected")
       .withArgs(0, validator1.address, reason);

      // Check video is marked as expired/rejected
      const video = await trick42Token.getVideoSubmission(0);
      expect(video.isExpired).to.be.true;
      expect(video.isValidated).to.be.false;
    });

    it("Should not validate rejected video", async function () {
      await trick42Token.connect(validator1).rejectVideo(0, "reason");
      
      await expect(
        trick42Token.connect(validator1).validateVideo(0, 7, "notes")
      ).to.be.revertedWith("Video submission expired");
    });
  });

  describe("Pending Videos", function () {
    beforeEach(async function () {
      // Submit multiple videos
      await trick42Token.connect(skater1).submitVideo("hash1", "url1", "kickflip", 8);
      await trick42Token.connect(skater2).submitVideo("hash2", "url2", "heelflip", 7);
      await trick42Token.connect(skater1).submitVideo("hash3", "url3", "tre-flip", 9);
      
      // Validate one video
      await trick42Token.connect(validator1).validateVideo(0, 8, "validated");
    });

    it("Should return pending videos correctly", async function () {
      const pendingVideos = await trick42Token.getPendingVideos(0, 10);
      
      expect(pendingVideos.videoIds.length).to.equal(2); // 2 pending (one was validated)
      expect(pendingVideos.skaters[0]).to.equal(skater2.address);
      expect(pendingVideos.trickTypes[0]).to.equal("heelflip");
      expect(pendingVideos.difficulties[0]).to.equal(7);
    });

    it("Should handle pagination correctly", async function () {
      const firstPage = await trick42Token.getPendingVideos(0, 1);
      expect(firstPage.videoIds.length).to.equal(1);
      
      const secondPage = await trick42Token.getPendingVideos(1, 1);
      expect(secondPage.videoIds.length).to.equal(1);
      
      // Video IDs should be different
      expect(firstPage.videoIds[0]).to.not.equal(secondPage.videoIds[0]);
    });

    it("Should not exceed limit", async function () {
      await expect(
        trick42Token.getPendingVideos(0, 51)
      ).to.be.revertedWith("Invalid limit");
    });
  });

  describe("Video Expiry", function () {
    it("Should not validate expired video", async function () {
      await trick42Token.connect(skater1).submitVideo("hash", "url", "trick", 5);
      
      // Fast forward past expiry time (7 days)
      await time.increase(7 * 24 * 60 * 60 + 1); // 7 days + 1 second
      
      await expect(
        trick42Token.connect(validator1).validateVideo(0, 5, "notes")
      ).to.be.revertedWith("Video submission expired");
    });
  });

  describe("Integration with Legacy System", function () {
    it("Should still support legacy validateTrick function", async function () {
      const expectedReward = ethers.parseEther("25"); // 10 * 5 / 2 = 25
      
      await expect(
        trick42Token.connect(validator1).validateTrick(skater1.address, "ollie", 5)
      ).to.emit(trick42Token, "TrickValidated")
       .withArgs(0, skater1.address, validator1.address, expectedReward, "ollie", 5);

      expect(await trick42Token.balanceOf(skater1.address)).to.equal(expectedReward);
      
      // Check validation record
      const validation = await trick42Token.validations(0);
      expect(validation.skater).to.equal(skater1.address);
      expect(validation.validator).to.equal(validator1.address);
      expect(validation.trickType).to.equal("ollie");
      expect(validation.difficulty).to.equal(5);
      expect(validation.videoId).to.equal(0); // No video for legacy
      expect(validation.validationNotes).to.equal("Legacy validation - no video");
    });
  });
});
