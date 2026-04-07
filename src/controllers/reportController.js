// Product decision: dashboard reporting is not exposed to API consumers.
const getMyReport = async (req, res) =>
  res.status(403).json({ message: 'Reports are not available.' });

module.exports = { getMyReport };
