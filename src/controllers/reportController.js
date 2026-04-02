const mongoose = require('mongoose');
const Url = require('../models/Url');

const getMyReport = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    const now = new Date();
    const last7DaysStart = new Date(now);
    last7DaysStart.setDate(now.getDate() - 6);
    last7DaysStart.setHours(0, 0, 0, 0);

    const [summaryAgg, topUrls, recentUrls, hitsByDayAgg] = await Promise.all([
      Url.aggregate([
        { $match: { owner: ownerObjectId } },
        {
          $group: {
            _id: null,
            totalUrls: { $sum: 1 },
            totalHits: { $sum: '$hits' }
          }
        }
      ]),
      Url.find({ owner: ownerObjectId })
        .sort({ hits: -1, createdAt: -1 })
        .limit(5)
        .lean(),
      Url.find({ owner: ownerObjectId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Url.aggregate([
        { $match: { owner: ownerObjectId, createdAt: { $gte: last7DaysStart } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            urlsCreated: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const summary = summaryAgg?.[0] || { totalUrls: 0, totalHits: 0 };

    const hitsByDayMap = new Map(
      hitsByDayAgg.map((d) => [d._id, d.urlsCreated])
    );

    const urlsCreatedLast7Days = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(last7DaysStart);
      d.setDate(last7DaysStart.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      urlsCreatedLast7Days.push({
        date: key,
        urlsCreated: hitsByDayMap.get(key) || 0
      });
    }

    return res.json({
      message: 'Vendor report fetched successfully',
      data: {
        summary: {
          totalUrls: summary.totalUrls,
          totalHits: summary.totalHits
        },
        urlsCreatedLast7Days,
        topUrls: topUrls.map((u) => ({
          id: u._id,
          code: u.code,
          originalUrl: u.originalUrl,
          shortUrl: u.shortUrl,
          hits: u.hits,
          createdAt: u.createdAt
        })),
        recentUrls: recentUrls.map((u) => ({
          id: u._id,
          code: u.code,
          originalUrl: u.originalUrl,
          shortUrl: u.shortUrl,
          hits: u.hits,
          createdAt: u.createdAt
        }))
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch vendor report' });
  }
};

module.exports = { getMyReport };

