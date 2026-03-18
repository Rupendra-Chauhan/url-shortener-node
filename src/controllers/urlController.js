const Url = require('../models/Url');

const generateCode = (length = 8) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * chars.length);
    result += chars[index];
  }
  return result;
};

const normalizeUrl = (input) => {
  const value = String(input || '').trim();
  if (!value) return null;

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const parsed = new URL(withProtocol);
    if (!/^https?:$/i.test(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
};

// Create a new short URL. Public: no authentication required.
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

    const code = generateCode(8);
    const shortUrl = `${baseUrl}/${code}`;

    const url = await Url.create({
      code,
      originalUrl: normalizedOriginalUrl,
      shortUrl
    });

    return res.status(201).json({
      message: 'URL shortened successfully',
      data: {
        id: url._id,
        code: url.code,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        hits: url.hits
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to shorten URL' });
  }
};

// Public analytics endpoint: anyone with the code can see hit count.
const getUrlAnalytics = async (req, res) => {
  try {
    const { code } = req.params;
    const url = await Url.findOne({ code });
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    return res.json({
      message: 'URL analytics fetched successfully',
      data: {
        id: url._id,
        code: url.code,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        hits: url.hits,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch URL analytics' });
  }
};

module.exports = {
  createShortUrl,
  getUrlAnalytics
};

