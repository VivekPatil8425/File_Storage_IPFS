// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title IPFSStorage
 * @dev Decentralized file storage system using IPFS and Ethereum blockchain
 * @notice Stores file metadata on-chain with gas-optimized bytes32 hashing
 * @author VivekPatil8425
 */
contract IPFSStorage {

    // ============ State Variables ============

    address public owner;
    uint256 public fileCount;

    /**
     * @dev FileMeta struct stores essential file metadata
     */
    struct FileMeta {
        bytes32 cidHash;
        string name;
        uint256 size;
        uint256 timestamp;
        address uploader;
        bool pinned;
    }

    // Mapping from cidHash to file metadata
    mapping(bytes32 => FileMeta) public files;

    // Mapping to check if file exists
    mapping(bytes32 => bool) public exists;

    // Mapping from uploader address to their uploaded file hashes
    mapping(address => bytes32[]) public uploaderFiles;

    // Array of all file hashes (for enumeration)
    bytes32[] public allFileHashes;

    // ============ Events ============

    event FileStored(
        bytes32 indexed cidHash,
        string cid,
        address indexed uploader,
        uint256 gasUsed
    );

    event FileRetrieved(
        bytes32 indexed cidHash,
        address indexed requester
    );

    event PinFlagUpdated(
        bytes32 indexed cidHash,
        bool pinned
    );

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyUploaderOrOwner(bytes32 _cidHash) {
        require(
            msg.sender == files[_cidHash].uploader || msg.sender == owner,
            "Only uploader or owner can modify this file"
        );
        _;
    }

    modifier fileExists(bytes32 _cidHash) {
        require(exists[_cidHash], "File does not exist");
        _;
    }

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
        fileCount = 0;
    }

    // ============ Core Functions ============

    function storeFile(
        string calldata _cid,
        string calldata _name,
        uint256 _size
    ) external {
        uint256 gasStart = gasleft();

        bytes32 cidHash = keccak256(bytes(_cid));
        require(!exists[cidHash], "File already stored");

        files[cidHash] = FileMeta({
            cidHash: cidHash,
            name: _name,
            size: _size,
            timestamp: block.timestamp,
            uploader: msg.sender,
            pinned: false
        });

        exists[cidHash] = true;
        uploaderFiles[msg.sender].push(cidHash);
        allFileHashes.push(cidHash);
        fileCount++;

        uint256 gasUsed = gasStart - gasleft();
        emit FileStored(cidHash, _cid, msg.sender, gasUsed);
    }

    function getFileMeta(string calldata _cid)
        external
        returns (FileMeta memory)
    {
        bytes32 cidHash = keccak256(bytes(_cid));
        require(exists[cidHash], "File does not exist");

        emit FileRetrieved(cidHash, msg.sender);
        return files[cidHash];
    }

    function getFileMetaByHash(bytes32 _cidHash)
        external
        view
        fileExists(_cidHash)
        returns (FileMeta memory)
    {
        return files[_cidHash];
    }

    function fileExistsByCID(string calldata _cid)
        external
        view
        returns (bool)
    {
        return exists[keccak256(bytes(_cid))];
    }

    function getUploaderFiles(address _uploader)
        external
        view
        returns (bytes32[] memory)
    {
        return uploaderFiles[_uploader];
    }

    function getTotalFiles() external view returns (uint256) {
        return fileCount;
    }

    // ============ Pin Management Functions ============

    function pinCID(bytes32 _cidHash)
        external
        onlyUploaderOrOwner(_cidHash)
        fileExists(_cidHash)
    {
        files[_cidHash].pinned = true;
        emit PinFlagUpdated(_cidHash, true);
    }

    function unpinCID(bytes32 _cidHash)
        external
        onlyUploaderOrOwner(_cidHash)
        fileExists(_cidHash)
    {
        files[_cidHash].pinned = false;
        emit PinFlagUpdated(_cidHash, false);
    }

    function isPinned(bytes32 _cidHash)
        external
        view
        fileExists(_cidHash)
        returns (bool)
    {
        return files[_cidHash].pinned;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }

    function getAllFileHashes() external view returns (bytes32[] memory) {
        return allFileHashes;
    }
}
