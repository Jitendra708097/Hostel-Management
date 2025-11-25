const mongoose = require('mongoose');

const rulesSchema = new mongoose.Schema({
    rule: {
        type: String,
        required: true
    }
});

const Rules = mongoose.model('Rules', rulesSchema);
module.exports = Rules;

