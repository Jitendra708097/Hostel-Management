// models/Media.js
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    public_id: {
        type: String,
        required: true
    },
    secure_url: {
        type: String,
        required: true
    },
    asset_id: String,
    format: String,
    resource_type: String, // 'image' or 'video'
    uploadedBy: { // Optional: if you link media to users
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    caption: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Media =  mongoose.model('Media', mediaSchema);
module.exports = Media;