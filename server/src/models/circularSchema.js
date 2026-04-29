// models/Media.js
const mongoose = require('mongoose');

const circularSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 25
    },
    description: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 100
    },
    public_id: {
        type: String,
        required: true
    },
    circularURL: {
        type: String,
        required: true
    },
    mimeType: {
        type: String
    },
    resourceType: {
        type: String,
        enum: ['image', 'video', 'raw'],
        default: 'image'
    },
    uploadDate: {
        type: Date,
        required: true,
        default: Date.now
    }

});


const Circular =  mongoose.model('Circular', circularSchema);
module.exports = Circular;
