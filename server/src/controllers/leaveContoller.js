const LeaveApplication = require('../models/leaveRequest'); 

// Request made by student for wardens sir approval 
const leaveRequestByStudent =async (req, res) => {
    const { startDate, endDate, reason } = req.body;
    console.log("req body: ",req.body);
    try {
        const leaveApplication = await LeaveApplication.create({
            student: req.params._id, // Assuming student ID is available from auth middleware
            startDate,
            endDate,
            reason,
        });
        res.status(201).json({ success: true, data: leaveApplication });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// this controller for student can view their leave status in updated or not 
const viewLeaveStatus = async (req, res) => {
    try {
        const leaveApplications = await LeaveApplication.find({ student: req.params._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: leaveApplications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// this component is for warden sir they can view all leave request made by students 
const viewAllLeaveApplicationsByWarden = async (req, res) => {
    try {
        const leaveApplications = await LeaveApplication.find().populate('student', 'userName profileURL course year').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: leaveApplications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// this controller for warden sir will update the status of leave either reject or approved and add on remark 
const updateLeaveStatusByWarden = async (req, res) => {
    const { status, wardenComment } = req.body;
    console.log("Hello 1");
    console.log("_id: ",req.params._id);
    try {
        let leaveApplication = await LeaveApplication.findById({_id: req.params._id});
        console.log("leaveApplication: ",leaveApplication);
        if (!leaveApplication) {
            return res.status(404).json({ success: false, error: 'Leave application not found' });
        }

        leaveApplication.status = status;
        leaveApplication.wardenComment = wardenComment;

        // --- GATE PASS GENERATION LOGIC ---
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