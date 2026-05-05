const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        min: 3,
        max: 25
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    year: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    course: {
        type: String,
        required: true
    },
    institution: {
        type: String,
        required: true,
        enum: ['HRIT', 'Virohan', 'Other']
    },
    roomPreference: {
        type: String,
        enum: ['single', 'double', 'triple'],
        default: 'double'
    },
    role: {
        type: String,
        enum: ['admin', 'student'],
        default: 'student'
    },
    profileURL: {
        type: String,
        default: 'https://i.pinimg.com/736x/98/1d/6b/981d6b2e0ccb5e968a0618c8d47671da.jpg'
    },
    roomNo: {
        type: String,
        trim: true,
        default: null
    },
    currentRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        default: null
    },
    currentAllocationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoomAllocation',
        default: null
    },
    phoneNo: {
        type: Number,
        required: true,
        unique: true,
        min: 1000000000,
        max: 9999999999
    },
    public_id: {
        type: String
    },
    feeStructure: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'FeeStructure' 
    },
    totalDues: { 
        type: Number, 
        default: 0 
    },
    // A history of payments made
    paymentHistory: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Payment' 
    }]
    
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
