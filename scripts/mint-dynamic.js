const hre = require("hardhat");

async function main() {
  const [deployer, recipient] = await hre.ethers.getSigners();

  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const Ticket = await hre.ethers.getContractAt("DynamicTicket", contractAddress);

  const validURI = "ipfs://ticket-valid.json";
  const tx = await Ticket.mintTicket(recipient.address, validURI);
  await tx.wait();

  console.log(`🎫 Dynamic Ticket minted to ${recipient.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
