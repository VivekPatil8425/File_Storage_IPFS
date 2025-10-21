const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH\n");

  const IPFSStorage = await hre.ethers.getContractFactory("IPFSStorage");
  console.log("Deploying IPFSStorage contract...");

  const ipfsStorage = await IPFSStorage.deploy();
  await ipfsStorage.deployed();

  console.log("✓ IPFSStorage deployed to:", ipfsStorage.address);
  console.log("✓ Owner:", await ipfsStorage.owner());
  console.log("✓ Initial file count:", (await ipfsStorage.fileCount()).toString());

  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: ipfsStorage.address,
    deployer: deployer.address,
    blockNumber: (await ipfsStorage.deployTransaction.wait()).blockNumber,
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== Deployment Info ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  const fs = require("fs");
  const contractABI = require("../artifacts/contracts/IPFSStorage.sol/IPFSStorage.json").abi;

  const frontendConfig = {
    contractAddress: ipfsStorage.address,
    contractABI: contractABI,
  };

  if (!fs.existsSync("./src")) {
    fs.mkdirSync("./src", { recursive: true });
  }

  fs.writeFileSync(
    "./src/contractConfig.json",
    JSON.stringify(frontendConfig, null, 2)
  );

  console.log("\n✓ Contract config saved to src/contractConfig.json");

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await ipfsStorage.deployTransaction.wait(6);

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: ipfsStorage.address,
        constructorArguments: [],
      });
      console.log("✓ Contract verified on Etherscan");
    } catch (error) {
      console.log("Verification error:", error.message);
    }
  }

  console.log("\n=== Deployment Complete ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
