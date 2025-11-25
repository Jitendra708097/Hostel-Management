const Grievance = require('../models/grievance');
const bufferToStream = require('../utils/bufferToStream');
const cloudinary = require('../config/cloudinary');

// It is a student function which initiates the grievance and 
// submitted if any document then it will store on cloudinary. 
const grievanceSubmitted = async (req, res) => {
    try {
        const { category, description, isAnonymous } = req.body;
        const studentId = req.params._id; // from isAuthenticated middleware

        if (!category || !description) {
            return res.status(400).json({ success: false, message: 'Category and description are required.' });
        }

        // Upload to Cloudinary
        if(req.file) {
            const fileBuffer = req.file.buffer;
            // console.log("fileBuffer: ",fileBuffer);
            const fileStream = bufferToStream(fileBuffer);
            // console.log("file: ",fileStream);
            const uploadOptions = {
            folder: 'Hostel_Management/grievance', // Optional: Folder in Cloudinary
            resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'auto', // Auto-detect or specify
            // Add any other Cloudinary upload options here
            // e.g., quality: 'auto:low', eager: [{ width: 400, height: 300, crop: 'pad' }]
            };

            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) return reject(error);
                    resolve(result);
                    }); 
                    fileStream.pipe(uploadStream);
                });

                attachments = { public_id: result.public_id, url: result.secure_url }
        }
        else {
                attachments = [];
            }
        

        // const attachments = req.files ? req.files.map(file => ({ public_id: file.filename, url: file.path })) : [];

        const grievance = await Grievance.create({
            studentId,
            category,
            description,
            isAnonymous: isAnonymous === 'true',
            attachments,
        });

        res.status(201).json({ success: true, message: 'Grievance submitted successfully.', data: grievance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};


// In this component student can see thier all 
// grievance which they have submitted in past i.e. grievance history 
const getMyGrievances = async (req, res) => {
    console.log("getMyGrievance0: ",req.params._id);
    try {
        const grievances = await Grievance.find({ studentId: req.params._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: grievances });
        console.log("grievance: ",grievances);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};


// Student can view thier specific grievance by grievance ID
const getGrievanceById = async (req, res) => {
    try {
        const grievance = await Grievance.findById(req.params._id);

        if (!grievance) {
            return res.status(404).json({ success: false, message: 'Grievance not found.' });
        }
        
        // Ensure student can only view their own grievance
        if (grievance.studentId.toString() !== req.params._id) {
             return res.status(403).json({ success: false, message: 'You are not authorized to view this grievance.' });
        }

        res.status(200).json({ success: true, data: grievance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};


// this component for admin side which can see all
// grievance who submitted by Students with their name,course,year
const getAllGrievances = async (req, res) => {
    try {
        // Populating studentId to get student details, but excluding sensitive info if needed
        const grievances = await Grievance.find().populate('studentId', 'userName year course').sort({ createdAt: -1 });
        console.log("Hii: ",grievances);
        res.status(200).json({ success: true, data: grievances });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};


// this component for admin they can view specific 
// grievance for information about grievance i.e. grievanceDetails
const getGrievanceDetails = async (req, res) => {
    try {
        console.log("Hello 1")
        const grievance = await Grievance.findById({ _id:req.params._id }).populate('studentId', 'userName emailId year');
        if (!grievance) {
            return res.status(404).json({ success: false, message: 'Grievance not found.' });
        }
        res.status(200).json({ success: true, data: grievance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

 // Update the status of a grievance (Approve/Reject/Resolve) By admin or warden sir
const updateGrievanceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Approved', 'Rejected', 'Resolved'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status provided.' });
        }

        const grievance = await Grievance.findByIdAndUpdate(
            req.params._id,
            { status },
            { new: true, runValidators: true }
        );

        if (!grievance) {
            return res.status(404).json({ success: false, message: 'Grievance not found.' });
        }
        res.status(200).json({ success: true, message: `Grievance status updated to ${status}.`, data: grievance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Add a comment to a grievance By admin for conversation to student
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
        }

        const grievance = await Grievance.findById(req.params._id);
        if (!grievance) {
            return res.status(404).json({ success: false, message: 'Grievance not found.' });
        }

        console.log("Hello ji");
        console.log("user: ",req.user);
        const newComment = {
            author: req.params._id,  //req.user._id,
            authorName: "Jitendra Surendra",  // req.user.userName,
            role: "student",       //req.user.role,
            text: text,
        };

        console.log("Hello ji1");
        grievance.comments.push(newComment);
        await grievance.save();
        
        console.log("Hello ji2");

        res.status(201).json({ success: true, message: 'Comment added.', data: grievance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = { grievanceSubmitted, getMyGrievances, getGrievanceById, getAllGrievances, getGrievanceDetails, updateGrievanceStatus, addComment };