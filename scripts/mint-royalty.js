const hre = require("hardhat");

async function main() {
  const [owner, recipient] = await hre.ethers.getSigners();

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const Ticket = await hre.ethers.getContractAt("RoyaltyTicket", contractAddress);

  const metadataURI = "ipfs://sample-royalty-ticket.json";
  const royaltyReceiver = owner.address;
  const royaltyBips = 500; // 5%

  const tx = await Ticket.mintTicket(recipient.address, metadataURI, royaltyReceiver, royaltyBips);
  await tx.wait();

  console.log(`🎫 Royalty Ticket minted to ${recipient.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
