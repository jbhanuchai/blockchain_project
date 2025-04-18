const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const RoyaltyTicket = await hre.ethers.getContractFactory("RoyaltyTicket");
  const contract = await RoyaltyTicket.deploy();

  await contract.deployed();

  console.log("RoyaltyTicket deployed to:", contract.address);

  const path = "scripts/deployed.json";
  let deployed = {};

  if (fs.existsSync(path)) {
    deployed = JSON.parse(fs.readFileSync(path));
  }

  deployed["royalty"] = contract.address;

  fs.writeFileSync(path, JSON.stringify(deployed, null, 2));
  console.log("Saved royalty address to deployed.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
