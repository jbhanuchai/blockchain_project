const hre = require("hardhat");

async function main() {
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const Ticket = await hre.ethers.getContractAt("DynamicTicket", contractAddress);

  const usedURI = "ipfs://ticket-used.json"; // placeholder

  const tx = await Ticket.markAsUsed(0, usedURI); // update tokenId 0
  await tx.wait();

  console.log("🎟️ Ticket #0 marked as used!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
