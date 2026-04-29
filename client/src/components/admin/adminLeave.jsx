import { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { User, Calendar, MessageSquare, Check, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import axiosClient from '../../config/axiosClient';
import FullPageRefreshButton from '../../utils/refreshButton';
import AdminHeader from './AdminHeader';



// --- Reusable Sub-components ---
const ActionModal = ({ application, onClose, onConfirm }) => {
    // ... (This component remains exactly the same as before)
    const [comment, setComment] = useState('');
    if (!application) return null;
    const { action, details } = application;
    const isApproving = action === 'Approve';
    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md text-slate-900">
                <div className={`p-6 border-b-4 ${isApproving ? 'border-emerald-500' : 'border-red-500'}`}>
                    <h2 className="text-2xl font-bold">Confirm {action}</h2>
                    <p className="text-gray-700 mt-1">You are about to {action.toLowerCase()} the leave for <strong>{details.student?.userName}</strong>.</p>
                </div>
                <div className="p-6">
                    <label htmlFor="wardenComment" className="block text-sm font-medium text-gray-700 mb-2">Add a Comment (Optional)</label>
                    <textarea id="wardenComment" rows="3" value={comment} onChange={(e) => setComment(e.target.value)} placeholder={isApproving ? 'e.g., "Happy journey!"' : 'e.g., "Reason for rejection..."'} className="w-full bg-white border border-slate-300 rounded-md p-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none" />
                </div>
                <div className="flex justify-end gap-4 p-4 bg-slate-50 rounded-b-lg">
                    <button onClick={onClose} className="cursor-pointer py-2 px-4 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100">Cancel</button>
                    <button onClick={() => onConfirm(action, comment)} className={`cursor-pointer inline-flex items-center gap-2 font-bold py-2 px-4 rounded-md text-white ${isApproving ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>{isApproving ? <Check/> : <X/>} Confirm {action}</button>
                </div>
            </div>
        </div>
    );
};

const StatusPill = ({ status }) => {
    const styles = { Approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', Rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200', Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' };
    const Icon = { Approved: CheckCircle, Rejected: XCircle, Pending: Clock }[status];
    return (<span className={`flex items-center justify-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full ${styles[status]}`}><Icon className="w-4 h-4" />{status}</span>);
};

// --- Main Warden Component ---
const WardenLeaveDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('Pending');
    const [modalInfo, setModalInfo] = useState(null);
    const [notice, setNotice] = useState(null);

    const fetchWardenApplications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosClient.get('/leave/viewStatus');
            setApplications(response.data.data);
        } catch {
            setError('Failed to fetch applications.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWardenApplications();
    }, [fetchWardenApplications]);

    const handleAction = (action, application) => setModalInfo({ action, details: application });

    const handleConfirmAction = async (action, comment) => {
        const applicationId = modalInfo.details._id;
        try {
            const response = await axiosClient.put(`/leave/updateStatus/${applicationId}`, { status: action, wardenComment: comment });
            setApplications(prev => prev.map(app => app._id === applicationId ? response.data.data : app));
            setNotice({ type: 'success', message: `Leave ${action.toLowerCase()} successfully.` });
            setModalInfo(null);
        } catch {
            setNotice({ type: 'error', message: 'Failed to update leave status.' });
        }
    };
    
    const filteredApplications = applications.filter(app => filter === 'All' || app.status === filter);

    return (
        <div className="bg-slate-50 text-slate-700 min-h-screen p-4 sm:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {notice && (
                    <div className={`mb-4 rounded-lg border p-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                        {notice.message}
                    </div>
                )}
                <AdminHeader title="Leave Requests" subtitle="Review and manage student leave applications" actions={<FullPageRefreshButton content="Refresh" className="cursor-pointer h-10 flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50" />} />
                
                {/* filterSection of leaves like 'Pending', 'Approved', 'Rejected', 'All' */}
                <div className="flex space-x-1 sm:space-x-2 border-b border-slate-200 mb-6 overflow-x-auto">
                    {['Pending', 'Approved', 'Rejected', 'All'].map(tab => (
                        <button key={tab} onClick={() => setFilter(tab)} className={`cursor-pointer px-3 sm:px-4 py-2 font-medium text-sm rounded-t-lg transition-colors whitespace-nowrap ${filter === tab ? 'bg-cyan-700 text-white' : 'text-slate-500 hover:bg-cyan-50 hover:text-cyan-700'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                <h2 className="text-2xl font-semibold mb-4 text-slate-900">{filter} Applications ({filteredApplications.length})</h2>

                <div className="space-y-4">
                    {isLoading && <p>Loading...</p>}
                    {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
                    {!isLoading && filteredApplications.length === 0 && (<p className="text-gray-500 text-center py-8">No applications in this category.</p>)}
                    
                    {/* this is showing all data about student like student name,course,year */}
                    {filteredApplications.map(app => (
                        <div key={app._id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                <div className="md:col-span-1 flex items-center gap-3">
                                    {/* <User className="w-5 h-5 text-gray-400 shrink-0" /> */}
                                    <img src={app.student?.profileURL} alt={app.student?.userName || 'Student'} className='h-20 w-20 rounded-full object-cover border border-slate-200' />
                                    <div>
                                        <p className="font-bold text-gray-700">Name: {app.student?.userName}</p>
                                        <p className="text-sm text-gray-500">Course: {app.student?.course}</p>
                                        <p className="text-sm text-gray-500">Academic Year: {app.student?.year}</p>
                                    </div>
                                </div>
                                
                                <div className="md:col-span-2">
                                    <div className="flex items-center gap-3 mb-2"><Calendar className="w-5 h-5 text-gray-700" />
                                      <p className="text-gray-700">{format(parseISO(app.startDate), 'dd MMM yyyy')} - {format(parseISO(app.endDate), 'dd MMM yyyy')}</p>
                                    </div>
                                    <div className="flex items-start gap-3"><MessageSquare className="w-5 h-5 text-gray-700 mt-1 shrink-0" />
                                      <p className="text-gray-700">{app.reason}</p>
                                    </div>
                                    {app.wardenComment && <div className="mt-2 pt-2 border-t border-gray-700/50"><p className="text-sm text-gray-900">Your comment: <span className="text-gray-700">{app.wardenComment}</span></p></div>}
                                </div>

                                <div className="md:col-span-1 flex flex-col justify-center items-stretch gap-2">
                                    {app.status === 'Pending' ? (
                                        <>
                                            <button onClick={() => handleAction('Approved', app)} className="cursor-pointer inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md"><Check className="w-5 h-5" /> Approve</button>
                                            <button onClick={() => handleAction('Rejected', app)} className="cursor-pointer inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"><X className="w-5 h-5" /> Reject</button>
                                        </>
                                    ) : (
                                        <StatusPill status={app.status} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <ActionModal application={modalInfo} onClose={() => setModalInfo(null)} onConfirm={handleConfirmAction} />
        </div>
    );
};

export default WardenLeaveDashboard;
