// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulboundTicket is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    constructor(address initialOwner) ERC721("SoulboundTicket", "SBTKT") Ownable(initialOwner) {}

    function mintTicket(address to, string memory tokenURI) public {
        _safeMint(to, nextTokenId);
        _setTokenURI(nextTokenId, tokenURI);
        nextTokenId++;
    }

    // Use new OZ v5 token transfer hook to prevent transfers
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        require(from == address(0), "Soulbound: tokens cannot be transferred");
        return from;
    }
}
