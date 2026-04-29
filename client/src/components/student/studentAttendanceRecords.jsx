import { useState, useEffect, useMemo } from 'react';
import axiosClient from '../../config/axiosClient';
import { useSelector } from 'react-redux';
import { AlertCircle, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const StudentAttendanceRecords = () => {
  const [attendanceData, setAttendanceData] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useSelector((state) => state.auth);

  // Fetch attendance data on component mount and when currentDate changes or user changes
  // Attendance data structure: { '2024-06-01': 'present', '2024-06-02': 'absent', ... }
  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      setError('');
      try {
        if (!user?._id) {
          setError('Student session not found. Please log in again.');
          return;
        }
        const response = await axiosClient.get(`/attendance/get/${user?._id}`);
        const dataMap = response.data.reduce((acc, record) => {
          acc[record.date] = record.status;
          return acc;
        }, {});
        setAttendanceData(dataMap);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch attendance history.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, [currentDate, user?._id]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-`;
  const monthlyEntries = useMemo(() => Object.entries(attendanceData).filter(([date]) => date.startsWith(monthPrefix)), [attendanceData, monthPrefix]);

  const totalPresents = useMemo(() => monthlyEntries.filter(([, status]) => status === 'present').length, [monthlyEntries]);
  const totalAbsents = useMemo(() => monthlyEntries.filter(([, status]) => status === 'absent').length, [monthlyEntries]);
  const totalMarked = monthlyEntries.length;
  const unknownDays = Math.max(0, daysInMonth - totalMarked);

  // Determine CSS class for each day based on attendance status
  const getDayClass = (dateKey) => {
    const status = attendanceData[dateKey];
    if (status === 'present') return 'bg-emerald-500 text-white shadow-sm';
    if (status === 'absent') return 'bg-red-500 text-white shadow-sm';
    if (status === 'pending') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-slate-100 text-slate-500';
  };

  const moveMonth = (direction) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };
  
  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <p className="text-sm font-medium text-cyan-700">Attendance</p>
          <h1 className="text-3xl font-bold text-slate-900">My Attendance</h1>
          <p className="mt-1 text-slate-600">Track your monthly hostel attendance records.</p>
        </header>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-3 text-slate-900">
              <CalendarDays className="h-6 w-6 text-cyan-700" />
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => moveMonth(-1)} className="rounded-md border border-slate-300 p-2 text-slate-700 hover:border-cyan-300 hover:text-cyan-700" aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setCurrentDate(new Date())} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-cyan-300 hover:text-cyan-700">
                Today
              </button>
              <button type="button" onClick={() => moveMonth(1)} className="rounded-md border border-slate-300 p-2 text-slate-700 hover:border-cyan-300 hover:text-cyan-700" aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" /><span className="text-sm text-slate-700">Present</span></div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm bg-red-500" /><span className="text-sm text-slate-700">Absent</span></div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm bg-amber-50 border border-amber-200" /><span className="text-sm text-slate-700">Pending</span></div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm bg-slate-100 border border-slate-200" /><span className="text-sm text-slate-700">Not marked</span></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"><h4 className="text-sm text-emerald-700">Present</h4><p className="text-2xl font-bold text-emerald-800">{totalPresents}</p></div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4"><h4 className="text-sm text-red-700">Absent</h4><p className="text-2xl font-bold text-red-800">{totalAbsents}</p></div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><h4 className="text-sm text-slate-600">Not marked</h4><p className="text-2xl font-bold text-slate-800">{unknownDays}</p></div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-lg bg-slate-50 p-8 text-center text-slate-600">Loading attendance...</div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}</div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                  const dayNumber = day + 1;
                  const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                  return (<div key={dayNumber} className={`w-full aspect-square flex items-center justify-center rounded-md text-sm font-semibold ${getDayClass(dateKey)}`}>{dayNumber}</div>);
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceRecords;
