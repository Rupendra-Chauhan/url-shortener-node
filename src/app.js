const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const v1Routes = require('./routes/v1');

const app = express();

app.use(cors());
app.use(express.json());
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

