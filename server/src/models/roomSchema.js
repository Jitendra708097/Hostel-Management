const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    hostelType: {
        type: String,
        enum: ['boys', 'girls'],
        required: true,
    },
    block: {
        type: String,
        required: true,
        trim: true,
    },
    floor: {
        type: Number,
        required: true,
        min: 0,
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
    },
    roomType: {
        type: String,
        enum: ['single', 'double', 'triple'],
        required: true,
    },
    occupiedCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    status: {
        type: String,
        enum: ['available', 'partial', 'full', 'maintenance', 'inactive'],
        default: 'available',
    },
    facilities: [{
        type: String,
        trim: true,
    }],
    notes: {
        type: String,
        trim: true,
        default: '',
    },
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
