// This is the correct and recommended schema for Attendance
const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({

    date: {
        type: Date,
        required: true,
        // When saving, make sure to set time to 00:00:00 UTC for consistent daily records
        // e.g., new Date(new Date().setHours(0,0,0,0))
        unique: true
    },
    isFinalized: { 
        type: Boolean, 
        default: false 
    },
    students: [{
        _id: false, // there is no need to store id for every sub document
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        status:{
            type: String,
            require:true,
            enum:['present','absent']
        },
        timestamp:{
            type:Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// IMPORTANT: Ensures a student can only have ONE attendance record per day
attendanceRecordSchema.index({ student: 1, date: 1 }, { unique: true });

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
module.exports = AttendanceRecord;