const express = require('express');
const { createGuestDailyCreateLimiter } = require('../../middleware/guestRateLimit');
const { requireAuth } = require('../../middleware/auth');
const { createShortUrl, getUrlAnalytics, getUserUrls } = require('../../controllers/urlController');
const {
  generateQr,
  generateQrDirect,
  getQrAnalytics,
  getUserQrTracks
} = require('../../controllers/qrController');

const router = express.Router();
const guestShortenLimiter = createGuestDailyCreateLimiter();
const guestQrLimiter = createGuestDailyCreateLimiter();

router.post('/shorten', guestShortenLimiter, createShortUrl);

router.post('/qr/direct', requireAuth, generateQrDirect);

router.post('/qr', guestQrLimiter, generateQr);

router.get('/qr/list', requireAuth, getUserQrTracks);

router.get('/qr/:code', getQrAnalytics);

router.get('/', requireAuth, getUserUrls);

router.get('/:code', getUrlAnalytics);

module.exports = router;
