const hre = require("hardhat");

async function main() {
  const Ticket = await hre.ethers.getContractFactory("ERC721Ticket");
  const ticket = await Ticket.deploy();

  await ticket.deployed();

  console.log("ERC721Ticket deployed to:", ticket.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
