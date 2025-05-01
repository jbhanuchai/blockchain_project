// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DynamicTicket is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    mapping(uint256 => bool) public used;

    constructor(address initialOwner) ERC721("DynamicTicket", "DTKT") Ownable(initialOwner) {}

    function mintTicket(address recipient, string memory tokenURI) external onlyOwner returns (uint256) {
        uint256 newId = _tokenIds;
        _safeMint(recipient, newId);
        _setTokenURI(newId, tokenURI);
        _tokenIds++;
        return newId;
    }

    function updateMetadata(uint256 tokenId, string memory newURI) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _setTokenURI(tokenId, newURI);
    }

    function markAsUsed(uint256 tokenId, string memory usedURI) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!used[tokenId], "Already marked used");
        used[tokenId] = true;
        _setTokenURI(tokenId, usedURI);
    }

    function isUsed(uint256 tokenId) external view returns (bool) {
        return used[tokenId];
    }
}
