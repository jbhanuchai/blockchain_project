// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC721Ticket is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    constructor(address initialOwner) ERC721("EventTicket", "ETK") Ownable(initialOwner) {}

    function mintTicket(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 newId = _tokenIds;
        _safeMint(recipient, newId);
        _setTokenURI(newId, tokenURI);
        _tokenIds += 1;
        return newId;
    }
}
