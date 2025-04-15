const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const Ticket = await hre.ethers.getContractFactory("ERC721Ticket");

  const ticket = await Ticket.deploy(deployer.address); // pass the address
  await ticket.waitForDeployment();

  console.log(`ERC-721 Ticket deployed at: ${await ticket.getAddress()}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
