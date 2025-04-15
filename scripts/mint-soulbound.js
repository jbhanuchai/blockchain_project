const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // must match the deployed address
  const Ticket = await hre.ethers.getContractAt("SoulboundTicket", contractAddress);

  const [owner, recipient] = await hre.ethers.getSigners();

  const tx = await Ticket.connect(owner).mintTicket(
    recipient.address,
    "ipfs://sample-soulbound-metadata.json"
  );
  await tx.wait();

  console.log(`🎫 Soulbound Ticket minted to ${recipient.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
