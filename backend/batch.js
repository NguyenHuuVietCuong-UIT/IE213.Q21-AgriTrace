const express = require('express');
const { ethers } = require('ethers');
const { verifyToken, requireRole } = require('../middleware/auth');
const Batch = require('../models/Batch');
const { pinJsonToIPFS } = require('../utils/ipfs');

const router = express.Router();

router.get('/mine', verifyToken, requireRole('FARMER'), async (req, res) => {
  const batches = await Batch.find({ farmer: req.user._id }).sort({ createdAt: -1 });
  res.json(batches);
});

router.post('/', verifyToken, requireRole('FARMER'), async (req, res) => {
  const { cropType, name, estimatedQuantity } = req.body;
  if (!cropType || !name || !estimatedQuantity) return res.status(400).json({ message: 'Missing fields' });

  const batch = await Batch.create({
    farmer: req.user._id,
    cropType,
    name,
    estimatedQuantity
  });

  res.status(201).json(batch);
});

router.post('/:batchId/logs', verifyToken, requireRole('FARMER'), async (req, res) => {
  const { batchId } = req.params;
  const { activity, notes, imageUrl } = req.body;
  if (!activity) return res.status(400).json({ message: 'activity required' });

  const batch = await Batch.findOne({ _id: batchId, farmer: req.user._id });
  if (!batch) return res.status(404).json({ message: 'Batch not found' });
  if (batch.status !== 'PENDING') return res.status(400).json({ message: 'Cannot update this batch' });

  batch.logs.push({ activity, notes, imageUrl });
  await batch.save();

  res.json(batch);
});

router.post('/:batchId/complete', verifyToken, requireRole('FARMER'), async (req, res) => {
  const { batchId } = req.params;

  const batch = await Batch.findOne({ _id: batchId, farmer: req.user._id });
  if (!batch) return res.status(404).json({ message: 'Batch not found' });
  if (batch.status !== 'PENDING') return res.status(400).json({ message: 'Batch already completed or minted' });

  batch.status = 'LOCKED';
  await batch.save();

  res.json(batch);
});

router.get('/pending', verifyToken, requireRole('INSPECTOR'), async (req, res) => {
  const batches = await Batch.find({ status: 'LOCKED' }).populate('farmer', 'phone');
  res.json(batches);
});

router.get('/:batchId', verifyToken, async (req, res) => {
  const { batchId } = req.params;
  const batch = await Batch.findById(batchId).populate('farmer', 'phone');
  if (!batch) return res.status(404).json({ message: 'Batch not found' });

  if (req.user.role === 'FARMER' && batch.farmer._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(batch);
});

router.post('/:batchId/pin', verifyToken, requireRole('INSPECTOR'), async (req, res) => {
  const { batchId } = req.params;

  const batch = await Batch.findById(batchId).populate('farmer', 'phone');
  if (!batch || batch.status !== 'LOCKED') return res.status(404).json({ message: 'Batch not available' });

  const data = {
    batchId: batch._id,
    cropType: batch.cropType,
    name: batch.name,
    estimatedQuantity: batch.estimatedQuantity,
    logs: batch.logs,
    farmerPhone: batch.farmer.phone,
    createdAt: batch.createdAt
  };

  try {
    const pinResult = await pinJsonToIPFS({ pinataContent: data });
    batch.ipfsLink = `ipfs://${pinResult.IpfsHash}`;
    await batch.save();
    return res.json({ success: true, ipfsLink: batch.ipfsLink, pinResult });
  } catch (err) {
    return res.status(500).json({ message: 'IPFS pin failed', error: err.message });
  }
});

router.post('/:batchId/mint', verifyToken, requireRole('INSPECTOR'), async (req, res) => {
  const { batchId } = req.params;
  const { tokenId, txHash } = req.body;

  const batch = await Batch.findById(batchId);
  if (!batch || batch.status !== 'LOCKED') return res.status(404).json({ message: 'Batch not available for minting' });

  if (!batch.ipfsLink) return res.status(400).json({ message: 'Batch has no IPFS link yet' });
  if (!tokenId || !txHash) return res.status(400).json({ message: 'tokenId and txHash required' });
  if (!ethers.isHexString(txHash) || txHash.length !== 66) return res.status(400).json({ message: 'Invalid txHash format' });

  batch.status = 'MINTED';
  batch.tokenId = tokenId;
  batch.txHash = txHash;
  await batch.save();

  res.json(batch);
});

module.exports = router;
