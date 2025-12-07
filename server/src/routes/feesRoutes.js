const express = require('express');
const feeRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { createFeeStructure, getStudentFeeDetails,deleteFeeStructure, getAllFeeStructures, assignFeeToStudent, getAllPayments, createRazorpayOrder, verifyPayment } = require('../controllers/feeController');

// --- Admin Routes ---

feeRouter.post('/structure', adminMiddleware,createFeeStructure); // Create a new fee structure
feeRouter.get('/structures',adminMiddleware,getAllFeeStructures); // Get all fee structures
feeRouter.post('/assign',adminMiddleware,assignFeeToStudent);  // Assign a fee structure to a student and set their initial dues
feeRouter.get('/payments',adminMiddleware,getAllPayments);  // fetch all payments detail
feeRouter.delete('/structure/:_id/delete',adminMiddleware,deleteFeeStructure); // it will delete existing fee structure

// for both admin and student 
feeRouter.get('/student/:studentId',getStudentFeeDetails); // Get fee details for a specific student for both student and admin

// --- Student-Facing Routes ---
feeRouter.post('/create-order',userMiddleware,createRazorpayOrder); // Create a Razorpay order for payment
feeRouter.post('/verify-payment',userMiddleware,verifyPayment); // Verify the payment after the client-side transaction


module.exports = feeRouter;