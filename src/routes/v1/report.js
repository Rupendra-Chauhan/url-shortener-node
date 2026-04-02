const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { getMyReport } = require('../../controllers/reportController');

const router = express.Router();

// Vendor dashboard report (scoped to logged-in user)
router.get('/me', requireAuth, getMyReport);

module.exports = router;

