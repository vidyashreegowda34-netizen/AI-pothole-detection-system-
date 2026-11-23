const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/officer-login', authController.officerLogin);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
