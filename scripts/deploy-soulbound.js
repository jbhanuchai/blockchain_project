const hre = require("hardhat");

async function main() {
  const Ticket = await hre.ethers.getContractFactory("SoulboundTicket");
  const ticket = await Ticket.deploy();

  await ticket.deployed();

  console.log("✅ SoulboundTicket deployed to:", ticket.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
