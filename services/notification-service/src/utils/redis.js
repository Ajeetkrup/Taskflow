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

client.connect();

module.exports = client;