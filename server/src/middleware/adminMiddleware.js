const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const User = require('../models/UserSchema');

const adminMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            res.status(401).json('Authentication token is missing');
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!payload) {
            res.status(401).json('Invalid authentication token');
        }
        const { _id } = payload;
        if (!_id) {
            res.status(401).json('Invalid token payload');
        }
        if(payload.role !== 'admin'){
            res.status(401).json('Access denied. Admins only.');
        }
        const user = await User.findById(_id).select('-password');
        if (!user) {
            res.status(401).json('User not found');
        }
        const isBlacklisted = await redisClient.exists(`token:$${token}`);
        if (isBlacklisted) {
            res.status(401).json('Token has been blacklisted');
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message:`Error: ${error.message}` });
    }  
};
module.exports = adminMiddleware;