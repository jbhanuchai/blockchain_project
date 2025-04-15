const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulboundTicket", function () {
  let contract, owner, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const Ticket = await ethers.getContractFactory("SoulboundTicket");
    contract = await Ticket.deploy();
    await contract.deployed();
  });

  it("should mint a soulbound ticket", async () => {
    const tx = await contract.mintTicket(user.address, "ipfs://sample");
    await tx.wait();
    expect(await contract.ownerOf(0)).to.equal(user.address);
  });

  it("should prevent transfers (soulbound)", async () => {
    await contract.mintTicket(user.address, "ipfs://sample");
    await expect(
      contract.connect(user).transferFrom(user.address, owner.address, 0)
    ).to.be.revertedWith("Soulbound: tokens cannot be transferred");    
  });
});
