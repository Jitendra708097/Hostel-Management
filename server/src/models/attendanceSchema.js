// This is the correct and recommended schema for Attendance
const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({

    date: {
        type: Date,
        required: true,
        unique: true
    },
    isFinalized: { 
        type: Boolean, 
        default: false 
    },
    students: [{
        _id: false,
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
    timestamps: true
});

attendanceRecordSchema.index({ student: 1, date: 1 }, { unique: true });

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
module.exports = AttendanceRecord;
