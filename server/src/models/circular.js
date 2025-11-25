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
    uploadDate: {
        type: String,
        required: true,
        default: new Date()
    }

});


const Circular =  mongoose.model('Circular', circularSchema);
module.exports = Circular;