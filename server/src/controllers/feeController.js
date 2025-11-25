const FeeStructure = require('../models/feeStructureModel');
const User = require('../models/User');
const Payment = require('../models/paymentModel');
const crypto = require('crypto');
const razorpay = require('../config/razorpay');

// This function allows an admin to define a new fee structure.
// It takes details like structureName and fee components from the request body.
const createFeeStructure = async (req, res) => {
    console.log("req.body: ",req.body);
    try {
        const { structureName, description, components } = req.body;

        // Basic validation
        if (!structureName || !components) {
            return res.status(400).json({ message: 'Structure name and components are required.' });
        }

        const newStructure = new FeeStructure({
            structureName,
            description,
            components,
        });
        
        console.log("new: ",newStructure);
        await newStructure.save();
        res.status(201).json({ message: 'Fee structure created successfully', data: newStructure });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetches a list of all available fee structures for the admin.
const getAllFeeStructures = async (req, res) => {
    
    try {
        const structures = await FeeStructure.find({});
        res.status(200).json({ data: structures });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// This function links a student to a specific fee structure.
// It also sets the student's initial totalDues based on the structure's total amount.
const assignFeeToStudent = async (req, res) => {
    
    try {
        const { studentId, feeStructureId } = req.body;

        const student = await User.findById({_id: studentId});
        const feeStructure = await FeeStructure.findById(feeStructureId);

        if (!student || !feeStructure) {
            return res.status(404).json({ message: 'Student or Fee Structure not found.' });
        }

        student.feeStructure = feeStructureId;
        student.totalDues = feeStructure.totalAmount; // Set initial dues
        await student.save();

        res.status(200).json({ message: 'Fee structure assigned successfully.', data: student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// This function is called by the student's client to initiate a payment.
// It creates an order on Razorpay's servers and returns the order_id.
const createRazorpayOrder = async (req, res) => {
   
    try {
        const { amount, currency = 'INR' } = req.body;

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required.' });
        }

        const options = {
            amount: amount * 100, // Amount in the smallest currency unit (paise for INR)
            currency,
            receipt: `receipt_order_${new Date().getTime()}`,
        };

        const order = await razorpay.orders.create(options);
        if (!order) {
            return res.status(500).json({ message: 'Error creating Razorpay order.' });
        }

        res.status(201).json({ order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// This is the most crucial step. After a student completes payment on the Razorpay UI,
// Razorpay sends back payment details. We must verify the signature to confirm authenticity.
const verifyPayment = async (req, res) => {
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId, amountPaid } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !studentId || !amountPaid) {
        return res.status(400).json({ message: "All payment verification fields are required."});
    }

    try {
        // 1. Construct the string to be hashed
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        // 2. Generate the expected signature using HMAC-SHA256
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');
        
        // 3. Compare the signatures
        if (expectedSignature === razorpay_signature) {
            // PAYMENT IS AUTHENTIC - Now, update the database
            
            // a. Find the student
            const student = await User.findById({ _id: studentId });
            if (!student) {
                return res.status(404).json({ message: 'Student not found.' });
            }

            // b. Create a new payment record
            const payment = new Payment({
                student: studentId,
                amount: amountPaid,
                razorpay: {
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature,
                },
                status: 'success',
            });
            await payment.save();
            
            // c. Update student's records
            student.paymentHistory.push(payment._id);
            student.totalDues -= amountPaid; // Reduce the dues by the amount paid
            await student.save();
            
            res.status(200).json({ status: 'success', message: 'Payment verified and recorded successfully.', paymentId: payment._id });

        } else {
            // PAYMENT IS FRAUDULENT
            res.status(400).json({ status: 'failure', message: 'Payment verification failed. Invalid signature.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// A reporting endpoint for the admin to see all transactions.
// It populates student details for a comprehensive view.
const getAllPayments = async (req, res) => {
    
    try {
        const payments = await Payment.find({}).populate('student', 'userName emailId');
        res.status(200).json({ data: payments });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetches a complete fee profile for a student, including their assigned
// fee structure and their entire payment history.
const getStudentFeeDetails = async (req, res) => {
    
    try {
        const { studentId } = req.params;
        const student = await User.findById({ _id: studentId }).populate('feeStructure').populate('paymentHistory');

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.status(200).json({ data: student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createFeeStructure, getAllFeeStructures, getAllPayments, getStudentFeeDetails, createRazorpayOrder, verifyPayment, assignFeeToStudent }