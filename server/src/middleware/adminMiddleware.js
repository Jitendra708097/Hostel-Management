const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const User = require('../models/UserSchema');

const adminMiddleware = async (req, res, next) => {
    console.log("Admin middleware is invoked.");
    // console.log(req.cookies);
    try {
        const { token } = req.cookies;
        // console.log("token: ",token);
        if (!token) {
            console.log("Error0");
            res.status(401).json('Authentication token is missing');
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        // console.log("payload: ",payload);
        if (!payload) {
            console.log("Error1");
            res.status(401).json('Invalid authentication token');
        }
        // console.log("payload: ",payload);
        const { _id } = payload;
        if (!_id) {
            console.log("Error2");
            res.status(401).json('Invalid token payload');
        }
        if(payload.role !== 'admin'){
            console.log("Error3");
            res.status(401).json('Access denied. Admins only.');
        }
        const user = await User.findById(_id).select('-password');
        // console.log("user: ",user);
        if (!user) {
            console.log("Error4");
            res.status(401).json('User not found');
        }
        const isBlacklisted = await redisClient.exists(`token:$${token}`);
        if (isBlacklisted) {
            console.log("Error5");
            res.status(401).json('Token has been blacklisted');
        }
        req.user = user;
        // console("User: ",user);
        next();
    } catch (error) {
        res.status(401).json({ message:`Error: ${error.message}` });
    }  
    console.log("Done") 
};
module.exports = adminMiddleware;