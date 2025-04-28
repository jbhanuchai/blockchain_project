require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY missing from .env");

  const deployed = JSON.parse(fs.readFileSync("scripts/deployed.json"));
  const contractAddress = deployed["DynamicTicket"]?.["sepolia"];

  if (!contractAddress) {
    throw new Error("DynamicTicket sepolia address not found in deployed.json");
  }

  const wallet = new hre.ethers.Wallet(privateKey, hre.ethers.provider);
  const DynamicTicket = await hre.ethers.getContractAt("DynamicTicket", contractAddress, wallet);

  const tokenId = 0; 
  const newURI = "ipfs://QmExampleHash/ticket-used.json";

  console.log(`Marking Ticket #${tokenId} as USED`);
  console.log(`New URI: ${newURI}`);

  try {
    const gasEstimate = await DynamicTicket.estimateGas.markAsUsed(tokenId, newURI);
    console.log(`Gas Estimate: ${gasEstimate.toString()}`);

    const tx = await DynamicTicket.markAsUsed(tokenId, newURI);
    await tx.wait();
    console.log("Ticket metadata updated successfully!");
  } catch (err) {
    console.error("Gas estimation failed:", err.reason || err.message || err);
  }
}

main();
