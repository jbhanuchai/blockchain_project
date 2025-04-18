const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const Ticket = await hre.ethers.getContractFactory("contracts/ERC721Ticket.sol:ERC721Ticket");
  const ticket = await Ticket.deploy();

  await ticket.deployed();

  const address = ticket.address;
  console.log("ERC721Ticket deployed to:", address);
  const deployedPath = "scripts/deployed.json";
  const deployed = fs.existsSync(deployedPath)
    ? JSON.parse(fs.readFileSync(deployedPath))
    : {};
  deployed["erc721"] = address;
  fs.writeFileSync(deployedPath, JSON.stringify(deployed, null, 2));
  console.log("Saved to scripts/deployed.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
