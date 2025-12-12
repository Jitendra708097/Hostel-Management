const bcrypt = require('bcrypt');
const validatorFunction = require('../utils/validator');
const User = require('../models/UserSchema');
const Token = require('../models/tokenSchema');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const bufferToStream = require('../utils/bufferToStream');
const cloudinary = require('../config/cloudinary');

// This function is for new user registration on this platform with
// personal information like: useName,course,year,emailID,profilePhoto
const register = async (req, res) => {

        const isValid = await validatorFunction(req.body);
        if (!isValid.valid)
        { 
            res.status(400).json({ message: isValid.message });
            return;
       }

        const { password } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        req.body.password = hashedPassword;

        req.body.role = 'student'; // Default role assignment

    if(req.file) {
        // Upload to Cloudinary
        const fileBuffer = req.file.buffer;
        const fileStream = bufferToStream(fileBuffer);
        const uploadOptions = {
            folder: 'Hostel_Management/profileImages', // Optional: Folder in Cloudinary
            resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'auto', // Auto-detect or specify
        };
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }); 
            fileStream.pipe(uploadStream);
        });
        req.body.profileURL = result.secure_url,
        req.body.public_id = result.public_id
    }

        const newUser = await User.create(req.body);
    
        const reply = {
            profileURL: newUser.profileURL,
            emailId: newUser.emailId,
            userName: newUser.userName,
            role: newUser.role,
            _id: newUser._id,
            course: newUser.course,
            institution: newUser.institution,
            year: newUser.year,
            subject: "Registration Successful",
            message: `Dear ${newUser.userName},\n\nYour registration was successful!\n\nThank you for joining us.\n\nBest regards,\nHostel Management Team`
        };

        const token = jwt.sign(
            { _id: newUser._id, emailId: newUser.emailId, role: newUser.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: 60*60 }
        );

        res.cookie('token', token, { maxAge: 60*60*1000}); // 1 hour
        
        res.status(200).json({user: reply, message: "User registered successfully!"});
}

// this component user will view profile information with profile picture by passing their _id.
const getProfile = async (req, res) => {
    const _id = req.params._id;
    if (!_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    // console.log("Fetching profile for user ID:", _id); // Debugging line

    const user = await User.findById(_id).select('-password');
    res.status(200).json({ message: 'User profile retrieved successfully!', user });
}


// fetch all existing users on this platform from Database.
const getAllUsers = async (req, res) => {
    // Logic to get all users here
    const users = await User.find().select('-password');
    res.status(200).json({ message: 'All users retrieved successfully!', users });
}

// deleteUser by ID from database
const deleteUserById = async (req, res) => {
    // User deletion logic here
    const _id = req.params._id;
    if (!_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // delete user image from cloudinary
    const user = await User.findById(_id);
    if (user && user.public_id) {
        await cloudinary.uploader.destroy(user.public_id);
    }

    await User.findByIdAndDelete(_id);
    res.status(200).json({ message: 'User deleted successfully!' });
}

// login user on this platform by their credentials emailId, password.
const login = async (req, res) => {

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ emailId: email });
    if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }
    // Successful login
    console.log("User logged in:", user);
    const reply = {
        emailId: user.emailId,
        userName: user.userName,
        role: user.role,
        profileURL: user.profileURL,
        _id: user._id,
        course: user.course
    };
    const token =  jwt.sign(
        { _id: user._id, emailId: user.emailId, role: user.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: 60*60 }
    );
    // console.log("Generated JWT Token:", token); // Debugging line
    const token123 = res.cookie('token', token, { maxAge: 60*60*1000}); // 1 hour    
    // console.log('token123',token123);
    res.status(200).json({ message: 'User logged in successfully!', user: reply });
    // console.log("relpy",reply);
}

// user can logout from this platform via this route
const logout = async (req, res) => {
    // Logout logic here (if any)
    try {

       const { token } = req.cookies;
       const payload = jwt.decode(token);

       await redisClient.set(`token:${token}`, 'blacklisted');
       await redisClient.expireAt(`token:${token}`, payload.exp);

       res.cookie('token', null, { expireAt: new Date(Date.now()) });

    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
    res.status(200).json({ message: 'User logged out successfully!' });
}

// update user details
const updateDetails = async (req, res) => {
    // User update logic here
    try {
        const _id = req.params._id;
        if (!_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const updatedData = req.body;
        const updatedUser = await User.findByIdAndUpdate(_id, updatedData, { new: true }).select('-password');
        res.status(200).json({ message: 'User details updated successfully!', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }   
}

// forgotPassword 
const forgotPassword = async (req, res) => {
    try {
        // 1. Find the user by email
        const user = await User.findOne({ emailId: req.body.email });
        if (!user) {
            // To prevent email enumeration, send a generic success message
            return res.status(200).send("If a user with that email exists, a password reset link has been sent.");
        }
        console.log("user: debugging ",user);

        // 2. Find and delete any existing token for this user
        let token = await Token.findOne({ userId: user._id });
        console.log("token: debugging ",token);
        if (token) {
            await Token.findOneAndDelete({ _id: token._id });
        }

        console.log("user: ",user);
        // 3. Generate a new secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        console.log("resettoken: ",resetToken);
        // 4. Create and save the new token in the database
        await new Token({
            userId: user._id,
            token: resetToken,
        }).save();

        // 5. Construct the password reset link for the frontend
        const link = `${process.env.CLIENT_URL}/reset-password/${resetToken}/${user._id}`;
        
        // 6. Send the email
        await sendEmail({
            emailId: user.emailId,
            subject: "Password Reset Request",
            message: `To reset your password, please click the following link: \n\n${link}`
        });

        res.status(200).send("Password reset link sent to your email account.");

    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred on the server.");
    }
}

// Reset Password function 
const resetPassword = async (req, res) => {
    try {
        console.log("Reset Password invoked with params:", req.params);
        console.log("Request body:", req.body);
        const { newPassword } = req.body;
        
        // 1. Find the user and the token
        const user = await User.findById({_id: req.params.userId});
        if (!user) {
            return res.status(400).send("Invalid link or user does not exist.");
        }

        console.log("Found user:", user);
        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });

        if (!token) {
            return res.status(400).send("Invalid link or token has expired.");
        }

        console.log("Found valid token:", token);
        // 2. Hash the new password
        const password = newPassword;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Update the user's password
        user.password = hashedPassword;
        await user.save();

        // 4. Delete the token so it cannot be used again
        await token.deleteOne();

        res.status(200).send("Password has been reset successfully.");
        console.log("Password reset successful for user:", user.emailId);

    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred on the server.");
    }
}

// admin login on this platform 
const adminLogin = async (req, res) => {

    console.log("Admin Login page invoked.");
    console.log(req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ emailId: email });
    if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }
    if(user.role !== 'admin'){
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }
    // Successful login
    const reply = {
        emailId: user.emailId,
        userName: user.userName,
        role: user.role,
        profileURL: user.profileURL,
        _id: user._id
    };
    const token = jwt.sign(
        { _id: user._id, emailId: user.emailId, role: user.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: 60*60 }
    );
    
    res.cookie('token', token, { maxAge: 60*60*1000}); // 1 hour    
    res.status(200).json({ message: 'Admin logged in successfully!', user: reply });
}  


const getAllStudents = async (req, res) => {
    try {
        // Populate the feeStructure and paymentHistory fields
        const students = await User.find({})
            .populate('feeStructure', 'structureName totalAmount')
            .populate({ path: 'paymentHistory', select: 'amount status createdAt' });

        // Compute totals for each student
        const transformed = students.map((s) => {
            const payments = Array.isArray(s.paymentHistory) ? s.paymentHistory : [];
            // Sum only successful payments
            const totalPaid = payments.reduce((sum, p) => sum + (p.status === 'success' ? Number(p.amount || 0) : 0), 0);
            const feeAmount = s.feeStructure?.totalAmount ?? 0;
            const due = Math.max(0, feeAmount - totalPaid);
            return {
                _id: s._id,
                userName: s.userName,
                emailId: s.emailId,
                profileURL: s.profileURL,
                year: s.year || null,
                feeStructure: s.feeStructure || null,
                totalPaid,
                due,
            };
        });

        res.status(200).json({ data: transformed });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const userPasswordChange = async (req,res) => {
    const _id = req.params._id;
    if(!_id)
    {
        res.status(400).json({ error: "User Id is required." });
    }

    const { newPassword, oldPassword } = req.body;
    if(!newPassword)
    {
        res.status(400).json({ error: "Please Enter New Password." });
    }

    else if(!oldPassword)
    {
        res.status(400).json({ error: "Please Enter New Password." });
    }

    const user = await User.findById(_id);
    const isPasswordValid = await bcrypt.compare( oldPassword, user.password);
    if(!isPasswordValid)
    {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const hashCodeOfNewPassword = await bcrypt.hash(newPassword,10);
    user.password = hashCodeOfNewPassword;
    await user.save();

    res.status(200).json({ message: "Password Changed Successfully."});
}

module.exports = {
    register, 
    getProfile,
    getAllUsers, 
    deleteUserById, 
    login, 
    logout, 
    updateDetails, 
    forgotPassword, resetPassword, adminLogin, getAllStudents, userPasswordChange};