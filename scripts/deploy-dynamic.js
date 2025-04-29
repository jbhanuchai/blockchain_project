const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const Ticket = await hre.ethers.getContractFactory("DynamicTicket");
  const ticket = await Ticket.deploy(deployer.address); // 👈 Pass deployer's address here

  await ticket.deployed();

  console.log("DynamicTicket deployed to:", ticket.address);

  const path = "scripts/deployed.json";
  let deployed = {};
  if (fs.existsSync(path)) {
    deployed = JSON.parse(fs.readFileSync(path));
  }

  deployed["dynamic"] = ticket.address;

  fs.writeFileSync(path, JSON.stringify(deployed, null, 2));
  console.log("Saved DynamicTicket to scripts/deployed.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
