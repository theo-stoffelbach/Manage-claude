const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

/**
 * Initialize database schema
 * Reads and executes schema.sql to create tables if they don't exist
 */
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database schema...');

    const schemaPath = path.join(__dirname, '../../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
    throw error;
  }
}

module.exports = {
  pool,
  initializeDatabase
};
