// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DynamicTicket is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    constructor() ERC721("DynamicTicket", "DYNTKT") Ownable(msg.sender) {}

    function mintTicket(address to, string memory uri) public onlyOwner {
        _safeMint(to, nextTokenId);
        _setTokenURI(nextTokenId, uri);
        nextTokenId++;
    }

    function markAsUsed(uint256 tokenId, string memory newURI) public onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        _setTokenURI(tokenId, newURI);
    }

    // supportsInterface is automatically handled by ERC721URIStorage in OZ v5
}
