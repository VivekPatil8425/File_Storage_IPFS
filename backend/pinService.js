const axios = require('axios');
require('dotenv').config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET = process.env.PINATA_API_SECRET;
const PINATA_JWT = process.env.PINATA_JWT;

async function pinCID(cid) {
  try {
    console.log(`Attempting to pin CID: ${cid}...`);

    // Using Pinata Pin by CID endpoint
    const url = `https://api.pinata.cloud/pinning/pinByHash`;

    const headers = PINATA_JWT 
      ? { 'Authorization': `Bearer ${PINATA_JWT}` }
      : {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET
        };

    const response = await axios.post(
      url,
      {
        hashToPin: cid,
        pinataMetadata: {
          name: `Pinned-${cid.substring(0, 10)}`,
        },
      },
      { headers }
    );

    console.log('✓ Successfully pinned CID');
    console.log(`  IPFS Hash: ${response.data.IpfsHash}`);
    console.log(`  Pin Size: ${response.data.PinSize}`);
    console.log(`  Timestamp: ${response.data.Timestamp}`);

    return response.data;
  } catch (error) {
    console.error('✗ Failed to pin CID');
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

async function unpinCID(cid) {
  try {
    console.log(`Attempting to unpin CID: ${cid}...`);

    const url = `https://api.pinata.cloud/pinning/unpin/${cid}`;

    const headers = PINATA_JWT 
      ? { 'Authorization': `Bearer ${PINATA_JWT}` }
      : {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET
        };

    await axios.delete(url, { headers });

    console.log('✓ Successfully unpinned CID');

  } catch (error) {
    console.error('✗ Failed to unpin CID');
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// CLI usage
const args = process.argv.slice(2);
const command = args[0];
const cid = args[1];

if (!command || !cid) {
  console.log('Usage: node backend/pinService.js <pin|unpin> <CID>');
  console.log('Example: node backend/pinService.js pin QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG');
  process.exit(1);
}

if (command === 'pin') {
  pinCID(cid)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else if (command === 'unpin') {
  unpinCID(cid)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  console.error(`Unknown command: ${command}`);
  console.log('Valid commands: pin, unpin');
  process.exit(1);
}

module.exports = { pinCID, unpinCID };
