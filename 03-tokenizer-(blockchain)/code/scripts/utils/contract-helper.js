const fs = require('fs');
const path = require('path');

/**
 * Utility function to get the correct contract address
 * @returns {Object} { contractAddress, source }
 */
function getContractAddress() {
  try {
    const deploymentInfoPath = path.join(process.cwd(), 'deployment-info.json');
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
    const contractAddress = deploymentInfo.contractAddress || deploymentInfo.token;
    return {
      contractAddress,
      source: 'deployment-info.json'
    };
  } catch (error) {
    // Fallback addresses for different networks
    const fallbackAddresses = {
      hardhat: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      localhost: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      bnbTestnet: "0x8b0c3e39e1fF40001D94B0f2094b64aDF4406d58"
    };
    
    const networkName = process.env.HARDHAT_NETWORK || 'hardhat';
    const contractAddress = fallbackAddresses[networkName] || fallbackAddresses.hardhat;
    
    return {
      contractAddress,
      source: `fallback for ${networkName}`
    };
  }
}

/**
 * Verify contract exists at the address
 * @param {Object} hre - Hardhat Runtime Environment
 * @param {string} contractAddress - Contract address to verify
 */
async function verifyContract(hre, contractAddress) {
  console.log("🔍 Verifying contract deployment...");
  console.log("Contract address:", contractAddress);
  console.log("Network:", hre.network.name);
  
  const code = await hre.ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error(`No contract found at address ${contractAddress}. Make sure it's deployed to ${hre.network.name} network.`);
  }
  console.log("✅ Contract found!");
}

/**
 * Get contract instance with verification
 * @param {Object} hre - Hardhat Runtime Environment
 * @returns {Object} Contract instance
 */
async function getContractInstance(hre) {
  const { contractAddress, source } = getContractAddress();
  console.log(`📄 Using contract address from ${source}:`, contractAddress);
  
  await verifyContract(hre, contractAddress);
  
  const Trick42Token = await hre.ethers.getContractFactory("Trick42Token");
  const token = await Trick42Token.attach(contractAddress);
  
  return { token, contractAddress };
}

module.exports = {
  getContractAddress,
  verifyContract,
  getContractInstance
};
