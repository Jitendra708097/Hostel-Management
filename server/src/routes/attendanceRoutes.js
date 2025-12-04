const express = require('express');
const attendanceRouter = express.Router();
const { markAttendence, attendenceFinalSubmit, getStudentAttendenceRecords, getStudents } = require('../controllers/attendanceControllers');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');


// for admin only Routes
attendanceRouter.post('/mark',adminMiddleware,markAttendence);
attendanceRouter.post('/finalize',adminMiddleware,attendenceFinalSubmit);
attendanceRouter.get('/session',adminMiddleware,getStudents);


// for student only Routes
attendanceRouter.get('/get/:_id',userMiddleware,getStudentAttendenceRecords);

module.exports = attendanceRouter;
