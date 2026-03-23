const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/url_shortner';
  const isProduction = process.env.NODE_ENV === 'production';

  try {
    await mongoose.connect(uri, {
      autoIndex: !isProduction
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

