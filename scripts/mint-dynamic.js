require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const recipient = process.env.SEPOLIA_RECIPIENT;
  const privateKey = process.env.PRIVATE_KEY;

  if (!recipient) {
    throw new Error("SEPOLIA_RECIPIENT is not defined in .env");
  }

  if (!privateKey) {
    throw new Error("PRIVATE_KEY is not defined in .env");
  }

  const deployed = JSON.parse(fs.readFileSync("scripts/deployed.json"));
  const contractAddress = deployed["DynamicTicket"]["sepolia"];

  const wallet = new hre.ethers.Wallet(privateKey, hre.ethers.provider);
  const DynamicTicket = await hre.ethers.getContractAt("DynamicTicket", contractAddress, wallet);

  const metadataURI = "ipfs://QmExampleHash/ticket-valid.json"; 

  console.log(`Using DynamicTicket at: ${contractAddress}`);
  console.log("Minting Dynamic Ticket...");
  console.log(`Recipient: ${recipient}`);
  console.log(`Metadata: ${metadataURI}`);

  try {
    const gasEstimate = await DynamicTicket.estimateGas.mintTicket(recipient, metadataURI);
    console.log(`Gas Estimate: ${gasEstimate.toString()}`);

    const tx = await DynamicTicket.mintTicket(recipient, metadataURI);
    await tx.wait();
    console.log("Dynamic Ticket minted successfully!");
  } catch (error) {
    console.error("Minting failed:", error.reason || error.message || error);
    process.exit(1);
  }
}

main();
