// routes/mediaRoutes.js
const express = require('express');
const circularRouter = express.Router();
const upload = require('../middleware/upload'); // Your Multer middleware
const { uploadCircular, getAllCirculars, getCircularById, deleteCircularById, updateCircularById } = require('../controllers/circularControllers');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');


// for students 
circularRouter.get('/:_id',userMiddleware, getCircularById);  //get media by id function from controller
circularRouter.get('/',userMiddleware, getAllCirculars);  //get all media function from controller

// for admin 
circularRouter.post('/upload', adminMiddleware, upload.single('circular'), uploadCircular); //upload media function from controller
circularRouter.get('/',adminMiddleware, getAllCirculars);  //get all media function from controller
circularRouter.delete('/delete/:_id',adminMiddleware, deleteCircularById);  //delete media by id function from controller
circularRouter.put('/update/:_id', adminMiddleware, upload.single('FileList.File'), updateCircularById);    //update media by id function from controller (accept file)


module.exports = circularRouter;