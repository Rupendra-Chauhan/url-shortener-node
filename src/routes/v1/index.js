const express = require('express');
const { auth } = require('../../middleware/auth');
const authRoutes = require('./auth');
const urlRoutes = require('./url');
const reportRoutes = require('./report');

const router = express.Router();

// Attach auth middleware so all v1 routes know about logged-in user (if any)
router.use(auth);

router.use('/auth', authRoutes);
router.use('/urls', urlRoutes);
router.use('/report', reportRoutes);

module.exports = router;

