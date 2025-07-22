const { Pool } = require('pg');
const logger = require('./logger');

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

pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL connection error:', err);
});

// Function to create tables if they don't exist
async function createTables() {
  try {
    // Create notifications table
    const notificationsTable = `
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        task_id INTEGER,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create notification_preferences table
    const notificationPreferencesTable = `
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL,
        email_enabled BOOLEAN DEFAULT TRUE,
        due_date_reminder BOOLEAN DEFAULT TRUE,
        reminder_minutes INTEGER DEFAULT 60,
        daily_summary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create indexes for better performance
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);
    `;

    await pool.query(notificationsTable);
    await pool.query(notificationPreferencesTable);
    await pool.query(createIndexes);
    
    logger.info('Database tables created/verified successfully');
  } catch (error) {
    logger.error('Error creating database tables:', error);
    throw error;
  }
}

// Function to connect to database and create tables
async function connectDB() {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    logger.info('Database connection established');
    
    // Create tables if they don't exist
    await createTables();
    
    return pool;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

// Export both pool and connectDB function
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  connectDB
};