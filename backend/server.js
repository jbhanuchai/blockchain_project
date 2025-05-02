const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📩 Received request: ${req.method} ${req.url}`);
  next();
});

console.log("✅ Using JWT:", process.env.PINATA_JWT);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Test Pinata connection
app.get('/test-pinata', async (req, res) => {
  try {
    const testMetadata = {
      pinataMetadata: { name: "Test File" },
      pinataContent: { test: "Pinata Test Upload", timestamp: new Date().toISOString() },
    };

    const pinataRes = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', testMetadata, {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
    });

    const { IpfsHash } = pinataRes.data;

    return res.status(200).json({
      success: true,
      ipfsUri: `ipfs://${IpfsHash}`,
      ipfsHash: IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
    });
  } catch (error) {
    console.error('❌ Pinata test failed:', {
      message: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    return res.status(500).json({
      success: false,
      error: 'Pinata test failed',
      details: error?.response?.data || error.message,
    });
  }
});

// GET IPFS metadata through backend proxy to avoid CORS
app.get('/fetch-ipfs/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;

    // Ensure CID is clean (some errors show full URL as "CID")
    const cleanedCid = cid.includes("ipfs/") ? cid.split("ipfs/")[1] : cid;

    const url = `https://gateway.pinata.cloud/ipfs/${cleanedCid}`;
    const ipfsRes = await axios.get(url);
    return res.json(ipfsRes.data);
  } catch (err) {
    console.error(`❌ Backend proxy failed for CID ${req.params.cid}:`, err.message);
    return res.status(500).json({ error: 'Failed to fetch from IPFS', details: err.message });
  }
});

// Upload event metadata to Pinata (price optional)
app.post('/upload-to-pinata', async (req, res) => {
  try {
    const { eventName, date, price } = req.body;

    if (!eventName || !date) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const content = {
      eventName,
      date,
      timestamp: new Date().toISOString()
    };

    if (price !== undefined && price !== null && price !== "") {
      content.price = price;
    }

    const metadata = {
      pinataMetadata: { name: `Event-${eventName}-${date}` },
      pinataContent: content,
    };

    console.log("➡️ Uploading metadata:", metadata);

    const pinataRes = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
    });

    const { IpfsHash } = pinataRes.data;

    return res.status(200).json({
      success: true,
      ipfsUri: `ipfs://${IpfsHash}`,
      ipfsHash: IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
    });
  } catch (error) {
    console.error('❌ Pinata upload failed:', {
      message: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    return res.status(500).json({
      success: false,
      error: 'Upload failed',
      details: error?.response?.data || error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend running at http://localhost:${port}`);
});