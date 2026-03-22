const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/User');

const router = express.Router();

function getJwt(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function makeNonce() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Farmer registration (for demo; can remove in production)
router.post('/farmer/register', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ message: 'phone and password required' });

  const existing = await User.findOne({ phone });
  if (existing) return res.status(400).json({ message: 'Phone already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const farmer = await User.create({ phone, passwordHash: hashed, role: 'FARMER' });
  return res.status(201).json({ user: { id: farmer._id, phone: farmer.phone, role: 'FARMER' } });
});

router.post('/farmer/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ message: 'phone and password required' });

  const user = await User.findOne({ phone, role: 'FARMER' });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = getJwt(user);
  res.json({ token, user: { id: user._id, phone: user.phone, role: user.role } });
});

router.post('/inspector/request-nonce', async (req, res) => {
  const { walletAddress } = req.body;
  if (!walletAddress) return res.status(400).json({ message: 'walletAddress required' });
  if (!ethers.isAddress(walletAddress)) return res.status(400).json({ message: 'Invalid walletAddress format' });

  const address = walletAddress.toLowerCase();
  const inspector = await User.findOne({ walletAddress: address, role: 'INSPECTOR' });
  if (!inspector) return res.status(404).json({ message: 'Inspector wallet is not registered' });

  inspector.nonce = makeNonce();
  await inspector.save();

  return res.json({ nonce: inspector.nonce });
});

router.post('/inspector/verify', async (req, res) => {
  const { walletAddress, signature } = req.body;
  if (!walletAddress || !signature) return res.status(400).json({ message: 'walletAddress and signature required' });
  if (!ethers.isAddress(walletAddress)) return res.status(400).json({ message: 'Invalid walletAddress format' });

  const address = walletAddress.toLowerCase();
  const inspector = await User.findOne({ walletAddress: address, role: 'INSPECTOR' });
  if (!inspector) return res.status(401).json({ message: 'Inspector not found' });

  const message = `AgriTrace login nonce: ${inspector.nonce}`;
  try {
    const signer = ethers.verifyMessage(message, signature);
    if (signer.toLowerCase() !== address) {
      return res.status(401).json({ message: 'Signature verification failed' });
    }
  } catch (err) {
    return res.status(401).json({ message: 'Signature verification failed', error: err.message });
  }

  inspector.nonce = makeNonce();
  await inspector.save();

  const token = getJwt(inspector);
  return res.json({ token, user: { id: inspector._id, walletAddress: inspector.walletAddress, role: inspector.role } });
});

module.exports = router;
