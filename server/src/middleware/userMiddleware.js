const User = require('../models/User');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const userMiddleware = async (req, res, next) => {

    console.log('User middleware invoked');
    try {
        const { token } = req.cookies;
        console.log('Token from cookies:', req.cookies);
        if (!token) {
            throw new Error('Authentication token is missing');
        }

        const payload = jwt.verify(token,process.env.JWT_SECRET_KEY);
        if (!payload) {
            throw new Error('Invalid authentication token');
        }
        console.log(payload);

        const { _id } = payload;
        if (!_id) {
            throw new Error('Invalid token payload');
        }

        const user = await User.findById(_id).select('-password');
        if (!user) {
            throw new Error('User not found');
        }

        const isBlacklisted = await redisClient.exists(`token:$${token}`);
        if (isBlacklisted) {
            throw new Error('Token has been blacklisted');
        }

        req.user = user;
        console.log('req.user', req.user);
        next();
    } catch (error) {
        res.status(401).json({ message: error.message });
    } 

};

module.exports = userMiddleware;