const Url = require('../models/Url');

const handleRedirect = async (req, res) => {
  try {
    const { code } = req.params;
    const url = await Url.findOneAndUpdate(
      { code },
      { $inc: { hits: 1 } },
      { new: true }
    );
    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to redirect' });
  }
};

module.exports = { handleRedirect };

