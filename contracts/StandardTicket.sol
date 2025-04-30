// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StandardTicket is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    constructor(address initialOwner) ERC721("StandardTicket", "STKT") Ownable(initialOwner) {}

    function mintTicket(address recipient, string memory tokenURI) public returns (uint256) {
        uint256 newId = _tokenIds;
        _safeMint(recipient, newId);
        _setTokenURI(newId, tokenURI);
        _tokenIds++;
        return newId;
    }
}
