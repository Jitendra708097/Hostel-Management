
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true,
    },
    text: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 100
    },
    authorName: { // To display name on frontend without another DB query
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30
    },
    role: {
        type: String,
        enum: ['student', 'warden'],
        required: true
    }
}, { timestamps: true });


const grievanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the student who filed the grievance
        required: true,
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Maintenance', 'Mess/Food Quality', 'Cleanliness', 'Security', 'Inter-student Conflict', 'Staff Issues', 'Other'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a detailed description'],
        minLength: 5,
        maxLength: 150
    },
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    attachments: [{
        public_id: String,
        url: String,
    }],
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Resolved'],
        default: 'Pending',
    },
    comments: [commentSchema],
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
});

const Grievance = mongoose.model('Grievance', grievanceSchema);
module.exports = Grievance;