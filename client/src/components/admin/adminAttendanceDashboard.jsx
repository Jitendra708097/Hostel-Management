// src/components/admin/attendanceDashboard.jsx
import { useState, useEffect } from 'react';
import axiosClient from '../../config/axiosClient';
import FullPageRefreshButton from '../../utils/refreshButton';
import AdminHeader from './AdminHeader';

const AttendanceDashboard = () => {
  const [students, setStudents] = useState([]);
  const [presentStudentIds, setPresentStudentIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [finalReport, setFinalReport] = useState(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axiosClient.get('/attendance/session');
        setStudents(response.data);
      } catch (err) {
        setError('Failed to fetch student list. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessionData();
  }, []);

  // this component is for mark attendence.
  const handleTogglePresent = (studentId) => {
    const newSet = new Set(presentStudentIds);
    if (newSet.has(studentId)) newSet.delete(studentId); else newSet.add(studentId);
    setPresentStudentIds(newSet);
  };

  // this component is used for mark attendence in database.
  const handleSync = async () => {
    setIsSyncing(true);
    setError('');
    try {
      await axiosClient.post('/attendance/mark', { presentStudentIds: Array.from(presentStudentIds) });
      alert('Progress synced successfully!');
    } catch (err) {
      setError('Failed to sync. Please check your connection.');
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // this finalize the attendence and saved permanent in database 
  // which also create final report of present or absent students.
  const handleFinalize = async () => {
    if (!window.confirm('Are you sure you want to finalize? This will mark all other students as absent.')) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await axiosClient.post('/attendance/finalize');
      setFinalReport(response.data);
      alert('Attendance finalized!');
    } catch (err) {
      setError('Failed to finalize attendance.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // it shows the all absent students list on admin UI after finalize the attendence.
  if (finalReport) {
    return (
      <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Final Report for Today</h1>
        <p className="text-lg text-red-600 font-semibold mb-6">Total Absent Students: {finalReport.absentCount}</p>
        <ul className="space-y-3">
          {finalReport.absentStudents.map(student => (
            <li key={student._id} className="p-3 bg-red-50 rounded-md border border-red-200">
              <p className="font-bold text-gray-700">Name: {student.userName}</p>
              <p className="text-sm text-gray-500">Course year: {student.year}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
        <AdminHeader title="Attendance Panel" subtitle="Mark and finalize daily attendance" actions={<FullPageRefreshButton content="Refresh" className="cursor-pointer h-10 flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-200 bg-slate-600 hover:bg-amber-700" />} />

        <div className="sticky top-0 bg-gray-50 py-4 z-10">
          <input type="text" placeholder="Search by name or course year..." className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <button onClick={handleSync} disabled={isSyncing} className="flex-1 bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors">{isSyncing ? 'Syncing...' : `Sync Progress (${presentStudentIds.size})`}</button>
            <button onClick={handleFinalize} disabled={isLoading} className="flex-1 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors">Finalize Attendance</button>
          </div>
        </div>

        {isLoading && <p className="text-center mt-8">Loading students...</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {students.map(student => (
            <div key={student._id} onClick={() => handleTogglePresent(student._id)} className={`p-3 rounded-lg text-center cursor-pointer border-2 transition-all duration-200 ${presentStudentIds.has(student._id) ? 'bg-green-100 border-green-500 shadow-md scale-105' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
              <img src={student.profileURL || 'https://via.placeholder.com/100'} alt={student.userName} className="w-20 h-20 rounded-full mx-auto object-cover mb-2" />
              <p className="font-semibold text-gray-700">{student.userName}</p>
              <p className="text-sm text-gray-500">Year: {student.year}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
