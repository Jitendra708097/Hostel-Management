const LeaveApplication = require('../models/leaveSchema'); 

// Request made by student for wardens approval 
const leaveRequestByStudent =async (req, res) => {
    const { startDate, endDate, reason } = req.body;
    try {
        const leaveApplication = await LeaveApplication.create({
            student: req.user._id,
            startDate,
            endDate,
            reason,
        });
        res.status(201).json({ success: true, data: leaveApplication });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Check leave Status by student that approved or not. 
const viewLeaveStatus = async (req, res) => {
    try {
        const studentId = req.user.role === 'admin' ? req.params._id : req.user._id;
        const leaveApplications = await LeaveApplication.find({ student: studentId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: leaveApplications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// View All leave application request by students. 
const viewAllLeaveApplicationsByWarden = async (req, res) => {
    try {
        const leaveApplications = await LeaveApplication.find().populate('student', 'userName profileURL course year').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: leaveApplications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Approved or reject leave status if approved then gatePass will issue to the student.
const updateLeaveStatusByWarden = async (req, res) => {
    const { status, wardenComment } = req.body;
    try {
        let leaveApplication = await LeaveApplication.findById({_id: req.params._id});
        if (!leaveApplication) {
            return res.status(404).json({ success: false, error: 'Leave application not found' });
        }

        leaveApplication.status = status;
        leaveApplication.wardenComment = wardenComment;

        if (status === 'Approved' && !leaveApplication.gatePass.passId) {
            const passId = `GP-${req.params._id}`;
            leaveApplication.gatePass = {
                passId: passId,
                generatedAt: new Date(),
            };
        }

        await leaveApplication.save();

        res.status(200).json({ success: true, data: leaveApplication });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

module.exports = { leaveRequestByStudent, viewLeaveStatus, viewAllLeaveApplicationsByWarden, updateLeaveStatusByWarden };
