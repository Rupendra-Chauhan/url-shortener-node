const express = require('express');
const { createShortUrlLimiter } = require('../../middleware/rateLimitDailyCreate');
const { createShortUrl, getUrlAnalytics } = require('../../controllers/urlController');

const router = express.Router();

// Public: anyone can shorten URLs (with daily limit)
router.post('/shorten', createShortUrlLimiter, createShortUrl);

// Public: get analytics for a given short code (hits, timestamps, etc.)
router.get('/:code', getUrlAnalytics);

module.exports = router;

