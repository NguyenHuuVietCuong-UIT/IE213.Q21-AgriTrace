// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BatchNFT {
    struct Batch {
        uint tokenId;
        string ipfsHash;
        address owner;
    }

    uint public nextTokenId = 1;
    mapping(uint => Batch) public batches;
    
    address public systemAdmin;

    event BatchMinted(uint tokenId, address owner, string ipfsHash);
    event BatchUpdated(uint tokenId, string newIpfsHash);

    constructor() {
        systemAdmin = msg.sender; 
    }

    function mintBatch(string memory _ipfsHash) public {
        uint tokenId = nextTokenId;
        batches[tokenId] = Batch({
            tokenId: tokenId,
            ipfsHash: _ipfsHash,
            owner: msg.sender
        });
        nextTokenId++;
        emit BatchMinted(tokenId, msg.sender, _ipfsHash);
    }

    function updateShipping(uint _tokenId, string memory _newIpfsHash) public {
        require(_tokenId > 0 && _tokenId < nextTokenId, "Token ID khong ton tai");
        require(msg.sender == systemAdmin, "Chi he thong moi duoc cap nhat van chuyen");
        emit BatchUpdated(_tokenId, _newIpfsHash);
    }
}