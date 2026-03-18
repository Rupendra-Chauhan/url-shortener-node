const express = require('express');
const urlRoutes = require('./url');

const router = express.Router();

// v1 URL routes (no authentication in this simplified demo)
router.use('/urls', urlRoutes);

module.exports = router;

