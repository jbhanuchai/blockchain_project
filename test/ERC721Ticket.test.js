const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC721Ticket", function () {
  let owner, user, contract;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("contracts/ERC721Ticket.sol:ERC721Ticket");
    contract = await Factory.deploy();
    await contract.deployed();
  });

  it("should mint a ticket to user", async function () {
    await contract.mintTicket(user.address, "ipfs://basic.json");
    expect(await contract.ownerOf(0)).to.equal(user.address);
  });

  it("should allow transfer from user to owner", async function () {
    await contract.mintTicket(user.address, "ipfs://basic.json");
    await contract.connect(user).transferFrom(user.address, owner.address, 0);
    expect(await contract.ownerOf(0)).to.equal(owner.address);
  });
});
