const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 5001; // Changed to 5001 to avoid conflict

app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`📩 Received request: ${req.method} ${req.url}`);
  next();
});

console.log("✅ Using JWT:", process.env.PINATA_JWT);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Test route to check Pinata connection
app.get('/test-pinata', async (req, res) => {
  try {
    const testMetadata = {
      pinataMetadata: { name: "Test File" },
      pinataContent: { test: "Pinata Test Upload", timestamp: new Date().toISOString() },
    };
    console.log('➡️ Uploading test metadata:', testMetadata);

    const pinataRes = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', testMetadata, {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
    });

    const { IpfsHash } = pinataRes.data;
    console.log('✅ Pinata upload successful:', pinataRes.data);

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

// Route for uploading event metadata
app.post('/upload-to-pinata', async (req, res) => {
  try {
    const { eventName, date, price } = req.body;
    if (!eventName || !date || !price) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const metadata = {
      pinataMetadata: { name: `Event-${eventName}-${date}` },
      pinataContent: { eventName, date, price, timestamp: new Date().toISOString() },
    };
    console.log('➡️ Uploading event metadata:', metadata);

    const pinataRes = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
    });

    const { IpfsHash } = pinataRes.data;
    console.log('✅ Pinata upload successful:', pinataRes.data);

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