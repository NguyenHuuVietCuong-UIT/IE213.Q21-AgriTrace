const express = require('express');
const { ethers } = require('ethers');
const Batch = require('../models/Batch');

const router = express.Router();

router.get('/batches/:id', async (req, res) => {
  const { id } = req.params;
  const batch = await Batch.findById(id).populate('farmer', 'phone');
  if (!batch) return res.status(404).json({ message: 'Not found' });

  res.json({
    id: batch._id,
    cropType: batch.cropType,
    name: batch.name,
    estimatedQuantity: batch.estimatedQuantity,
    status: batch.status,
    logs: batch.logs,
    ipfsLink: batch.ipfsLink,
    tokenId: batch.tokenId,
    txHash: batch.txHash,
    farmerPhone: batch.farmer?.phone,
    createdAt: batch.createdAt
  });
});

router.get('/batches/:id/verify-blockchain', async (req, res) => {
  const { id } = req.params;
  const batch = await Batch.findById(id);
  if (!batch) return res.status(404).json({ message: 'Not found' });
  if (batch.status !== 'MINTED') return res.status(400).json({ message: 'Batch has not been minted yet' });

  const rpcUrl = process.env.ETH_RPC_URL;
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  if (!rpcUrl || !contractAddress) {
    return res.status(500).json({ message: 'Blockchain verification environment is missing' });
  }

  const abi = ['function tokenURI(uint256 tokenId) view returns (string)'];

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const onChainUri = await contract.tokenURI(BigInt(batch.tokenId));
    const matched = onChainUri === batch.ipfsLink;

    return res.json({
      batchId: batch._id,
      tokenId: batch.tokenId,
      txHash: batch.txHash,
      dbIpfsLink: batch.ipfsLink,
      onChainUri,
      matched
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to verify on-chain data', error: err.message });
  }
});

module.exports = router;
