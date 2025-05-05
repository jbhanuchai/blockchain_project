# NFT-Based Event Ticketing System (CS-5833 Final Project)

## Contributors
- **Dhanushwi Arava**
- **Bhanu Chaitanya Jasti**

## Overview
This project is a decentralized ticketing platform built using Ethereum smart contracts and a full-stack dApp frontend. It supports various ticket types (Standard, Soulbound, Royalty, Dynamic) with real-world features like resale royalties, usage tracking, and non-transferability. Metadata is hosted on IPFS using Pinata, and all interactions occur through a React + MetaMask interface.

---

## Demo Video

[![Watch the Demo Video](https://img.youtube.com/vi/8McLZfgEbW4/0.jpg)](https://drive.google.com/file/d/1QOZqo9eZN7EVMDbJ0a_bIsXA-CJsik6v/view?usp=sharing)

Click the thumbnail or [this link](https://drive.google.com/file/d/1QOZqo9eZN7EVMDbJ0a_bIsXA-CJsik6v/view?usp=sharing) to watch the full system walkthrough.

## Features

| Ticket Type      | Description                                           |
|------------------|-------------------------------------------------------|
| Standard         | Transferable ERC-721 NFT for general use             |
| Soulbound        | Non-transferable identity-bound tickets              |
| Royalty          | Resale-enabled with EIP-2981 enforced royalties      |
| Dynamic          | Metadata updates on usage (e.g., mark ticket as used)|

- Admin can mint any type of ticket from the dashboard
- Users can buy, view, and resell tickets
- QR-based ticket verification system for event check-in
- Tickets stored as NFTs on the Sepolia Ethereum testnet
- All metadata hosted via IPFS using Pinata

---

## Smart Contracts

### Contracts Developed
- `StandardTicket.sol`
- `SoulboundTicket.sol`
- `RoyaltyTicket.sol`
- `DynamicTicket.sol`

### Key Highlights
- RoyaltyTicket uses EIP-2981 for automatic resale royalties.
- SoulboundTicket prevents transfers after minting.
- DynamicTicket updates URI (e.g., from valid to used) on check-in.
- All contracts deployed and tested on Sepolia testnet.

### Deployment & Scripts
- Scripts: `deploy-*.js`, `mint-*.js`, `mark-used.js`
- Addresses logged in `deployedContracts.js`
- Metadata files in `/metadata` uploaded to Pinata via backend

---

## Frontend (React dApp)

### Pages Implemented
| Page            | Functionality                                                                 |
|------------------|--------------------------------------------------------------------------------|
| Home             | Landing page with system overview                                              |
| Admin Dashboard  | Mint any ticket type + monitor all minted tickets with metadata               |
| My Tickets       | View owned tickets and list Standard/Royalty tickets for resale               |
| Marketplace      | Buy tickets listed for resale or by admin                                      |
| Verify Ticket    | Scan QR and validate ownership + mark Dynamic tickets as used                 |
| My Badge         | View Soulbound badges (non-transferable tickets only)                         |

- Wallet integration with MetaMask
- Real-time contract read/write using `ethers.js`
- IPFS-hosted images and metadata rendered in-app

---

## Backend Server (Node.js)

- Express server on port `5001`
- Handles metadata upload to Pinata using JWT
- Routes:
  - `POST /upload-to-pinata` → Uploads ticket metadata JSON
  - `GET /test-pinata` → Test Pinata connectivity

- Uses `dotenv` for secure API keys
- File: `backend/server.js`

---

## IPFS + Pinata

- Metadata stored as JSON and uploaded via backend
- Fields: `name`, `description`, `image`, `attributes`
- Used JWT auth for secure API calls
- IPFS URIs are stored in the contracts via `tokenURI`

---

##  Real-World Blockchain Analysis

- Analyzed 1,146 real Transfer events from YellowHeart’s Ethereum contract
- Found 350 mints and 796 secondary transfers
- Most mints occurred on Oct 4, 2021, and resales peaked on Nov 6, 2021
- Supports our model choices: Soulbound, Dynamic, and Royalty

---

## Testing & Validation

- All contracts tested using Hardhat
- Key tests:
  - Preventing transfers (Soulbound)
  - Enforcing resale royalties (Royalty)
  - Marking ticket as used (Dynamic)
- Frontend tested with Sepolia accounts for mint → list → buy flow

---

## Tech Stack

- **Smart Contracts**: Solidity, OpenZeppelin
- **Frontend**: React.js, Ethers.js, React Router
- **Backend**: Node.js, Express, dotenv, Pinata SDK
- **Blockchain**: Ethereum Sepolia Testnet
- **Storage**: IPFS (via Pinata)

---

## Getting Started (Local Setup)

```bash
# Clone the repo and install dependencies
git clone https://github.com/your-username/blockchain-ticketing-project.git
cd blockchain-ticketing-project
npm install

# Configure Environment Variables
# Create the following .env files in the respective folders:
# backend/.env
PINATA_JWT=your_pinata_jwt_token_here

# frontend/.env
REACT_APP_PINATA_JWT=your_pinata_jwt_token_here
REACT_APP_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
REACT_APP_PRIVATE_KEY=your_private_key_here

# Start Backend (Port 5001)
cd backend
nodemon server.js

# Start the Frontend
cd frontend
npm start

# Deploy Smart Contracts to Sepolia
# Make sure your .env contains valid RPC and private key.
npx hardhat run scripts/deploy_standard.js --network sepolia
npx hardhat run scripts/deploy-soulbound.js --network sepolia
npx hardhat run scripts/deploy-royalty.js --network sepolia
npx hardhat run scripts/deploy-dynamic.js --network sepolia

```
## You're All Set!
- Visit the frontend at: http://localhost:3000

- Connect MetaMask (Sepolia Testnet)

- Start minting, viewing, and verifying NFT tickets

## How to Use

1. Connect MetaMask (Sepolia testnet)
2. Go to "Admin Dashboard" to mint tickets
3. Visit "Marketplace" to buy resellable tickets
4. Check "My Tickets" to list tickets for resale or view them
5. Use "Verify Ticket" to scan QR and mark Dynamic tickets as used
6. View achievements on "My Badge" page (for soulbound tickets)

## License

This project is for academic purposes (CS-5833, Spring 2025). No production use is implied.

## Acknowledgments

- Instructor: Dr. Anindya Maiti
- University of Oklahoma, CS-5833 Blockchains & Cryptocurrencies
- OpenZeppelin for reusable smart contract modules
- Pinata & IPFS for decentralized metadata storage
- Hardhat, Infura, and MetaMask for Ethereum development support