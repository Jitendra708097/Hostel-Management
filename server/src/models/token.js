const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User', // This creates a reference to your User model
        unique: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600, // This document will be automatically deleted after 1 hour (3600 seconds)
    },
});

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;