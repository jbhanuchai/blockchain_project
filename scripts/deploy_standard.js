const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract from:", deployer.address);

  const Ticket = await hre.ethers.getContractFactory("contracts/StandardTicket.sol:ERC721Ticket");
  const ticket = await Ticket.deploy(deployer.address); // Pass the owner address

  await ticket.deployed();
  console.log("Standard Ticket deployed to:", ticket.address);
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
