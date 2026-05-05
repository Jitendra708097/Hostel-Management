const mongoose = require('mongoose');

const roomAllocationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    bedLabel: {
        type: String,
        trim: true,
        default: '',
    },
    status: {
        type: String,
        enum: ['active', 'vacated', 'cancelled'],
        default: 'active',
    },
    source: {
        type: String,
        enum: ['manual', 'admission', 'transfer'],
        default: 'manual',
    },
    reason: {
        type: String,
        trim: true,
        default: '',
    },
    allocatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    allocatedAt: {
        type: Date,
        default: Date.now,
    },
    vacatedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

roomAllocationSchema.index({ studentId: 1, status: 1 });
roomAllocationSchema.index({ roomId: 1, status: 1 });

const RoomAllocation = mongoose.model('RoomAllocation', roomAllocationSchema);
module.exports = RoomAllocation;
