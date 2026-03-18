require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { handleRedirect } = require('./controllers/redirectController');

const PORT = process.env.PORT || 4000;

// Public redirect endpoint (no versioning) - GET /:code
app.get('/:code', handleRedirect);

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

start();

