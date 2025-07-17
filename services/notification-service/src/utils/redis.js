const redis = require('redis');
const logger = require('./logger');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

client.on('connect', () => {
  logger.info('Connected to Redis');
});

client.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

// Function to connect to Redis
async function connectRedis() {
  try {
    await client.connect();
    logger.info('Redis connection established');
    return client;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

module.exports = {
  client,
  connectRedis
};