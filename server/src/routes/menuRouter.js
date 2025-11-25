const express = require('express');
const {getMenu, addMenu, updateMenu, fetchMenuOfSelectedDay} = require('../controllers/editMenu');
const menuRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Routes for student only
menuRouter.get('/show',getMenu);
menuRouter.get('/fetch/:day',fetchMenuOfSelectedDay);

// Routes for admin only 
menuRouter.post('/add',adminMiddleware,addMenu);
menuRouter.put('/update',adminMiddleware,updateMenu);

module.exports = menuRouter;