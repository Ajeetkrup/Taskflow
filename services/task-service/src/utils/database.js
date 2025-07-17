const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'taskflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

const createTablesIfNotExists = async () => {
  const createTasksTable = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      priority VARCHAR(20) DEFAULT 'medium',
      status VARCHAR(20) DEFAULT 'pending',
      due_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(createTasksTable);
    console.log('Tasks table created or already exists');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database');
    
    // Create tables after successful connection
    await createTablesIfNotExists();
    
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

module.exports = { pool, connectDB };