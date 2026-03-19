const express = require('express');
const { requestOtp, verifyOtp, updateProfile } = require('../../controllers/authController');

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.put('/profile', updateProfile);

module.exports = router;

