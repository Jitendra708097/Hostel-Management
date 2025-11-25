const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    razorpay: {
        orderId: String,
        paymentId: String,
        signature: String,
    },
    status: { 
        type: String, 
        enum: ['success', 'failure', 'pending'], 
        default: 'pending' 
    },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;