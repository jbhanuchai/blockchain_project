// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DynamicTicket is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    mapping(uint256 => bool) private _used;

    constructor(address initialOwner) ERC721("DynamicTicket", "DYTK") Ownable(initialOwner) {}

    function mintTicket(address recipient, string memory tokenURI) public returns (uint256) {
        uint256 newId = _tokenIds;
        _safeMint(recipient, newId);
        _setTokenURI(newId, tokenURI);
        _tokenIds += 1;
        return newId;
    }

    function markAsUsed(uint256 tokenId) public {
        require(_existsSafe(tokenId), "Token does not exist");
        require(!_used[tokenId], "Ticket already used");
        _used[tokenId] = true;
    }

    function isUsed(uint256 tokenId) public view returns (bool) {
        require(_existsSafe(tokenId), "Token does not exist");
        return _used[tokenId];
    }

    function _existsSafe(uint256 tokenId) internal view returns (bool) {
        // Try-catch pattern to safely check if token exists
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }
}
