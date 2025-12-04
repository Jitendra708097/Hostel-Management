const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
    student: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User', 
       required: true,
      },
    startDate: { 
      type: Date, 
      required: true,
    },
    endDate: { 
      type: Date, 
      required: true 
    },
    reason: { 
      type: String, 
      required: true,
      minLength:10,
      maxLength:100
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    wardenComment: { 
      type: String,
      maxLength: 50
    },
    gatePass: {
        passId: { 
          type: String, 
          unique: true, 
          sparse: true 
        }, // sparse allows multiple null values
        generatedAt: { 
          type: Date 
        },
    },
    createdAt: { type: Date, default: Date.now },
});

const LeaveApplication = mongoose.model('LeaveApplication', leaveApplicationSchema);
module.exports = LeaveApplication;