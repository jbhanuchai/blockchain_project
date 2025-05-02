// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract RoyaltyTicket is ERC721URIStorage, ERC2981, Ownable {
    using Address for address payable;

    uint256 private _tokenIds;

    mapping(uint256 => uint256) public originalPrices;
    mapping(uint256 => uint256) public ticketListings;
    mapping(uint256 => uint256) public maxResalePrices;

    constructor(
        address initialOwner,
        address royaltyReceiver,
        uint96 royaltyBps // e.g., 1000 = 10%
    ) ERC721("RoyaltyTicket", "RTKT") Ownable(initialOwner) {
        _setDefaultRoyalty(royaltyReceiver, royaltyBps);
    }

    /// @notice Mint a ticket with metadata, price, and max allowed resale price
    function mintTicket(
        address to,
        string memory uri,
        uint256 price,
        uint256 maxResalePrice
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIds;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        originalPrices[tokenId] = price;
        maxResalePrices[tokenId] = maxResalePrice;
        _tokenIds++;
        return tokenId;
    }

    /// @notice List ticket for resale (must be below maxResalePrice)
    function listForSale(uint256 tokenId, uint256 resalePrice) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(resalePrice > 0, "Price must be > 0");
        require(resalePrice <= maxResalePrices[tokenId], "Exceeds max resale price");

        ticketListings[tokenId] = resalePrice;
    }

    /// @notice Buy a listed ticket (royalty deducted)
    function buyTicket(uint256 tokenId) external payable {
        uint256 price = ticketListings[tokenId];
        address seller = ownerOf(tokenId);
        require(price > 0, "Not listed");
        require(msg.value >= price, "Insufficient payment");

        ticketListings[tokenId] = 0;

        (address royaltyReceiver, uint256 royaltyAmount) = royaltyInfo(tokenId, price);
        uint256 sellerAmount = price - royaltyAmount;

        _transfer(seller, msg.sender, tokenId);

        if (royaltyAmount > 0) {
            payable(royaltyReceiver).sendValue(royaltyAmount);
        }
        payable(seller).sendValue(sellerAmount);

        // Refund excess
        if (msg.value > price) {
            payable(msg.sender).sendValue(msg.value - price);
        }
    }

    /// @notice Cancel active listing
    function cancelListing(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        ticketListings[tokenId] = 0;
    }

    /// @inheritdoc IERC165
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    function totalSupply() public view returns (uint256) {
    return _tokenIds;
}
}
