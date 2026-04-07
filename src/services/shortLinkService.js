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

const createShortUrlRecord = async ({
  baseUrl,
  normalizedUrl,
  ownerId,
  fromQr = false,
  maxAttempts = 10
}) => {
  for (let i = 0; i < maxAttempts; i += 1) {
    const code = generateCode(8);
    const shortUrl = `${baseUrl}/${code}`;
    try {
      return await Url.create({
        code,
        originalUrl: normalizedUrl,
        shortUrl,
        owner: ownerId || null,
        fromQr
      });
    } catch (err) {
      if (err && err.code === 11000) continue;
      throw err;
    }
  }
  throw new Error('Could not allocate unique short code');
};

module.exports = {
  generateCode,
  createShortUrlRecord
};
