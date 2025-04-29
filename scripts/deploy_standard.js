const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying StandardTicket from:", deployer.address);

  const Ticket = await hre.ethers.getContractFactory("StandardTicket"); // ✅ FIXED name
  const ticket = await Ticket.deploy(deployer.address); // ✅ pass initialOwner

  await ticket.deployed();
  console.log("StandardTicket deployed to:", ticket.address);

  const path = "scripts/deployed.json";
  let deployed = {};
  if (fs.existsSync(path)) {
    deployed = JSON.parse(fs.readFileSync(path));
  }

  deployed["standard"] = ticket.address; // ✅ Correct key

  fs.writeFileSync(path, JSON.stringify(deployed, null, 2));
  console.log("✅ Saved StandardTicket to scripts/deployed.json");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
