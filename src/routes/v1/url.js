const express = require('express');
const { createGuestDailyCreateLimiter } = require('../../middleware/guestRateLimit');
const { requireAuth } = require('../../middleware/auth');
const { createShortUrl, getUrlAnalytics, getUserUrls } = require('../../controllers/urlController');

const router = express.Router();
const createShortUrlLimiter = createGuestDailyCreateLimiter();

// Public: anyone can shorten URLs (with daily limit)
router.post('/shorten', createShortUrlLimiter, createShortUrl);

// Logged-in only: list my URLs
router.get('/', requireAuth, getUserUrls);

// Logged-in only: get analytics for my short code
router.get('/:code', requireAuth, getUrlAnalytics);

module.exports = router;

