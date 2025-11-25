const getTodayDate = require('../utils/getTodayDate');
const AttendanceRecord = require('../models/attendenceSchema');
const User = require('../models/User');


// it will store the students record on attendence document in Database
// the one document for one day to all students
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

 
//  * This logic is largely the same, as it compares the final list of "present" students
//  * against the master student list to find the absentees.
//  and also once warden click on final submit button then they can't the
//  attendence of any student. 
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


// from this component each student can view their attendence records 
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


// This component for warden attendence session in which student will show with their
// their phot,useName,course,year and warden will mark attendence on UI wheather present or absent
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