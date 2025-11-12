require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying to Sepolia...\n");

  // Use direct ethers connection
  const provider = new ethers.providers.JsonRpcProvider("https://rpc.sepolia.org");
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY is not set. Create a .env file with PRIVATE_KEY=your_key and never commit it.");
  }
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying with account:", wallet.address);

  // Check balance
  const balance = await wallet.getBalance();
  console.log("Balance:", ethers.utils.formatEther(balance), "ETH");

  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.log("❌ Insufficient balance for deployment");
    return;
  }

  // Load contract
  const contractJson = JSON.parse(fs.readFileSync("./artifacts/contracts/IPFSStorage.sol/IPFSStorage.json", "utf8"));
  const contractFactory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode, wallet);

  console.log("📦 Deploying contract...");
  
  try {
    const contract = await contractFactory.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.utils.parseUnits("20", "gwei")
    });

    console.log("⏳ Waiting for deployment...");
    await contract.deployed();

    console.log("✅ Contract deployed!");
    console.log("📍 Address:", contract.address);
    console.log("🔗 Transaction:", contract.deployTransaction.hash);

    // Update contract config
    const contractConfig = {
      contractAddress: contract.address,
      contractABI: contractJson.abi
    };

    fs.writeFileSync("./src/contractConfig.json", JSON.stringify(contractConfig, null, 2));
    console.log("✅ Contract config updated!");

    console.log("\n🎉 Deployment Complete!");
    console.log("Contract Address:", contract.address);

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
  }
}

main().catch(console.error);
