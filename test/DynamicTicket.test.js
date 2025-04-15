const { expect } = require("chai");

describe("DynamicTicket", function () {
    let contract, owner, user;
  
    beforeEach(async () => {
      [owner, user] = await ethers.getSigners();
      const Ticket = await ethers.getContractFactory("DynamicTicket");
      contract = await Ticket.deploy();
      await contract.deployed();
    });
  
    it("should mint a dynamic ticket", async () => {
      const tx = await contract.mintTicket(user.address, "ipfs://valid");
      await tx.wait();
      expect(await contract.ownerOf(0)).to.equal(user.address);
    });
  
    it("should update metadata after use", async () => {
      await contract.mintTicket(user.address, "ipfs://valid");
      const tx = await contract.markAsUsed(0, "ipfs://used");
      await tx.wait();
      expect(await contract.tokenURI(0)).to.equal("ipfs://used");
    });
  });
  