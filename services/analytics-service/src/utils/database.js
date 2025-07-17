const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const connectDB = async () => {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL database');

    // Set up error handling
    pool.on('error', (err) => {
      console.error('❌ Database connection error:', err);
    });

  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
};

const getDB = () => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return pool;
};

const closeDB = async () => {
  if (pool) {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await closeDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  getDB,
  closeDB,
  pool
};