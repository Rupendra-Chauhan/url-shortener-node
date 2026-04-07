const express = require('express');
const { getMyReport } = require('../../controllers/reportController');

const router = express.Router();

router.get('/me', getMyReport);

module.exports = router;
