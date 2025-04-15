# Blockchain Project: NFT-Based Ticketing System

## 👥 Contributors
- **Bhanu Chaitanya Jasti**
- **Dhanushwi Arava**

---

## Week 1 Progress: Soulbound Ticketing

### 1. Smart Contract Development – `SoulboundTicket.sol`
- Implemented a custom ERC-721 ticket that is non-transferable.
- Overrode `transferFrom` and `safeTransferFrom` functions to revert on transfer attempts.
- Created `mintTicket(address recipient, string memory uri)` for minting tickets with metadata.

### 2. Hardhat Environment Setup
- Initialized the Hardhat project using `npx hardhat`.
- Installed essential packages:
  - `ethers`, `hardhat-toolbox`, `chai`, `dotenv`.
- Created deployment script: `scripts/deploy-soulbound.js`.

### 3. Unit Testing
- Developed `test/SoulboundTicket.test.js`:
  - Minting ticket succeeds.
  - Transfers revert with `"Soulbound: tokens cannot be transferred"`.

### 4. Local Blockchain Deployment & Verification
- Ran local Hardhat testnet using `npx hardhat node`.
- Deployed and verified:
  - Minting worked via console interaction.
  - Ownership and metadata retrieval confirmed.
  - Transfer attempts correctly reverted.

---

## Week 2 Progress: Multi-Model NFT Ticketing

### 1. Developed 5 Ticket Variants

| Ticket Type         | Contract File             | Key Feature |
|---------------------|---------------------------|-------------|
| Standard ERC-721    | `ERC721Ticket.sol`        | Basic transfer-enabled NFT |
| Soulbound           | `SoulboundTicket.sol`     | Transfer-disabled NFT |
| Royalty-Enforced    | `RoyaltyTicket.sol`       | EIP-2981 compliant resale royalties |
| Dynamic Metadata    | `DynamicTicket.sol`       | Metadata updates after use |
| One-Time Ticket     | `StandardTicket.sol`      | Minimalist, single-use ticket |

### 2. Deployment Scripts
- Created dedicated deployment scripts:
  - `deploy-erc721.js`, `deploy-soulbound.js`, `deploy-royalty.js`, `deploy-dynamic.js`, `deploy-standard.js`.

### 3. Minting Scripts
- Local minting for testing:
  - `mint-local.js`, `mint-soulbound.js`, `mint-royalty.js`, `mint-dynamic.js`.

### 4. Dynamic Metadata Handling
- `DynamicTicket.sol` uses `markAsUsed()` to update ticket state:
  - Example: `"ipfs://ticket-active"` → `"ipfs://ticket-used"`.

### 5. Unit Testing – Royalty & Dynamic Tickets
- `DynamicTicket.test.js`:
  - Verifies mint and URI update after `markAsUsed()`.
- `RoyaltyTicket.test.js`:
  - Validates royalty recipient and percentage via `royaltyInfo()`.

---

## Research Alignment with Instructor Feedback

Based on the instructor’s suggestion, we are:
- Prototyping and comparing **multiple NFT ticketing strategies**:
  - Soulbound NFTs
  - Royalty-enforced NFTs
  - Dynamic metadata models
- Exploring the **security and limitations** of each approach:
  - Transfer restrictions
  - Royalty enforcement potential
  - Real-world usability
- Planning to integrate **blockchain data analytics**:
  - E.g., studying resale behavior and transaction patterns from live platforms like GET Protocol or Seatlab.

---

## Week 3–4 Roadmap

- [ ] Set up React frontend with navigation for ticket types.
- [ ] Integrate MetaMask wallet using `ethers.js`.
- [ ] Enable minting UI for each ticket variant.
- [ ] Display NFT metadata, state, and royalty details.
- [ ] Analyze real blockchain data to validate effectiveness of each model.

---

## Local Development Guide

```bash
# Install dependencies
npm install

# Start local blockchain
npx hardhat node

# In a new terminal, deploy contract (e.g., Soulbound)
npx hardhat run scripts/deploy-soulbound.js --network localhost

# Interact via console
npx hardhat console --network localhost

# Run unit tests
npx hardhat test
```