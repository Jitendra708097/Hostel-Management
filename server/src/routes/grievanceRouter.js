const express = require('express');
const grievanceRouter = express.Router();
const upload = require('../middleware/uploadMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
const { grievanceSubmitted, getAllGrievances, getGrievanceById, updateGrievanceStatus, addComment, getGrievanceDetails, getMyGrievances } = require('../controllers/grievanceControllers');
const adminMiddleware = require('../middleware/adminMiddleware');


// for student
grievanceRouter.post('/submit/:_id',userMiddleware,upload.single('file'),grievanceSubmitted);
grievanceRouter.get('/getById/:_id',userMiddleware,getGrievanceById);
grievanceRouter.get('/get/:_id',userMiddleware,getMyGrievances);

// for admin
grievanceRouter.get('/fetch',adminMiddleware,getAllGrievances);
grievanceRouter.get('/details/:_id',adminMiddleware,getGrievanceDetails);
grievanceRouter.put('/:_id/status',adminMiddleware,updateGrievanceStatus);
grievanceRouter.post('/:_id/comment',addComment);

module.exports = grievanceRouter;