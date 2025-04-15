const { expect } = require("chai");

describe("RoyaltyTicket", function () {
    let contract, owner, user;
  
    beforeEach(async () => {
      [owner, user] = await ethers.getSigners();
      const Ticket = await ethers.getContractFactory("RoyaltyTicket");
      contract = await Ticket.deploy();
      await contract.deployed();
    });
  
    it("should mint a royalty ticket", async () => {
      const tx = await contract.mintTicket(user.address, "ipfs://sample", owner.address, 500);
      await tx.wait();
      expect(await contract.ownerOf(0)).to.equal(user.address);
    });
  
    it("should return royalty info", async () => {
      await contract.mintTicket(user.address, "ipfs://sample", owner.address, 500);
      const royalty = await contract.royaltyInfo(0, 1000);
      expect(royalty[0]).to.equal(owner.address);
      expect(royalty[1]).to.equal(50); // 5% of 1000
    });
  });
  