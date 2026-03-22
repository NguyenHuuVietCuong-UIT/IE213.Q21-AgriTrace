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

    event BatchMinted(
        uint tokenId,
        address owner,
        string ipfsHash
    );

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

    function getBatch(uint _tokenId) public view returns (
        string memory ipfsHash,
        address owner
    ) {
        Batch memory b = batches[_tokenId];
        return (b.ipfsHash, b.owner);
    }
}
