const { expect } = require("chai");
const { ethers } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");

describe("NFT Ticketing System", function () {
  let owner, user1, user2;
  let standardTicket, soulboundTicket, royaltyTicket, dynamicTicket;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy StandardTicket
    const StandardTicket = await ethers.getContractFactory("StandardTicket");
    standardTicket = await StandardTicket.deploy(owner.address);
    await standardTicket.deployed();

    // Deploy SoulboundTicket
    const SoulboundTicket = await ethers.getContractFactory("SoulboundTicket");
    soulboundTicket = await SoulboundTicket.deploy();
    await soulboundTicket.deployed();

    // Deploy RoyaltyTicket
    const RoyaltyTicket = await ethers.getContractFactory("RoyaltyTicket");
    royaltyTicket = await RoyaltyTicket.deploy(owner.address, owner.address, 1000); // 10% royalty
    await royaltyTicket.deployed();

    // Deploy DynamicTicket
    const DynamicTicket = await ethers.getContractFactory("DynamicTicket");
    dynamicTicket = await DynamicTicket.deploy(owner.address);
    await dynamicTicket.deployed();
  });

  it("SoulboundTicket: should prevent unauthorized transfers", async function () {
    await soulboundTicket.mint(user1.address, "ipfs://test");
    await expect(
      soulboundTicket.connect(user1).transferFrom(user1.address, user2.address, 0)
    ).to.be.revertedWith("Soulbound: transfers disabled");
  });

  it("RoyaltyTicket: should prevent listing above maxResalePrice", async function () {
    await royaltyTicket.mintTicket(
      user1.address,
      "ipfs://test",
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("2")
    );
    await expect(
      royaltyTicket.connect(user1).listForSale(0, ethers.utils.parseEther("3"))
    ).to.be.revertedWith("Exceeds max resale price");
  });

  it("RoyaltyTicket: should handle resale with royalties", async function () {
    await royaltyTicket.mintTicket(
      user1.address,
      "ipfs://test",
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("2")
    );
    await royaltyTicket.connect(user1).listForSale(0, ethers.utils.parseEther("1.5"));

    const initialRoyaltyBalance = await ethers.provider.getBalance(owner.address);
    await royaltyTicket.connect(user2).buyTicket(0, { value: ethers.utils.parseEther("1.5") });

    expect(await royaltyTicket.ownerOf(0)).to.equal(user2.address);
    const finalRoyaltyBalance = await ethers.provider.getBalance(owner.address);
    const royaltyAmount = ethers.utils.parseEther("1.5").mul(1000).div(10000); // 10% of 1.5 ETH
    expect(finalRoyaltyBalance.sub(initialRoyaltyBalance)).to.be.closeTo(
      royaltyAmount,
      ethers.utils.parseEther("0.01")
    );
  });

  it("StandardTicket: should allow resale", async function () {
    await standardTicket.mintTicket(user1.address, "ipfs://test", ethers.utils.parseEther("1"));
    await standardTicket.connect(user1).listForSale(0, ethers.utils.parseEther("1.5"));
    await standardTicket.connect(user2).buyTicket(0, { value: ethers.utils.parseEther("1.5") });
    expect(await standardTicket.ownerOf(0)).to.equal(user2.address);
  });

  it("DynamicTicket: should update metadata and mark as used", async function () {
    await dynamicTicket.mintTicket(user1.address, "ipfs://test");
    await dynamicTicket.updateMetadata(0, "ipfs://updated");
    expect(await dynamicTicket.tokenURI(0)).to.equal("ipfs://updated");
    await dynamicTicket.markAsUsed(0, "ipfs://used");
    expect(await dynamicTicket.used(0)).to.be.true;
    expect(await dynamicTicket.tokenURI(0)).to.equal("ipfs://used");
  });
});