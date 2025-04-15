const hre = require("hardhat");

async function main() {
  const Ticket = await hre.ethers.getContractFactory("DynamicTicket");
  const ticket = await Ticket.deploy();

  await ticket.deployed();

  console.log("✅ DynamicTicket deployed to:", ticket.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
