const Url = require('../models/Url');

const handleRedirect = async (req, res) => {
  try {
    const { code } = req.params;
    console.log(`Redirecting code: ${code}`);
    const url = await Url.findOne({ code });
    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    url.hits += 1;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to redirect' });
  }
};

module.exports = { handleRedirect };

