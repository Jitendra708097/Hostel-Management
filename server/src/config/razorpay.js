const Razorpay = require('razorpay');

// Configure Razorpay instance with environment variables for security
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;