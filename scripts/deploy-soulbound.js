const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying SoulboundTicket from:", deployer.address);

  const Ticket = await hre.ethers.getContractFactory("SoulboundTicket");
  const ticket = await Ticket.deploy(deployer.address); // ✅ pass deployer address

  await ticket.deployed();
  console.log("SoulboundTicket deployed to:", ticket.address);

  const path = "scripts/deployed.json";
  let deployed = {};
  if (fs.existsSync(path)) {
    deployed = JSON.parse(fs.readFileSync(path));
  }

  deployed["soulbound"] = ticket.address;

  fs.writeFileSync(path, JSON.stringify(deployed, null, 2));
  console.log("✅ Saved SoulboundTicket to scripts/deployed.json");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
