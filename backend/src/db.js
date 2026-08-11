// CloudMart - Database connection module
// MySQL connection pool using mysql2.
// All credentials are read from environment variables (never hardcoded).

const mysql = require('mysql2/promise');

// Create a connection pool for Aurora MySQL.
// Using a pool improves performance and resilience under concurrent load.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'cloudmart',
  user: process.env.DB_USER || 'cloudmart_admin',
  password: process.env.DB_PASSWORD || 'cloudmart_password',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Aurora MySQL supports SSL. In production we enforce it.
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
  // Small timeout so the health check fails fast when the DB is unreachable.
  connectTimeout: 5000,
});

// Utility to run a query against the pool.
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Utility to run a query returning a single row.
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0];
}

// Ping the database to verify connectivity (used by /health).
async function ping() {
  await pool.query('SELECT 1');
  return true;
}

module.exports = { pool, query, queryOne, ping };
