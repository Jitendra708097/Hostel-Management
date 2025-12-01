const express = require('express');
const userRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { register, login, getAllUsers, getProfile, deleteUserById, logout, updateDetails, forgotPassword, resetPassword, adminLogin, getAllStudents } = require('../controllers/userController');
const upload = require('../middleware/upload');
const adminMiddleware = require('../middleware/adminMiddleware');



//  for student 
userRouter.post('/register',upload.single('profilePhoto'), register); // done
userRouter.post('/login', login); 
userRouter.post('/logout',userMiddleware, logout); 
userRouter.put('/update/:_id', userMiddleware, updateDetails);
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
            phoneNo: req.user.phoneNo,
            role:req.user.role} 
    });
}
); // Check authentication status

//  for admin 
userRouter.post('/admin/login', adminLogin); // Admin login
userRouter.delete('/delete/:_id', adminMiddleware, deleteUserById); 
userRouter.get('/getAllStudents', adminMiddleware, getAllStudents);
userRouter.get('/:_id', getProfile); // Get user by ID
userRouter.get('/',userMiddleware, getAllUsers); // Get all users


module.exports = userRouter;