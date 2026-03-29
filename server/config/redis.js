import { createClient } from 'redis';

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',

      socket: {
        tls: process.env.REDIS_URL?.startsWith('rediss://'), // ✅ required for Upstash

        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.log('❌ Too many Redis retries. Giving up.');
            return false; // stop retrying
          }
          return Math.min(retries * 200, 3000); // exponential backoff
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('🔌 Connecting to Redis...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis ready');
    });

    redisClient.on('end', () => {
      console.log('⚠️ Redis connection closed');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);

    // ❌ DO NOT crash app in production
    return null;
  }
};

const getRedisClient = () => {
  return redisClient; // no crash
};

export { connectRedis, getRedisClient };