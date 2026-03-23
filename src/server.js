require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { handleRedirect } = require('./controllers/redirectController');

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Missing required env var: JWT_SECRET');
  process.exit(1);
}

// Public redirect endpoint (no versioning) - GET /:code
app.get('/:code', handleRedirect);

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

