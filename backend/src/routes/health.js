// CloudMart - Health check route
// Verifies application uptime and Aurora MySQL connectivity.

const express = require('express');
const { ping } = require('../db');

const router = express.Router();

// GET /health
router.get('/', async (req, res) => {
  try {
    await ping();
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Health check failed - DB unreachable:', err.message);
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
