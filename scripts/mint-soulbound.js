const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  const deployed = JSON.parse(fs.readFileSync("scripts/deployed.json"));
  const contractAddress = deployed["SoulboundTicket"]["sepolia"];

  if (!contractAddress) {
    throw new Error("SoulboundTicket address not found in deployed.json");
  }

  const recipient = process.env.SEPOLIA_RECIPIENT;

  if (!recipient) {
    throw new Error("SEPOLIA_RECIPIENT is not defined in .env");
  }

  const metadataURI = "ipfs://QmExampleHash/soulbound-ticket.json";
  const Ticket = await hre.ethers.getContractAt("contracts/SoulboundTicket.sol:SoulboundTicket", contractAddress);

  const [owner] = await hre.ethers.getSigners();

  console.log("Minting Soulbound Ticket...");
  console.log(`Recipient: ${recipient}`);
  console.log(`Metadata URI: ${metadataURI}`);

  const tx = await Ticket.connect(owner).mintTicket(recipient, metadataURI);
  await tx.wait();

  console.log("Soulbound Ticket minted successfully!");
}

main().catch((error) => {
  console.error("Minting failed:", error);
  process.exitCode = 1;
});
