const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Account address:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "BNB");
  
  if (balance < hre.ethers.parseEther("0.05")) {
    console.log("⚠️  Warning: Balance is low. You need at least 0.05 BNB for deployment.");
    console.log("Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart");
  } else {
    console.log("✅ Sufficient balance for deployment");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
