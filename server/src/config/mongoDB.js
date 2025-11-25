const mongoose = require('mongoose');

async function connectToDatabase() {
    
        await mongoose.connect(process.env.MONGODB_URL)
}

module.exports = connectToDatabase;