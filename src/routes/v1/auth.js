const express = require('express');
const { requestOtp, verifyOtp, updateProfile } = require('../../controllers/authController');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.put('/profile', requireAuth, updateProfile);

module.exports = router;

