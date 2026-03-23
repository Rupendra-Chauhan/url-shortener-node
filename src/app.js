const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const v1Routes = require('./routes/v1');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin:
      allowedOrigins.length > 0
        ? (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
          }
        : true
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API versioning
app.use('/api/v1', v1Routes);

// Fallback 404 for API
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

module.exports = app;

