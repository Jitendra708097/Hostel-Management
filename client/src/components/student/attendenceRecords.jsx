
import { useState, useEffect, useMemo } from 'react';
import axiosClient from '../../config/axiosClient';
import { useSelector } from 'react-redux';


const StudentAttendenceRecords = () => {
  const [attendanceData, setAttendanceData] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      setError('');
      try {
        console.log("Yes")
        const response = await axiosClient.get(`/attendance/get/${user?._id}`);
        console.log(response);
        const dataMap = response.data.reduce((acc, record) => {
          acc[record.date] = record.status;
          return acc;
        }, {});
        setAttendanceData(dataMap);
      } catch (err) {
        setError('Failed to fetch attendance history.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, [currentDate]); // Refetch when month changes

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // compute totals scoped to the currently shown month
  const monthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-`;
  const monthlyEntries = useMemo(() => {
    return Object.entries(attendanceData).filter(([date]) => date.startsWith(monthPrefix));
  }, [attendanceData, monthPrefix]);

  const totalPresents = useMemo(() => {
    return monthlyEntries.filter(([, status]) => status === 'present').length;
  }, [monthlyEntries]);

  const totalAbsents = useMemo(() => {
    return monthlyEntries.filter(([, status]) => status === 'absent').length;
  }, [monthlyEntries]);

  const totalMarked = monthlyEntries.length;
  const unknownDays = Math.max(0, daysInMonth - totalMarked);

  const getDayClass = (dateKey) => {
    const status = attendanceData[dateKey];
    if (status === 'present') return 'bg-green-500 text-white';
    if (status === 'absent') return 'bg-red-500 text-white';
    return 'bg-gray-100 text-gray-700';
  };
  
  const handleMonthChange = (offset) => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + offset);
        return newDate;
    });
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">My Attendance</h1>

         {/* Attention of student regarding attendence records */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-sm bg-green-500" />
            <span className="text-sm text-gray-800">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-sm bg-red-500" />
            <span className="text-sm text-gray-800">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-sm bg-gray-200 border" />
            <span className="text-sm text-gray-800">Not marked</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6 gap-4">

          {/* For Month Selection */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-800">Month</label>
            <select
              aria-label="Select month"
              value={currentDate.getMonth()}
              onChange={(e) => {
                const monthIndex = Number(e.target.value);
                setCurrentDate(prev => new Date(prev.getFullYear(), monthIndex, 1));
              }}
              className="px-3 py-2 border rounded-md bg-gray-200"
            >
              {Array.from({ length: 12 }).map((_, m) => (
                <option key={m} value={m}>{new Date(0, m).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>

          {/* For Year Selection */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-800">Year</label>
            <select
              aria-label="Select year"
              value={currentDate.getFullYear()}
              onChange={(e) => {
                const y = Number(e.target.value);
                setCurrentDate(prev => new Date(y, prev.getMonth(), 1));
              }}
              className="px-3 py-2 border rounded-md bg-gray-200"
            >
              {(() => {
                const years = [];
                const thisYear = new Date().getFullYear();
                for (let y = thisYear - 0; y <= thisYear + 1; y++) years.push(y);
                return years.map((yr) => <option key={yr} value={yr}>{yr}</option>);
              })()}
            </select>
          </div>

          <h2 className="text-2xl font-semibold text-blue-600">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        {/* attendence summary  */}
        <div className="p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm text-gray-600">Present</h4>
            <p className="text-2xl font-bold text-green-700">{totalPresents}</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-600">Absent</h4>
            <p className="text-2xl font-bold text-red-700">{totalAbsents}</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-600">Not marked</h4>
            <p className="text-2xl font-bold text-gray-700">{unknownDays}</p>
          </div>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-600">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2 mt-2">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
          {Array.from({ length: daysInMonth }).map((_, day) => {
            const dayNumber = day + 1;
            const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
            return (
              <div key={dayNumber} className={`w-full aspect-square flex items-center justify-center rounded-lg ${getDayClass(dateKey)}`}>
                {dayNumber}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendenceRecords;