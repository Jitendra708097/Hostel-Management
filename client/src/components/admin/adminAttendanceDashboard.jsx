// src/components/admin/attendanceDashboard.jsx
import { useState, useEffect } from 'react';
import axiosClient from '../../config/axiosClient';
import FullPageRefreshButton from '../../utils/refreshButton';
import AdminHeader from './AdminHeader';
import { AlertTriangle, CheckCircle2, Search, X } from 'lucide-react';

const AttendanceDashboard = () => {
  const [students, setStudents] = useState([]);
  const [presentStudentIds, setPresentStudentIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [finalReport, setFinalReport] = useState(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axiosClient.get('/attendance/session');
        setStudents(response.data);
      } catch {
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
      setNotice({ type: 'success', message: 'Progress synced successfully.' });
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
    setIsLoading(true);
    setError('');
    try {
      const response = await axiosClient.post('/attendance/finalize');
      setFinalReport(response.data);
      setNotice({ type: 'success', message: 'Attendance finalized.' });
    } catch (err) {
      setError('Failed to finalize attendance.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setConfirmFinalize(false);
    }
  };

  // it shows the all absent students list on admin UI after finalize the attendence.
  if (finalReport) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Final Report for Today</h1>
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
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {notice && (
          <div className={`mb-4 flex items-center justify-between rounded-lg border p-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
            <span>{notice.message}</span>
            <button onClick={() => setNotice(null)} aria-label="Dismiss message"><X className="h-4 w-4" /></button>
          </div>
        )}
        {error && <p className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-md mb-4">{error}</p>}
        <AdminHeader title="Attendance Panel" subtitle="Mark and finalize daily attendance" actions={<FullPageRefreshButton content="Refresh" className="cursor-pointer h-10 flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50" />} />

        <div className="sticky top-0 bg-slate-50/95 backdrop-blur py-4 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by name or course year..." className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <button onClick={handleSync} disabled={isSyncing} className="flex-1 bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-800 disabled:bg-cyan-300 transition-colors">{isSyncing ? 'Syncing...' : `Sync Progress (${presentStudentIds.size})`}</button>
            <button onClick={() => setConfirmFinalize(true)} disabled={isLoading} className="flex-1 bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 disabled:bg-slate-400 transition-colors">Finalize Attendance</button>
          </div>
        </div>

        {isLoading && <p className="text-center mt-8">Loading students...</p>}

        {/* Attendence clicking card where admin will click card and it will selected. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {students.filter(student => `${student.userName || ''} ${student.year || ''}`.toLowerCase().includes(searchTerm.toLowerCase())).map(student => (
            <div key={student._id} onClick={() => handleTogglePresent(student._id)} className={`p-3 rounded-lg text-center cursor-pointer border-2 transition-all duration-200 ${presentStudentIds.has(student._id) ? 'bg-emerald-50 border-emerald-500 shadow-md scale-105' : 'bg-white border-slate-200 hover:shadow-lg'}`}>
              <img src={student.profileURL || 'https://via.placeholder.com/100'} alt={student.userName} className="w-20 h-20 rounded-full mx-auto object-cover mb-2" />
              <p className="font-semibold text-slate-800">{student.userName}</p>
              <p className="text-sm text-slate-500">Year: {student.year}</p>
              {presentStudentIds.has(student._id) && <CheckCircle2 className="mx-auto mt-2 h-5 w-5 text-emerald-600" />}
            </div>
          ))}
        </div>
      </div>
      {confirmFinalize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-start gap-3 border-b border-slate-200 p-5">
              <div className="rounded-full bg-amber-50 p-2 text-amber-600"><AlertTriangle className="h-5 w-5" /></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Finalize attendance?</h3>
                <p className="mt-1 text-sm text-slate-600">All students not marked present will be counted absent for today.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4">
              <button onClick={() => setConfirmFinalize(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleFinalize} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Finalize</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;
