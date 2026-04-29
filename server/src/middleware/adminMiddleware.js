const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const User = require('../models/UserSchema');

const adminMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ message: 'Authentication token is missing' });
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!payload) {
            return res.status(401).json({ message: 'Invalid authentication token' });
        }
        const { _id } = payload;
        if (!_id) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }
        if(payload.role !== 'admin'){
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        const user = await User.findById(_id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const isBlacklisted = await redisClient.exists(`token:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Token has been blacklisted' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message:`Error: ${error.message}` });
    }  
};
module.exports = adminMiddleware;
