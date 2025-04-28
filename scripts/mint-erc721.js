require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  const recipientAddress = process.env.SEPOLIA_RECIPIENT;

  if (!privateKey || !recipientAddress) {
    throw new Error("PRIVATE_KEY or SEPOLIA_RECIPIENT not defined in .env");
  }

  const wallet = new hre.ethers.Wallet(privateKey, hre.ethers.provider);
  const deployed = JSON.parse(fs.readFileSync("scripts/deployed.json"));
  const contractAddress = deployed["ERC721Ticket"]?.["sepolia"];
  if (!contractAddress) throw new Error("ERC721Ticket address missing in deployed.json");

  const ERC721Ticket = await hre.ethers.getContractAt("contracts/ERC721Ticket.sol:ERC721Ticket", contractAddress, wallet);

  const metadataURI = "ipfs://QmExampleHash/erc721-ticket.json";

  console.log(`Using ERC721Ticket at: ${contractAddress}`);
  console.log("Minting ERC721 Ticket...");
  console.log(`To: ${recipientAddress}`);
  console.log(`Metadata: ${metadataURI}`);

  try {
    const tx = await ERC721Ticket.mintTicket(recipientAddress, metadataURI);
    await tx.wait();
    console.log("ERC721 Ticket minted successfully!");
  } catch (err) {
    console.error("Minting failed:", err.reason || err.message || err);
  }
}

main();
