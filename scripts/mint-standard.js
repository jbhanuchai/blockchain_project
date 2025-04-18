require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const { ethers } = hre;

async function main() {
  const deployed = JSON.parse(fs.readFileSync("scripts/deployed.json"));

  const contractAddress = deployed?.StandardTicket?.sepolia;
  const recipient = process.env.SEPOLIA_RECIPIENT;
  const metadataURI = "ipfs://QmExampleHash/standard-ticket.json"; 

  if (!contractAddress) {
    throw new Error("Contract address for StandardTicket on Sepolia is missing in deployed.json");
  }

  if (!recipient) {
    throw new Error("SEPOLIA_RECIPIENT is not defined in .env");
  }

  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const Ticket = await hre.ethers.getContractAt(
    "contracts/StandardTicket.sol:ERC721Ticket",
    contractAddress,
    wallet
  );

  console.log(`Using StandardTicket at: ${contractAddress}`);
  console.log(`Minting Standard Ticket...`);
  console.log(`Recipient: ${recipient}`);
  console.log(`Metadata: ${metadataURI}`);

  try {
    const gas = await Ticket.estimateGas.mintTicket(recipient, metadataURI);
    console.log(`Estimated gas: ${gas.toString()}`);
  } catch {
    console.warn("Gas estimation failed. Proceeding with transaction...");
  }

  const tx = await Ticket.mintTicket(recipient, metadataURI);
  await tx.wait();

  console.log("Standard Ticket minted successfully!");
}

main().catch((err) => {
  console.error("Minting failed:", err.message);
  process.exitCode = 1;
});
