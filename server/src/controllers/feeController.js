const FeeStructure = require('../models/feeStructureSchema');
const User = require('../models/UserSchema');
const Payment = require('../models/paymentSchema');
const crypto = require('crypto');
const razorpay = require('../config/razorpay');

// This function allows an admin to define a new fee structure.
// It takes details like structureName and fee components from the request body.
const createFeeStructure = async (req, res) => {
    try {
        const { structureName, description, components } = req.body;

        // Basic validation
        if (!structureName || !components) {
            return res.status(400).json({ message: 'Structure name and components are required.' });
        }

        const normalizedComponents = {
            admissionFee: Number(components.admissionFee || 0),
            securityDeposit: Number(components.securityDeposit || 0),
            hostelFee: Number(components.hostelFee || 0),
        };

        if (
            !Number.isFinite(normalizedComponents.admissionFee) ||
            !Number.isFinite(normalizedComponents.securityDeposit) ||
            !Number.isFinite(normalizedComponents.hostelFee)
        ) {
            return res.status(400).json({ message: 'Fee components must be valid numbers.' });
        }

        if (normalizedComponents.admissionFee < 0 || normalizedComponents.securityDeposit < 0 || normalizedComponents.hostelFee <= 0) {
            return res.status(400).json({ message: 'Fees cannot be negative, and hostel fee must be greater than zero.' });
        }

        const newStructure = new FeeStructure({
            structureName: structureName.trim(),
            description,
            components: normalizedComponents,
        });
        
        await newStructure.save();
        res.status(201).json({ message: 'Fee structure created successfully', data: newStructure });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A fee structure with this name already exists.' });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// this component will delete existing fee structure from database.
const deleteFeeStructure = async(req,res) => {
    const _id = req.params;
    if(!_id) {
       return res.status(400).json({ message: "Fee Structure Id is required "});
    }

    try {
        const feeStructure = await FeeStructure.findOneAndDelete(_id);
        res.status(200).json({message: "This Fee Structure deleted Successfully from DB.", data:feeStructure});
    } catch (err) {
        res.status(500).json({ message: "server Error", error: err.message});
    }
}

// this is for updation of existing fee structures.
const updateFeeStructure = async (req, res) => {
    const { _id } = req.params;
    
    if (!_id) {
        return res.status(400).json({ message: "ID is required for update." });
    }
    
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Please provide values to update." });
    }
    
    try {
        const updateData = { ...req.body };
        if (updateData.structureName) {
            updateData.structureName = updateData.structureName.trim();
        }

        if (updateData.components) {
            const normalizedComponents = {
                admissionFee: Number(updateData.components.admissionFee || 0),
                securityDeposit: Number(updateData.components.securityDeposit || 0),
                hostelFee: Number(updateData.components.hostelFee || 0),
            };

            if (
                !Number.isFinite(normalizedComponents.admissionFee) ||
                !Number.isFinite(normalizedComponents.securityDeposit) ||
                !Number.isFinite(normalizedComponents.hostelFee)
            ) {
                return res.status(400).json({ message: 'Fee components must be valid numbers.' });
            }

            if (normalizedComponents.admissionFee < 0 || normalizedComponents.securityDeposit < 0 || normalizedComponents.hostelFee <= 0) {
                return res.status(400).json({ message: 'Fees cannot be negative, and hostel fee must be greater than zero.' });
            }

            updateData.components = normalizedComponents;
            updateData.totalAmount = normalizedComponents.admissionFee + normalizedComponents.securityDeposit + normalizedComponents.hostelFee;
        }

        const updatedFeeStructure = await FeeStructure.findByIdAndUpdate(
            _id,
            updateData,
            {
                new: true,  // it will returns updated data
                runValidators: true  //Ensures updates validate against schema
            }
        );
        
        if (!updatedFeeStructure) {
            return res.status(404).json({ message: "Fee structure not found." });
        }
        
        res.status(200).json({ 
            message: "Details updated successfully", 
            data: updatedFeeStructure 
        });
        
    } catch (error) {
        console.error("Update error:", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation error", 
                error: error.message 
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                message: "Invalid ID format" 
            });
        }
        
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message 
        });
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

        const payments = await Payment.find({ student: student._id, status: 'success' }).select('amount');
        const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

        student.feeStructure = feeStructureId;
        student.totalDues = Math.max(0, Number(feeStructure.totalAmount || 0) - totalPaid);
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
        const student = await User.findById(req.user._id).select('totalDues');

        const paymentAmount = Number(amount);
        if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
            return res.status(400).json({ message: 'Enter a valid payment amount.' });
        }

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        if (paymentAmount > Number(student.totalDues || 0)) {
            return res.status(400).json({ message: 'Payment amount cannot be greater than current dues.' });
        }

        const options = {
            amount: paymentAmount * 100, // Amount in the smallest currency unit (paise for INR)
            currency,
            receipt: `receipt_order_${new Date().getTime()}`,
        };

        const order = await razorpay.orders.create(options);
        if (!order) {
            return res.status(500).json({ message: 'Error creating Razorpay order.' });
        }

        await Payment.create({
            student: req.user._id,
            amount: paymentAmount,
            razorpay: {
                orderId: order.id,
            },
            status: 'pending',
        });

        res.status(201).json({ order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// This is the most crucial step. After a student completes payment on the Razorpay UI,
// Razorpay sends back payment details. We must verify the signature to confirm authenticity.
const verifyPayment = async (req, res) => {
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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

            const pendingPayment = await Payment.findOne({
                student: req.user._id,
                'razorpay.orderId': razorpay_order_id,
                status: 'pending',
            });

            if (!pendingPayment) {
                return res.status(404).json({ message: 'Pending payment order not found.' });
            }

            // a. Find the student
            const student = await User.findById({ _id: req.user._id });
            if (!student) {
                return res.status(404).json({ message: 'Student not found.' });
            }

            // b. Complete the existing pending payment record
            pendingPayment.razorpay.paymentId = razorpay_payment_id;
            pendingPayment.razorpay.signature = razorpay_signature;
            pendingPayment.status = 'success';
            await pendingPayment.save();
            
            // c. Update student's records
            if (!student.paymentHistory.some((id) => id.equals(pendingPayment._id))) {
                student.paymentHistory.push(pendingPayment._id);
            }
            student.totalDues = Math.max(0, Number(student.totalDues || 0) - Number(pendingPayment.amount || 0));
            await student.save();
            
            res.status(200).json({ status: 'success', message: 'Payment verified and recorded successfully.', paymentId: pendingPayment._id });

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
        const payments = await Payment.find({}).populate('student', 'userName emailId').sort({ createdAt: -1 });
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
        if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
            return res.status(403).json({ message: 'You are not authorized to view this fee record.' });
        }

        const student = await User.findById({ _id: studentId })
            .select('userName emailId roomNo year course institution profileURL feeStructure totalDues paymentHistory')
            .populate('feeStructure')
            .populate({ path: 'paymentHistory', select: 'amount status createdAt razorpay.orderId razorpay.paymentId' });

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.status(200).json({ data: student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createFeeStructure,deleteFeeStructure,updateFeeStructure, getAllFeeStructures, getAllPayments, getStudentFeeDetails, createRazorpayOrder, verifyPayment, assignFeeToStudent }
