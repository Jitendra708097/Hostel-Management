const express = require('express');
const userRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { register, login, userPasswordChange, getAllUsers, getProfile, deleteUserById, logout, updateDetails, forgotPassword, resetPassword, adminLogin, getAllStudents, adminCreateStudent } = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');



//  for student 
userRouter.post('/register',upload.single('profilePhoto'), register); // self registration disabled
userRouter.post('/login', login); 
userRouter.post('/logout',userMiddleware, logout); 
userRouter.put('/update/:_id', userMiddleware, upload.single('profilePhoto'), updateDetails);
userRouter.put('/change-password/:_id',userMiddleware,userPasswordChange);
userRouter.post('/forgot-password', forgotPassword); 
userRouter.post('/reset-password/:token/:userId', resetPassword);
userRouter.get('/check', userMiddleware, (req, res) => {

    console.log('Backend Authentication check for user:', req.user);
    res.status(200).json({ 
        message: 'User is authenticated', 
        user: {emailId:req.user.emailId, 
            userName:req.user.userName, 
            _id:req.user._id, 
            profileURL: req.user.profileURL,
            roomNo: req.user.roomNo,
            roomPreference: req.user.roomPreference,
            currentRoomId: req.user.currentRoomId,
            phoneNo: req.user.phoneNo,
            course: req.user.course,
            institution: req.user.institution,
            year: req.user.year,
            role:req.user.role} 
    });
}
); // Check authentication status

//  for admin 
userRouter.post('/admin/login', adminLogin); // Admin login
userRouter.post('/admin/create-student', adminMiddleware, upload.single('profilePhoto'), adminCreateStudent);
userRouter.delete('/delete/:_id', adminMiddleware, deleteUserById); 
userRouter.get('/getAllStudents', adminMiddleware, getAllStudents);
userRouter.put('/admin/update/:_id', adminMiddleware, upload.single('profilePhoto'), updateDetails);
userRouter.get('/:_id', userMiddleware, getProfile); // Get user by ID
userRouter.get('/',adminMiddleware, getAllUsers); // Get all users


module.exports = userRouter;
