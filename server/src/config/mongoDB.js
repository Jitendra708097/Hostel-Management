const mongoose = require('mongoose');

// Function to connect to MongoDB using Mongoose
async function connectToDatabase() {
    
        await mongoose.connect(process.env.MONGODB_URL);
}

module.exports = connectToDatabase;