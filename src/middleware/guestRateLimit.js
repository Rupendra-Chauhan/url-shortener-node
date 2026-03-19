const rateLimit = require('express-rate-limit');

// Guests (no valid JWT): max 5 creations per IP per 24 hours.
// Logged-in users are not limited by this middleware.
const createGuestDailyCreateLimiter = () =>
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => !!req.user, // skip if logged-in user
    message: {
      message: 'Daily guest limit reached. Please log in to continue.'
    }
  });

module.exports = { createGuestDailyCreateLimiter };

