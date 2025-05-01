// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract StandardTicket is ERC721URIStorage, Ownable {
    using Address for address payable;

    uint256 private _tokenIds;

    // Track original prices (at mint)
    mapping(uint256 => uint256) public originalPrices;

    // Track resale listings: tokenId => resale price
    mapping(uint256 => uint256) public ticketListings;

    constructor(address initialOwner) ERC721("StandardTicket", "STKT") Ownable(initialOwner) {}

    /// @notice Mint a ticket with tokenURI and set original price
    function mintTicket(address recipient, string memory tokenURI, uint256 price) public onlyOwner returns (uint256) {
        uint256 newId = _tokenIds;
        _safeMint(recipient, newId);
        _setTokenURI(newId, tokenURI);
        originalPrices[newId] = price;
        _tokenIds++;
        return newId;
    }

    /// @notice List your ticket for resale
    function listForSale(uint256 tokenId, uint256 resalePrice) external {
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        require(resalePrice > 0, "Price must be positive");

        ticketListings[tokenId] = resalePrice;
    }

    /// @notice Buy a listed ticket
    function buyTicket(uint256 tokenId) external payable {
        uint256 price = ticketListings[tokenId];
        address seller = ownerOf(tokenId);

        require(price > 0, "Ticket not listed for sale");
        require(msg.value >= price, "Insufficient payment");

        // Remove listing
        ticketListings[tokenId] = 0;

        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);

        // Send funds to seller
        payable(seller).sendValue(price);

        // Refund excess
        if (msg.value > price) {
            payable(msg.sender).sendValue(msg.value - price);
        }
    }

    /// @notice Unlist a ticket
    function cancelListing(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        require(ticketListings[tokenId] > 0, "Ticket not listed");
        ticketListings[tokenId] = 0;
    }

    /// @notice Get resale price (0 if not listed)
    function getListingPrice(uint256 tokenId) external view returns (uint256) {
        return ticketListings[tokenId];
    }
}
