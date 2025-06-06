const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying RoyaltyTicket with deployer:", deployer.address);

  const Ticket = await hre.ethers.getContractFactory("RoyaltyTicket");

  // Fix: Provide all constructor params (owner, royalty receiver, and royalty BPS)
  const royaltyReceiver = deployer.address;
  const royaltyBps = 1000; // 10%

  const ticket = await Ticket.deploy(deployer.address, royaltyReceiver, royaltyBps);

  await ticket.deployed();
  console.log("RoyaltyTicket deployed to:", ticket.address);

  const path = "scripts/deployed.json";
  let deployed = {};
  if (fs.existsSync(path)) {
    deployed = JSON.parse(fs.readFileSync(path));
  }

  deployed["royalty"] = ticket.address;

  fs.writeFileSync(path, JSON.stringify(deployed, null, 2));
  console.log("Saved RoyaltyTicket to scripts/deployed.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
