require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

const deployed = JSON.parse(fs.readFileSync("scripts/deployed.json"));
const contractAddress = deployed["RoyaltyTicket"]["sepolia"];

if (!contractAddress) {
  throw new Error("RoyaltyTicket contract address for Sepolia not found in deployed.json");
}

const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const RoyaltyTicketABI = [
  "function mintTicket(address to, string memory tokenURI, address royaltyReceiver, uint96 royaltyFeeInBips) public"
];

const recipient = process.env.SEPOLIA_RECIPIENT;
const metadataURI = "ipfs://QmExampleHash/royalty-ticket.json";
const royaltyReceiver = recipient;
const royaltyFee = 1000; 

async function main() {
  const contract = new ethers.Contract(contractAddress, RoyaltyTicketABI, wallet);

  console.log(`Using RoyaltyTicket at: ${contractAddress}`);
  console.log("Minting Royalty Ticket...");
  console.log(`Recipient: ${recipient}`);
  console.log(`Royalty To: ${royaltyReceiver}`);
  console.log(`Metadata: ${metadataURI}`);
  console.log(`Royalty Fee: ${royaltyFee / 100}%`);

  try {
    const gasEstimate = await contract.estimateGas.mintTicket(
      recipient,
      metadataURI,
      royaltyReceiver,
      royaltyFee
    );
    console.log(`Gas Estimate: ${gasEstimate.toString()}`);
  } catch (err) {
    console.error("Gas estimation failed:", err.reason || err.message || err);
    return;
  }

  try {
    const tx = await contract.mintTicket(
      recipient,
      metadataURI,
      royaltyReceiver,
      royaltyFee
    );
    await tx.wait();
    console.log("Royalty Ticket minted successfully!");
  } catch (error) {
    console.error("Minting failed:", error.reason || error.message || error);
  }
}

main();
