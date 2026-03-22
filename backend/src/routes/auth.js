const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes cho Farmer (Web2)
router.post('/farmer/register', authController.registerFarmer);
router.post('/farmer/login', authController.loginFarmer);

// Routes cho Inspector (Web3)
router.post('/inspector/request-nonce', authController.requestNonce);
router.post('/inspector/verify', authController.verifyInspector);

module.exports = router;