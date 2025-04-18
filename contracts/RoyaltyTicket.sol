// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RoyaltyTicket is ERC721URIStorage, ERC2981, Ownable {
    uint256 public nextTokenId;

    constructor() ERC721("RoyaltyTicket", "RLTKT") Ownable(msg.sender) {}

    function mintTicket(
        address to,
        string memory tokenURI,
        address royaltyReceiver,
        uint96 royaltyFeeInBips
    ) public onlyOwner {
        _safeMint(to, nextTokenId);
        _setTokenURI(nextTokenId, tokenURI);
        _setTokenRoyalty(nextTokenId, royaltyReceiver, royaltyFeeInBips); // 500 = 5%
        nextTokenId++;
    }

    // Required overrides for Solidity
    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721URIStorage, ERC2981)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}
