const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0
});

const connectRedis = async () => {
  try {
    await client.connect();
    console.log('✅ Connected to Redis');
    
    client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
    
    client.on('connect', () => {
      console.log('🔄 Redis client connected');
    });
    
    client.on('ready', () => {
      console.log('🚀 Redis client ready');
    });
    
    client.on('end', () => {
      console.log('🔌 Redis connection closed');
    });
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
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

// Additional helper functions for your analytics use case
const get = async (key) => {
  try {
    return await client.get(key);
  } catch (error) {
    console.error('Error getting key:', error);
    throw error;
  }
};

const set = async (key, value, expireInSeconds = null) => {
  try {
    if (expireInSeconds) {
      await client.setEx(key, expireInSeconds, value);
    } else {
      await client.set(key, value);
    }
  } catch (error) {
    console.error('Error setting key:', error);
    throw error;
  }
};

const setEx = async (key, expireInSeconds, value) => {
  try {
    await client.setEx(key, expireInSeconds, value);
  } catch (error) {
    console.error('Error setting key with expiry:', error);
    throw error;
  }
};

const del = async (key) => {
  try {
    await client.del(key);
  } catch (error) {
    console.error('Error deleting key:', error);
    throw error;
  }
};

// Graceful shutdown
const closeRedis = async () => {
  try {
    await client.quit();
    console.log('🔌 Redis connection closed gracefully');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
};

process.on('SIGINT', async () => {
  await closeRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeRedis();
  process.exit(0);
});

module.exports = {
  connectRedis,
  client,
  setSession,
  getSession,
  deleteSession,
  get,
  set,
  setEx,
  del,
  closeRedis
};