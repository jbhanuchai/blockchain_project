const hre = require("hardhat");

async function main() {
  const [deployer, recipient] = await hre.ethers.getSigners();

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const Ticket = await hre.ethers.getContractAt("ERC721Ticket", contractAddress);

  const metadataURI = "ipfs://sample-fake-hash/metadata.json"; // Placeholder

  const tx = await Ticket.mintTicket(recipient.address, metadataURI);
  await tx.wait();

  console.log(`✅ Ticket minted to ${recipient.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
