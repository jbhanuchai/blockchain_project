// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract SoulboundTicket is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("SoulboundTicket", "SBT") Ownable(msg.sender) {}

    /// @notice Mint a soulbound ticket to an address
    function mint(address to, string memory tokenURI) public onlyOwner {
        uint256 tokenId = _nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _nextTokenId++;
    }

    /// @notice Burn (invalidate) a soulbound ticket after event
    function burn(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
    }

    /// @dev Prevent all transfers (except mint and burn)
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Soulbound: transfers disabled");
        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override(ERC721, IERC721) {
    revert("Soulbound: approval not allowed");
}

function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
    revert("Soulbound: operator approval not allowed");
}

function getApproved(uint256) public pure override(ERC721, IERC721) returns (address) {
    return address(0);
}

function isApprovedForAll(address, address) public pure override(ERC721, IERC721) returns (bool) {
    return false;
}

}
