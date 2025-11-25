const express = require('express');
const attendenceRouter = express.Router();
const { markAttendence, attendenceFinalSubmit, getStudentAttendenceRecords, getStudents } = require('../controllers/attendenceControllers');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');


// for admin only Routes
attendenceRouter.post('/mark',adminMiddleware,markAttendence);
attendenceRouter.post('/finalize',adminMiddleware,attendenceFinalSubmit);
attendenceRouter.get('/session',adminMiddleware,getStudents);


// for student only Routes
attendenceRouter.get('/get/:_id',userMiddleware,getStudentAttendenceRecords);

module.exports = attendenceRouter;