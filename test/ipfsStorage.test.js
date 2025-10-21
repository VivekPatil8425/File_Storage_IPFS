const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IPFSStorage Contract", function () {
  let IPFSStorage;
  let ipfsStorage;
  let owner;
  let user1;
  let user2;

  const testCIDs = [
    "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    "QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A",
    "QmZULkCELmmk5XNfCgTnCyFgAVxBRBXyDHGGMVoLFLiXEN",
    "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o",
    "QmXnnyufdzAWL5CqZ2RnSNgPbvCc1ALT73s6epPrRnZ1Xy",
  ];

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    IPFSStorage = await ethers.getContractFactory("IPFSStorage");
    ipfsStorage = await IPFSStorage.deploy();
    await ipfsStorage.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await ipfsStorage.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero file count", async function () {
      expect(await ipfsStorage.fileCount()).to.equal(0);
    });
  });

  describe("File Storage", function () {
    it("Should store file metadata correctly", async function () {
      const cid = testCIDs[0];
      const fileName = "test-file.pdf";
      const fileSize = 1024000;

      const tx = await ipfsStorage.connect(user1).storeFile(cid, fileName, fileSize);
      const receipt = await tx.wait();

      expect(await ipfsStorage.fileCount()).to.equal(1);
      expect(await ipfsStorage.fileExistsByCID(cid)).to.be.true;

      const meta = await ipfsStorage.getFileMeta(cid);
      expect(meta.name).to.equal(fileName);
      expect(meta.size).to.equal(fileSize);
      expect(meta.uploader).to.equal(user1.address);
      expect(meta.pinned).to.be.false;

      const event = receipt.events.find((e) => e.event === "FileStored");
      expect(event).to.not.be.undefined;
      expect(event.args.cid).to.equal(cid);
      expect(event.args.uploader).to.equal(user1.address);
      console.log(`  ✓ Gas used for file storage: ${event.args.gasUsed.toString()}`);
    });

    it("Should prevent duplicate file storage", async function () {
      const cid = testCIDs[0];

      await ipfsStorage.connect(user1).storeFile(cid, "file1.pdf", 1000);

      await expect(
        ipfsStorage.connect(user2).storeFile(cid, "file2.pdf", 2000)
      ).to.be.revertedWith("File already stored");
    });

    it("Should store multiple files and track gas usage", async function () {
      const gasUsedArray = [];

      console.log("\n  === Uploading 5 Test Files ===");

      for (let i = 0; i < 5; i++) {
        const cid = testCIDs[i];
        const fileName = `test-file-${i + 1}.pdf`;
        const fileSize = 500000 + i * 100000;

        const tx = await ipfsStorage.connect(user1).storeFile(cid, fileName, fileSize);
        const receipt = await tx.wait();

        const event = receipt.events.find((e) => e.event === "FileStored");
        const gasUsed = parseInt(event.args.gasUsed.toString());
        gasUsedArray.push(gasUsed);

        console.log(`  File ${i + 1}: ${fileName} - Gas: ${gasUsed}`);
      }

      const avgGas = gasUsedArray.reduce((a, b) => a + b, 0) / gasUsedArray.length;
      console.log(`  \n  Average Gas Used: ${Math.round(avgGas)}`);

      expect(await ipfsStorage.fileCount()).to.equal(5);

      for (const cid of testCIDs) {
        expect(await ipfsStorage.fileExistsByCID(cid)).to.be.true;
      }
    });
  });

  describe("File Retrieval", function () {
    beforeEach(async function () {
      await ipfsStorage.connect(user1).storeFile(testCIDs[0], "test.pdf", 1000);
    });

    it("Should retrieve file metadata correctly", async function () {
      const meta = await ipfsStorage.connect(user2).getFileMeta(testCIDs[0]);

      expect(meta.name).to.equal("test.pdf");
      expect(meta.size).to.equal(1000);
      expect(meta.uploader).to.equal(user1.address);
    });

    it("Should emit FileRetrieved event", async function () {
      await expect(ipfsStorage.connect(user2).getFileMeta(testCIDs[0]))
        .to.emit(ipfsStorage, "FileRetrieved")
        .withArgs(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(testCIDs[0])), user2.address);
    });

    it("Should revert for non-existent file", async function () {
      await expect(
        ipfsStorage.getFileMeta("QmInvalidCIDThatDoesNotExist123456789")
      ).to.be.revertedWith("File does not exist");
    });
  });

  describe("Pin Management", function () {
    beforeEach(async function () {
      await ipfsStorage.connect(user1).storeFile(testCIDs[0], "test.pdf", 1000);
    });

    it("Should allow uploader to pin file", async function () {
      const cidHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(testCIDs[0]));

      await expect(ipfsStorage.connect(user1).pinCID(cidHash))
        .to.emit(ipfsStorage, "PinFlagUpdated")
        .withArgs(cidHash, true);

      expect(await ipfsStorage.isPinned(cidHash)).to.be.true;
    });

    it("Should allow uploader to unpin file", async function () {
      const cidHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(testCIDs[0]));

      await ipfsStorage.connect(user1).pinCID(cidHash);
      await ipfsStorage.connect(user1).unpinCID(cidHash);

      expect(await ipfsStorage.isPinned(cidHash)).to.be.false;
    });

    it("Should prevent non-uploader from pinning", async function () {
      const cidHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(testCIDs[0]));

      await expect(
        ipfsStorage.connect(user2).pinCID(cidHash)
      ).to.be.revertedWith("Only uploader or owner can modify this file");
    });

    it("Should allow owner to pin any file", async function () {
      const cidHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(testCIDs[0]));

      await ipfsStorage.connect(owner).pinCID(cidHash);
      expect(await ipfsStorage.isPinned(cidHash)).to.be.true;
    });
  });

  describe("Uploader File Tracking", function () {
    it("Should track files by uploader", async function () {
      for (let i = 0; i < 3; i++) {
        await ipfsStorage.connect(user1).storeFile(testCIDs[i], `file${i}.pdf`, 1000 * (i + 1));
      }

      const user1Files = await ipfsStorage.getUploaderFiles(user1.address);
      expect(user1Files.length).to.equal(3);

      for (let i = 3; i < 5; i++) {
        await ipfsStorage.connect(user2).storeFile(testCIDs[i], `file${i}.pdf`, 1000 * (i + 1));
      }

      const user2Files = await ipfsStorage.getUploaderFiles(user2.address);
      expect(user2Files.length).to.equal(2);
    });
  });

  describe("Gas Comparison: Original vs Improved", function () {
    it("Should compare gas costs", async function () {
      console.log("\n  === Gas Comparison ===");

      console.log("  Original Approach (Full CID String):");
      console.log("    Estimated Gas: ~65,000");
      console.log("    Storage: 46+ bytes on-chain");

      const tx = await ipfsStorage.connect(user1).storeFile(testCIDs[0], "test.pdf", 1024000);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.toNumber();

      console.log("\n  Improved Approach (bytes32 Hash):");
      console.log(`    Actual Gas: ${gasUsed}`);
      console.log("    Storage: 32 bytes + metadata");

      const savings = ((65000 - gasUsed) / 65000 * 100).toFixed(2);
      console.log(`\n  Gas Savings: ~${savings}%`);

      expect(gasUsed).to.be.lessThan(65000);
    });
  });
});
