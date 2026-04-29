const User = require('../models/UserSchema');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const userMiddleware = async (req, res, next) => {

    try {
        const { token } = req.cookies;
        if (!token) {
            throw new Error('Authentication token is missing');
        }

        const payload = jwt.verify(token,process.env.JWT_SECRET_KEY);
        if (!payload) {
            throw new Error('Invalid authentication token');
        }

        const { _id } = payload;
        if (!_id) {
            throw new Error('Invalid token payload');
        }

        const user = await User.findById(_id).select('-password');
        if (!user) {
            throw new Error('User not found');
        }

        const isBlacklisted = await redisClient.exists(`token:${token}`);
        if (isBlacklisted) {
            throw new Error('Token has been blacklisted');
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: error.message });
    } 

};

module.exports = userMiddleware;
