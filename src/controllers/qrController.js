const QRCode = require('qrcode');
const Url = require('../models/Url');
const { createShortUrlRecord } = require('../services/shortLinkService');
const { normalizeUrl } = require('../utils/urlNormalize');

const DEFAULT_WIDTH = 300;

const buildBaseUrl = (req) =>
  process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

const renderQrResponse = async (res, encodeUrl, normalizedUrl, format, extraJson = {}) => {
  const opts = { width: DEFAULT_WIDTH, margin: 2, errorCorrectionLevel: 'M' };
  if (format === 'json') {
    const qrDataUrl = await QRCode.toDataURL(encodeUrl, opts);
    return res.json({
      message: 'QR code generated successfully',
      data: {
        url: normalizedUrl,
        qrDataUrl,
        ...extraJson
      }
    });
  }
  const buffer = await QRCode.toBuffer(encodeUrl, { ...opts, type: 'png' });
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.send(buffer);
};

// Logged-in only (enforced on route): QR encodes the destination URL directly — scan opens target without hitting this service.
// POST body: { url }. Query: format=json | png (default).
const generateQrDirect = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'url is required' });
    }

    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl) {
      return res.status(400).json({
        message:
          'Invalid URL. Provide a valid URL like https://example.com or www.example.com'
      });
    }

    const format = String(req.query.format || 'png').toLowerCase();
    return renderQrResponse(res, normalizedUrl, normalizedUrl, format, {
      mode: 'direct',
      tracked: false
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to generate QR code' });
  }
};

// POST body: { url, track?: boolean } — track defaults true (creates short URL like /shorten, QR encodes shortUrl).
// track: false → encode target URL directly (no counting).
// Query: format=json → metadata + qrDataUrl; default → PNG.
const generateQr = async (req, res) => {
  try {
    const { url, track: trackRaw } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'url is required' });
    }

    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl) {
      return res.status(400).json({
        message:
          'Invalid URL. Provide a valid URL like https://example.com or www.example.com'
      });
    }

    const track = trackRaw !== false;
    if (!track && !req.user) {
      return res.status(401).json({
        message:
          'Authentication required. Encoding the destination URL directly in the QR is available after login (or use tracked QR without auth).'
      });
    }

    const format = String(req.query.format || 'png').toLowerCase();

    let encodeUrl = normalizedUrl;
    let trackMeta = null;

    if (track) {
      const baseUrl = buildBaseUrl(req);
      const doc = await createShortUrlRecord({
        baseUrl,
        normalizedUrl,
        ownerId: req.user ? req.user.id : null,
        fromQr: true
      });
      encodeUrl = doc.shortUrl;
      trackMeta = {
        id: doc._id,
        code: doc.code,
        originalUrl: doc.originalUrl,
        shortUrl: doc.shortUrl,
        hits: doc.hits
      };
    }

    if (trackMeta && format !== 'json') {
      res.setHeader('X-QR-Short-Code', trackMeta.code);
      res.setHeader('X-QR-Short-Url', trackMeta.shortUrl);
    }

    return renderQrResponse(res, encodeUrl, normalizedUrl, format, {
      tracked: track,
      ...(trackMeta || {})
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to generate QR code' });
  }
};

// Tracked QR stats: guest links (no owner) readable by code; owned links need matching JWT.
const getQrAnalytics = async (req, res) => {
  try {
    const { code } = req.params;
    const urlDoc = await Url.findOne({ code, fromQr: true }).lean();
    if (!urlDoc) {
      return res.status(404).json({ message: 'QR short link not found' });
    }

    if (urlDoc.owner) {
      if (!req.user || String(urlDoc.owner) !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    return res.json({
      message: 'QR analytics fetched successfully',
      data: {
        id: urlDoc._id,
        code: urlDoc.code,
        originalUrl: urlDoc.originalUrl,
        shortUrl: urlDoc.shortUrl,
        hits: urlDoc.hits,
        fromQr: urlDoc.fromQr !== false,
        owner: urlDoc.owner,
        createdAt: urlDoc.createdAt,
        updatedAt: urlDoc.updatedAt
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch QR analytics' });
  }
};

const getUserQrTracks = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      Url.find({ owner: req.user.id, fromQr: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Url.countDocuments({ owner: req.user.id, fromQr: true })
    ]);

    return res.json({
      message: 'QR short links fetched successfully',
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
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch QR short links' });
  }
};

module.exports = {
  generateQr,
  generateQrDirect,
  getQrAnalytics,
  getUserQrTracks
};
