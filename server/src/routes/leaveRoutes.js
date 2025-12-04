const express = require('express');
const leaveRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { leaveRequestByStudent, viewLeaveStatus, viewAllLeaveApplicationsByWarden, updateLeaveStatusByWarden } = require('../controllers/leaveController');

// for student only Routes
leaveRouter.post('/request/:_id',userMiddleware,leaveRequestByStudent);
leaveRouter.get('/check/:_id',userMiddleware,viewLeaveStatus);

// for admin only Routes
leaveRouter.get('/viewStatus',adminMiddleware,viewAllLeaveApplicationsByWarden);
leaveRouter.put('/updateStatus/:_id',adminMiddleware,updateLeaveStatusByWarden);


module.exports = leaveRouter;