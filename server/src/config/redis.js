const redis = require('redis');

const redisClient = redis.createClient({
    username: process.env.REDIS_NAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

module.exports = redisClient;