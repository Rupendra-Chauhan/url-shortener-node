const rateLimit = require('express-rate-limit');

// Limit each IP to 5 URL creations per 24 hours
const createShortUrlLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Daily limit reached. You can create up to 5 short URLs per day.'
  }
});

module.exports = { createShortUrlLimiter };

