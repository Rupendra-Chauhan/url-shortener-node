const Url = require('../models/Url');
const { normalizeUrl } = require('../utils/urlNormalize');
const { createShortUrlRecord } = require('../services/shortLinkService');

// Create a new short URL. Public with guest rate limit; optional JWT sets owner.
const createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    if (!originalUrl) {
      return res.status(400).json({ message: 'originalUrl is required' });
    }

    const normalizedOriginalUrl = normalizeUrl(originalUrl);
    if (!normalizedOriginalUrl) {
      return res.status(400).json({
        message:
          'Invalid URL. Provide a valid URL like https://example.com or www.example.com'
      });
    }

    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    const url = await createShortUrlRecord({
      baseUrl,
      normalizedUrl: normalizedOriginalUrl,
      ownerId: req.user ? req.user.id : null,
      fromQr: false
    });

    return res.status(201).json({
      message: 'URL shortened successfully',
      data: {
        id: url._id,
        code: url.code,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        hits: url.hits,
        fromQr: url.fromQr
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to shorten URL' });
  }
};

// Guest links (no owner): public by code. Owned links: Bearer must match owner.
const getUrlAnalytics = async (req, res) => {
  try {
    const { code } = req.params;
    const url = await Url.findOne({ code }).lean();
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    if (url.owner) {
      if (!req.user || String(url.owner) !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    return res.json({
      message: 'URL analytics fetched successfully',
      data: {
        id: url._id,
        code: url.code,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        hits: url.hits,
        fromQr: url.fromQr,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch URL analytics' });
  }
};

const getUserUrls = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      Url.find({ owner: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Url.countDocuments({ owner: req.user.id })
    ]);

    return res.json({
      message: 'User URLs fetched successfully',
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1)
      },
      data: urls.map((u) => ({
        id: u._id,
        code: u.code,
        originalUrl: u.originalUrl,
        shortUrl: u.shortUrl,
        hits: u.hits,
        fromQr: u.fromQr,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch URLs' });
  }
};

module.exports = {
  createShortUrl,
  getUrlAnalytics,
  getUserUrls
};
