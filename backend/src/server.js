  // CloudMart Backend API
  // Node.js + Express REST API backed by Aurora MySQL.
  require('dotenv').config();

  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const morgan = require('morgan');

  const { ping } = require('./db');
  const { initDatabase } = require('./routes/schema');
  const registerRoutes = require('./routes');

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('combined'));

  // Register all API routes
  registerRoutes(app);

  // Root endpoint - API info
  app.get('/', (req, res) => {
    res.json({
      name: 'CloudMart Backend API',
      version: '2.0.0',
      database: 'Aurora MySQL',
      endpoints: [
        '/health',
        '/api/products',
        '/api/products/:id',
        '/api/products/search?q=',
        '/api/products/featured',
        '/api/products/latest',
        '/api/categories',
        '/api/orders',
        '/api/upload',
      ],
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  // Start server
  app.listen(PORT, async () => {
    console.log(`CloudMart backend running on port ${PORT}`);
    try {
      await initDatabase();
      await ping();
      console.log('Aurora MySQL connectivity verified');
    } catch (err) {
      console.error('Database initialization failed:', err.message);
    }
  });
