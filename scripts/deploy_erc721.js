const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const Ticket = await hre.ethers.getContractFactory("contracts/ERC721Ticket.sol:ERC721Ticket");
  const ticket = await Ticket.deploy();

  await ticket.deployed();
  console.log("ERC721Ticket deployed to:", ticket.address);

  const path = "scripts/deployed.json";
  let deployed = {};
  if (fs.existsSync(path)) {
    deployed = JSON.parse(fs.readFileSync(path));
  }

  deployed["erc721"] = ticket.address;

  fs.writeFileSync(path, JSON.stringify(deployed, null, 2));
  console.log("Saved ERC721Ticket to scripts/deployed.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
