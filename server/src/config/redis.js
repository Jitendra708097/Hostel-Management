const redis = require('redis');


// Create and configure Redis client using environment variables for security
// Ensure you have REDIS_NAME, REDIS_PASSWORD, REDIS_HOST, and REDIS_PORT set in your environment variables
const redisClient = redis.createClient({
    username: process.env.REDIS_NAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

module.exports = redisClient;