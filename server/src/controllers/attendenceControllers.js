const getTodayDate = require('../utils/getTodayDate');
const AttendanceRecord = require('../models/attendenceSchema');
const User = require('../models/User');


// This component is for warden to mark attendence of students
//  * The key change here is to use a single atomic update operation with upsert.
//  * This ensures that we either create a new record for today or update the existing one
//  * without needing to fetch and merge data manually, reducing the risk of race conditions.
const markAttendence =  async (req, res) => {
    const { presentStudentIds } = req.body;
    console.log("Hii0")

    if (!Array.isArray(presentStudentIds)) {
        return res.status(400).json({ message: 'presentStudentIds must be an array.' });
    }
// console.log("Hii")
    try {
        const today = getTodayDate();

        // Create the list of 'Present' students. No need to merge with a leave list.
        const presentStudentsList = presentStudentIds.map(id => ({
            studentId: id,
            status: 'present'
        }));

        // Perform the single, atomic update.
        const updatedRecord = await AttendanceRecord.findOneAndUpdate(
            { date: today },
            {
                // $set replaces the entire array with our new list of present students.
                $set: { students: presentStudentsList },
                $setOnInsert: { date: today }
            },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: 'Attendance successfully synced.',
            totalPresent: presentStudentsList.length,
            record: updatedRecord
        });

    } catch (error) {
        res.status(500).json({ message: 'Error syncing attendance data.', error: error.message });
    }
};

 
// This component is for warden to final submit the attendence of students
// and get the list of absent students
//  * The key change here is to efficiently determine absent students by comparing
//  * the list of all students against those marked present in the attendance record. 
const attendenceFinalSubmit =  async (req, res) => {
  try {
    const today = getTodayDate();

    const attendanceRecord = await AttendanceRecord.findOneAndUpdate(
      { date: today },
      { $set: { isFinalized: true } },
      { upsert: true, new: true } // Upsert in case warden finalizes without marking anyone
    );

    const allStudents = await User.find({ role: 'student' }).select('_id userName year').lean();
    
    // The set now only contains IDs of students who were explicitly marked present.
    const presentStudentIds = new Set(attendanceRecord.students.map(s => s.studentId.toString()));

    const absentStudents = allStudents.filter(
      student => !presentStudentIds.has(student._id.toString())
    );

    res.status(200).json({
      message: 'Attendance finalized successfully.',
      absentCount: absentStudents.length,
      absentStudents: absentStudents
    });
  } catch (error) {
    res.status(500).json({ message: 'Error finalizing attendance.', error: error.message });
  }
};


// This component for student to get their attendence records of last 30 days 
// with status present, absent or pending. 
const getStudentAttendenceRecords =  async (req, res) => {
  
  try {
    const studentId = req.params._id;
    console.log("Student Id:",studentId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const records = await AttendanceRecord.find({
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 }).lean();
    console.log("Records: ",records);

    const history = records.map(record => {
      // Find the first student entry that matches the logged-in student's ID
      const studentEntry = record.students.find(s => s.studentId.equals(studentId));
      // console.log("student: ",!!studentEntry);

      // If studentEntry is an object (truthy), they were present.
      // If it's undefined (falsy), they were not.
      const isPresent = !!studentEntry; // The '!!' converts a truthy/falsy value to a strict true/false
      let status;

      if (isPresent) {
        status = 'present';
      } else if (record.isFinalized) {
        status = 'absent';
      } else {
        status = 'pending'; // Attendance for this day not yet finalized
      }

      return {
        date: record.date.toISOString().split('T')[0],
        status: status
      };
    });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance history.', error: error.message });
  }
};


// This component is for warden to get the list of all students
// when initializing the attendence session.
const getStudents = async (req,res) => {
  
  try {
    // The logic is simpler: just get all students. The frontend will handle the initial 'Absent' state.
    const students = await User.find({ role: 'student' }).select('userName year course profileURL').lean();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error initializing attendance session.', error: error.message });
  }
}

module.exports = { markAttendence, attendenceFinalSubmit, getStudentAttendenceRecords, getStudents };