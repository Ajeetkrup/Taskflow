const redis = require('redis');

// Updated Redis client configuration for newer versions
const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB) || 0
});

const connectRedis = async () => {
  try {
    // Set up event listeners before connecting
    client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    client.on('connect', () => {
      console.log('Redis client connected');
    });

    client.on('ready', () => {
      console.log('Redis client ready');
    });

    client.on('end', () => {
      console.log('Redis client disconnected');
    });

    await client.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Redis connection failed:', error);
    throw error;
  }
};

// Helper functions for session management
const setSession = async (key, value, expireInSeconds = 3600) => {
  try {
    await client.setEx(key, expireInSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting session:', error);
    throw error;
  }
};

const getSession = async (key) => {
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting session:', error);
    throw error;
  }
};

const deleteSession = async (key) => {
  try {
    await client.del(key);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

module.exports = {
  connectRedis,
  client,
  setSession,
  getSession,
  deleteSession
};