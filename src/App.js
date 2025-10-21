import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { pinata } from "./config";
import "./ModernApp.css";

let contractConfig;
try {
  contractConfig = require("./contractConfig.json");
} catch (e) {
  console.warn("Contract not yet deployed. Deploy first with: npx hardhat run scripts/deploy.js --network localhost");
}

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Check if we're on Sepolia network (Chain ID: 11155111)
        const network = await provider.getNetwork();
        if (network.chainId !== 11155111) {
          // Request to switch to Sepolia
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
            });
          } catch (switchError) {
            showNotification("Please switch to Sepolia testnet in MetaMask", "error");
            return;
          }
        }
        
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        if (contractConfig) {
          const contractInstance = new ethers.Contract(
            contractConfig.contractAddress,
            contractConfig.contractABI,
            signer
          );
          setContract(contractInstance);
        }
      }
    } catch (error) {
      showNotification("Failed to connect wallet", "error");
      console.error(error);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showNotification("Please select a file first", "error");
      return;
    }

    setUploading(true);
    setUploadProgress(20);

    try {
      // Upload to IPFS
      const response = await pinata.upload.file(selectedFile);
      const cid = response.IpfsHash;
      setIpfsHash(cid);
      setUploadProgress(60);

      if (contract) {
        // Store metadata on blockchain
        const tx = await contract.storeFile(cid, selectedFile.name, selectedFile.size);
        setUploadProgress(80);

        const receipt = await tx.wait();
        setUploadProgress(100);

        // Get gas used from event
        const event = receipt.events.find(e => e.event === "FileStored");
        const gasUsed = event?.args?.gasUsed?.toString() || "N/A";

        // Add to file list
        const newFile = {
          cid,
          name: selectedFile.name,
          size: selectedFile.size,
          gasUsed,
          uploader: account,
          timestamp: new Date().toISOString(),
        };
        setFileList([...fileList, newFile]);

        showNotification(`File uploaded successfully! Gas used: ${gasUsed}`, "success");
      } else {
        setUploadProgress(100);
        showNotification("File uploaded to IPFS", "success");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      showNotification("Upload failed: " + error.message, "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRetrieve = async (cid) => {
    try {
      if (contract) {
        // Contract-verified retrieval
        const metadata = await contract.getFileMeta(cid);
        console.log("File verified on blockchain:", metadata);
        showNotification("File verified on blockchain", "success");
      }

      // Fetch from IPFS gateway
      const gateway = "https://ipfs.io/ipfs/";
      window.open(gateway + cid, "_blank");
    } catch (error) {
      showNotification("File not found or access denied", "error");
      console.error(error);
    }
  };

  const copyCID = (cid) => {
    navigator.clipboard.writeText(cid);
    showNotification("CID copied to clipboard", "success");
  };


  const handleDisconnect = () => {
    setAccount("");
    setContract(null);
    setFileList([]);
    showNotification("Wallet disconnected", "info");
  };

  const clearFile = () => {
    setSelectedFile(null);
    setIpfsHash("");
  };

  return (
    <div className="modern-app">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type} animate-slide-up`} 
             style={{
               position: 'fixed',
               top: '20px',
               right: '20px',
               zIndex: 1000,
               padding: '1rem',
               borderRadius: '8px',
               background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 
                          notification.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
               border: `1px solid ${notification.type === 'success' ? 'var(--neon-green)' : 
                                  notification.type === 'error' ? '#ef4444' : 'var(--neon-blue)'}`,
               color: 'white',
               maxWidth: '400px'
             }}>
          {notification.message}
          <button 
            onClick={() => setNotification({ show: false, message: "", type: "" })}
            style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <header className="modern-header animate-fade-in">
        <div className="header-content">
          <div className="header-main">
            <div className="logo-container">
              <span style={{ fontSize: '2rem' }}>🗄️</span>
            </div>
            <div className="title-section">
              <h1 className="gradient-text">Decentralized File Storage</h1>
              <p>IPFS + Ethereum Blockchain Storage</p>
            </div>
          </div>
          
          <div className="feature-badges">
            <div className="feature-badge secure">
              <span>🛡️</span>
              <span>Secure</span>
            </div>
            <div className="feature-badge decentralized">
              <span>🌐</span>
              <span>Decentralized</span>
            </div>
            <div className="feature-badge fast">
              <span>⚡</span>
              <span>Fast</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Status Cards */}
        <div className="status-grid">
          {/* Network Status */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 className="gradient-text" style={{ marginBottom: '1rem', fontSize: '1rem' }}>Network Status</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📡</span>
                <span style={{ fontSize: '0.875rem' }}>IPFS</span>
                <div className="verification-dot" style={{ background: 'var(--neon-green)' }}></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔗</span>
                <span style={{ fontSize: '0.875rem' }}>Ethereum</span>
                <div className="verification-dot" style={{ background: contract ? 'var(--neon-green)' : '#ef4444' }}></div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Sepolia Testnet
              </div>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            {account ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="logo-container" style={{ width: '48px', height: '48px' }}>
                      <span>👛</span>
                    </div>
                    <div>
                      <div className="gradient-text" style={{ fontSize: '0.875rem', fontWeight: '600' }}>Connected Wallet</div>
                      <code style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        {account.substring(0, 6)}...{account.substring(38)}
                      </code>
                    </div>
                  </div>
                  <button 
                    onClick={handleDisconnect}
                    style={{ 
                      background: 'none', 
                      border: '1px solid #ef4444', 
                      color: '#ef4444', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}>
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                <span>👛</span>
                <span style={{ marginLeft: '0.5rem' }}>Wallet not connected</span>
              </div>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div className="glass-card upload-section animate-fade-in">
          <div className="section-header">
            <h2 className="gradient-text">📤 Upload to Decentralized Storage</h2>
            <p>Upload files to IPFS and store metadata on Ethereum blockchain with gas optimization</p>
          </div>

          {!selectedFile ? (
            <div 
              className={`drag-drop-zone ${uploading ? 'disabled' : ''}`}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input 
                id="file-input"
                type="file" 
                onChange={changeHandler}
                style={{ display: 'none' }}
                disabled={uploading}
              />
              <div className="upload-icon">📁</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Drag & drop your file here
              </h3>
              <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
                or <span style={{ color: 'var(--neon-purple)', fontWeight: '600' }}>browse files</span>
              </p>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Supports all file types • Max size: 100MB
              </div>
            </div>
          ) : (
            <div className="file-info animate-fade-in">
              <div className="file-details">
                <div className="file-icon">📄</div>
                <div className="file-meta">
                  <h4>{selectedFile.name}</h4>
                  <p>{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{selectedFile.type || 'Unknown type'}</p>
                </div>
                {!uploading && (
                  <button 
                    onClick={clearFile}
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.2)', 
                      border: '1px solid #ef4444', 
                      color: '#ef4444', 
                      padding: '0.5rem', 
                      borderRadius: '6px', 
                      cursor: 'pointer' 
                    }}>
                    ✕
                  </button>
                )}
              </div>

              {uploading && (
                <div className="progress-container">
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <div className="progress-text">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    {uploadProgress < 30 && '📤 Uploading to IPFS...'}
                    {uploadProgress >= 30 && uploadProgress < 70 && '🔗 Storing on blockchain...'}
                    {uploadProgress >= 70 && uploadProgress < 100 && '⏳ Confirming transaction...'}
                    {uploadProgress === 100 && <span style={{ color: 'var(--neon-green)' }}>✅ Upload complete!</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedFile && !uploading && (
            <button 
              onClick={handleUpload}
              className="cyber-button"
              style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.125rem' }}
              disabled={!selectedFile || uploading}
            >
              🚀 Upload to IPFS + Blockchain
            </button>
          )}

          {/* Upload Success */}
          {ipfsHash && (
            <div className="success-message animate-fade-in">
              <div className="success-header">
                <span style={{ fontSize: '1.5rem' }}>✅</span>
                <h3>Upload Successful!</h3>
              </div>
              
              <div>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>IPFS Hash:</p>
                <div className="cid-display">{ipfsHash}</div>
                
                <a
                  href={`https://ipfs.io/ipfs/${ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ipfs-link"
                >
                  View on IPFS Gateway →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Files Dashboard */}
        {fileList.length > 0 && (
          <div className="glass-card upload-section animate-fade-in">
            <div className="section-header">
              <h2 className="gradient-text">📊 Your Files Dashboard</h2>
              <p>Manage your uploaded files stored on IPFS and verified on blockchain</p>
            </div>

            <div className="files-grid">
              {fileList.map((file, index) => (
                <div key={index} className="file-card glass-card">
                  <div className="file-card-header">
                    <div className="file-card-info">
                      <div className="file-card-icon">📄</div>
                      <div className="file-card-meta">
                        <h3>{file.name}</h3>
                        <p>{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <div className="gas-badge">
                      ⚡ {file.gasUsed} gas
                    </div>
                  </div>

                  <div className="file-details">
                    <div className="detail-row">
                      <span className="detail-label">CID:</span>
                      <div className="detail-value">{file.cid}</div>
                      <button 
                        onClick={() => copyCID(file.cid)}
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.25rem' }}>
                        📋
                      </button>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Uploaded:</span>
                      <span>{new Date(file.timestamp * 1000).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">By:</span>
                      <div className="detail-value">
                        {file.uploader?.substring(0, 6)}...{file.uploader?.substring(38)}
                      </div>
                    </div>
                  </div>

                  <div className="file-actions">
                    <button 
                      onClick={() => handleRetrieve(file.cid)}
                      className="action-btn primary"
                    >
                      👁️ View
                    </button>
                    <button 
                      onClick={() => window.open(`https://ipfs.io/ipfs/${file.cid}`, '_blank')}
                      className="action-btn"
                    >
                      🔗
                    </button>
                  </div>

                  <div className="verification-badge">
                    <div className="verification-dot"></div>
                    <span>Verified on Blockchain</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="footer-content">
          <p>Built with ❤️ for decentralized storage research</p>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="github-link">
            <span>🐙</span>
            <span>View on GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
