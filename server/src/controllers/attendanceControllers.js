const getTodayDate = require('../utils/getTodayDate');
const AttendanceRecord = require('../models/attendanceSchema');
const User = require('../models/UserSchema');


// This component is for warden to mark attendance of students
//  * The key change here is to use a single atomic update operation with upsert.
//  * This ensures that we either create a new record for today or update the existing one
//  * without needing to fetch and merge data manually, reducing the risk of race conditions.
const markAttendence =  async (req, res) => {
    const { presentStudentIds } = req.body;
    if (!Array.isArray(presentStudentIds)) {
        return res.status(400).json({ message: 'presentStudentIds must be an array.' });
    }

    try {
        const today = getTodayDate();

        const presentStudentsList = presentStudentIds.map(id => ({
            studentId: id,
            status: 'present'
        }));

        const updatedRecord = await AttendanceRecord.findOneAndUpdate(
            { date: today },
            {
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

// Finalize attendance (mark others absent)
const attendenceFinalSubmit =  async (req, res) => {
  try {
    const today = getTodayDate();

    const attendanceRecord = await AttendanceRecord.findOneAndUpdate(
      { date: today },
      { $set: { isFinalized: true } },
      { upsert: true, new: true }
    );

    const allStudents = await User.find({ role: 'student' }).select('_id userName year').lean();
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

// Get student's attendance history (last 30 days)
const getStudentAttendenceRecords =  async (req, res) => {
  try {
    const studentId = req.params._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const records = await AttendanceRecord.find({
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 }).lean();

    const history = records.map(record => {
      const studentEntry = record.students.find(s => s.studentId.equals(studentId));
      const isPresent = !!studentEntry;
      let status;

      if (isPresent) {
        status = 'present';
      } else if (record.isFinalized) {
        status = 'absent';
      } else {
        status = 'pending';
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

const getStudents = async (req,res) => {
  try {
    const students = await User.find({ role: 'student' }).select('userName year course profileURL').lean();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error initializing attendance session.', error: error.message });
  }
}

module.exports = { markAttendence, attendenceFinalSubmit, getStudentAttendenceRecords, getStudents };
