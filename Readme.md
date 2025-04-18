# NFT-Based Ticketing System

## Contributors
- **Dhanushwi Arava**
- **Bhanu Chaitanya Jasti**

---

## Week 1: Core Logic & Soulbound NFT

### 1. Smart Contract Development
- `SoulboundTicket.sol`: A custom ERC721 ticket that prevents transfers after minting.
  - Overrides `transferFrom` and `safeTransferFrom` to enforce non-transferability.
  - Minting is done via `mintTicket(address, string memory uri)`.

### 2. Hardhat + Infura Setup
- Initialized Hardhat and configured `.env` with:
  - `SEPOLIA_RPC_URL` (from Infura)
  - `PRIVATE_KEY` (MetaMask)
  - `SEPOLIA_RECIPIENT`

### 3. Deployment & Minting Scripts
- `scripts/deploy-soulbound.js` - deployed to Sepolia  
- `scripts/mint-soulbound.js` - minted to recipient via Sepolia

### 4. Metadata Creation
- Added `metadata/soulbound-ticket.json` with:
  - `name`, `description`, `image`, and `attributes`

### 5. Real Deployment to Sepolia
- Used Infura + MetaMask to deploy contracts and mint tickets on Sepolia  
- Verified gas costs, ownership, and metadata

### 6. Unit Testing
- `test/SoulboundTicket.test.js`
  - Minting works
  - Transfers are reverted with reason string

---

## Week 2: Multiple Ticketing Models

### 1. Five NFT Models Developed

| Ticket Type         | Solidity File           | Feature                        |
|---------------------|--------------------------|--------------------------------|
| Soulbound Ticket    | `SoulboundTicket.sol`    | Non-transferable               |
| Royalty Ticket      | `RoyaltyTicket.sol`      | Resale royalties (EIP-2981)    |
| Dynamic Ticket      | `DynamicTicket.sol`      | URI change after use           |
| ERC721 Ticket       | `ERC721Ticket.sol`       | Basic transferable ticket      |
| Standard Ticket     | `StandardTicket.sol`     | Minimal ERC721                 |

### 2. Deployment Scripts
- `deploy-soulbound.js`
- `deploy-royalty.js`
- `deploy-dynamic.js`
- `deploy-erc721.js`
- `deploy-standard.js`

All deployed to Sepolia and logged in `deployed.json`

### 3. Minting Scripts
- `mint-soulbound.js`
- `mint-royalty.js`
- `mint-dynamic.js`
- `mint-erc721.js`
- `mint-standard.js`

All use:
- `.env` for keys and recipients  
- `deployed.json` for contract addresses

### 4. Metadata JSON Files
Files located in `metadata/`:
- `soulbound-ticket.json`
- `royalty-ticket.json`
- `erc721-ticket.json`
- `standard-ticket.json`
- `dynamic-ticket.json`
- `ticket-valid.json`
- `ticket-used.json`

### 5. Unit Tests Implemented
- `SoulboundTicket.test.js`
- `RoyaltyTicket.test.js`
- `DynamicTicket.test.js`

Tests include:
- Minting functionality
- Royalty calculations
- URI updates after scan

### 6. `mark-used.js` Script
- Simulates real-world usage by changing URI after an event check-in  
- Updates metadata from `ticket-valid.json` to `ticket-used.json`

---

## Network: Sepolia Testnet
- All contracts deployed to Sepolia using Infura  
- Minting validated using MetaMask addresses

---

## Tooling Used
- Hardhat  
- Ethers.js  
- Infura  
- MetaMask  
- IPFS Metadata (placeholder hashes)  
- dotenv + fs for environment and file access

---

## Summary of Contributions
- Deployed and tested five unique NFT models on Sepolia  
- Separated and modularized deployment and minting logic  
- Secured all key and address data in `.env`  
- Created structured and readable logs for minting and gas usage  
- Implemented metadata switching to reflect usage status  
- Created a clean Git branch and commit history for Week 1 and Week 2

---

## Week 3+ Roadmap
- [ ] Build a React frontend for ticket management  
- [ ] Enable minting through UI using MetaMask  
- [ ] Display NFT state, attributes, and ownership  
- [ ] Host IPFS files and link metadata correctly  
- [ ] Analyze blockchain events for resale or usage insights

---

## Local Development Guide

```bash
# Install dependencies
npm install

# Start local testnet
npx hardhat node

# Deploy a contract (example)
npx hardhat run scripts/deploy-soulbound.js --network localhost

# Run unit tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy-royalty.js --network sepolia

# Mint ticket on Sepolia
npx hardhat run scripts/mint-royalty.js --network sepolia
