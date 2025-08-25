const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleMultiSigWallet", function () {
  let MultiSig, wallet, owner1, owner2, owner3, notOwner;

  beforeEach(async function () {
    [owner1, owner2, owner3, notOwner] = await ethers.getSigners();
    MultiSig = await ethers.getContractFactory("SimpleMultiSigWallet");
    wallet = await MultiSig.deploy(
      [owner1.address, owner2.address, owner3.address],
      2 // confirmations required
    );
  });

  it("should deploy with correct owners and required confirmations", async function () {
    expect(await wallet.getOwners()).to.include.members([
      owner1.address,
      owner2.address,
      owner3.address,
    ]);
    expect(await wallet.required()).to.equal(2);
  });

  it("should allow an owner to submit and another to confirm and execute a transaction", async function () {
    // Send some ETH to the wallet
    await owner1.sendTransaction({
      to: wallet.target,
      value: ethers.parseEther("1.0"),
    });
    // Prepare a transaction: send 0.1 ETH to notOwner
    const tx = await wallet.connect(owner1).submitTransaction(
      notOwner.address,
      ethers.parseEther("0.1"),
      "0x"
    );
    await tx.wait();
    // Transaction index is 0
    // Confirm with owner2
    await expect(wallet.connect(owner2).confirmTransaction(0))
      .to.emit(wallet, "ConfirmTransaction");
    // After 2 confirmations, transaction should be executed
    const txn = await wallet.getTransaction(0);
    expect(txn.executed).to.be.true;
    // Check recipient balance increased
    const balance = await ethers.provider.getBalance(notOwner.address);
    expect(balance).to.be.above(ethers.parseEther("10000.0")); // default Hardhat balance is 10000 ETH
  });

  it("should not allow non-owners to submit or confirm", async function () {
    await expect(
      wallet.connect(notOwner).submitTransaction(owner1.address, 0, "0x")
    ).to.be.revertedWith("Not owner");
    await wallet.connect(owner1).submitTransaction(owner2.address, 0, "0x");
    await expect(
      wallet.connect(notOwner).confirmTransaction(0)
    ).to.be.revertedWith("Not owner");
  });

  it("should not execute with insufficient confirmations", async function () {
    await wallet.connect(owner1).submitTransaction(owner2.address, 0, "0x");
    // Only one confirmation, should not be executed
    const txn = await wallet.getTransaction(0);
    expect(txn.executed).to.be.false;
  });
});
