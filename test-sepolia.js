const hre = require("hardhat");

async function main() {
  console.log("Testing Sepolia connection...\n");
  
  const [signer] = await hre.ethers.getSigners();
  console.log("✓ Connected to network:", hre.network.name);
  console.log("✓ Account address:", signer.address);
  
  const balance = await signer.getBalance();
  console.log("✓ Account balance:", hre.ethers.utils.formatEther(balance), "ETH");
  
  // Test network connection
  const provider = hre.ethers.provider;
  const network = await provider.getNetwork();
  console.log("✓ Chain ID:", network.chainId);
  console.log("✓ Network name:", network.name);
  
  const blockNumber = await provider.getBlockNumber();
  console.log("✓ Latest block:", blockNumber);
  
  console.log("\n🎉 Sepolia configuration is working correctly!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
