const hre = require("hardhat");

async function main() {
  const Ticket = await hre.ethers.getContractFactory("RoyaltyTicket");
  const ticket = await Ticket.deploy();

  await ticket.deployed();

  console.log("✅ RoyaltyTicket deployed to:", ticket.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
