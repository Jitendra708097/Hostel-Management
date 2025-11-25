import React, { useState, useEffect } from 'react';
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md text-white">
                <div className={`p-6 border-b-4 ${isApproving ? 'border-teal-500' : 'border-red-500'}`}>
                    <h2 className="text-2xl font-bold">Confirm {action}</h2>
                    <p className="text-gray-400 mt-1">You are about to {action.toLowerCase()} the leave for <strong>{details.student?.userName}</strong>.</p>
                </div>
                <div className="p-6">
                    <label htmlFor="wardenComment" className="block text-sm font-medium text-gray-400 mb-2">Add a Comment (Optional)</label>
                    <textarea id="wardenComment" rows="3" value={comment} onChange={(e) => setComment(e.target.value)} placeholder={isApproving ? 'e.g., "Happy journey!"' : 'e.g., "Reason for rejection..."'} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                </div>
                <div className="flex justify-end gap-4 p-4 bg-gray-900/50 rounded-b-lg">
                    <button onClick={onClose} className="py-2 px-4 rounded-md text-gray-300 hover:bg-gray-700">Cancel</button>
                    <button onClick={() => onConfirm(action, comment)} className={`inline-flex items-center gap-2 font-bold py-2 px-4 rounded-md ${isApproving ? 'bg-teal-600 hover:bg-teal-700' : 'bg-red-600 hover:bg-red-700'}`}>{isApproving ? <Check/> : <X/>} Confirm {action}</button>
                </div>
            </div>
        </div>
    );
};

const StatusPill = ({ status }) => {
    const styles = { Approved: 'bg-teal-500/20 text-teal-300', Rejected: 'bg-red-500/20 text-red-300', Pending: 'bg-yellow-500/20 text-yellow-300' };
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

    // this function is handling about the fetching all leave Request from server i.e. Database. 
    useEffect(() => {
        const fetchWardenApplications = async () => {
            setIsLoading(true);
            try {
                const response = await axiosClient.get('/leave/viewStatus');
                setApplications(response.data.data);
                console.log("response: ",response.data.data);
            } catch (err) {
                setError('Failed to fetch applications.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchWardenApplications();
    }, []);

    const handleAction = (action, application) => setModalInfo({ action, details: application });
    console.log(" modal ", modalInfo);

    const handleConfirmAction = async (action, comment) => {
        const applicationId = modalInfo.details._id;
        console.log("action: ",action,wardenComment);
        const response = await axiosClient.put(`/leave/updateStatus/${applicationId}`, { status: action, wardenComment: comment });
        console.log(`Action: ${action}, Comment: ${comment}`);
        console.log("response: ",response.data.data);
        setModalInfo(null);
        // Here you would refetch data
    };
    
    const filteredApplications = applications.filter(app => filter === 'All' || app.status === filter);
    console.log("fieltered :"+filteredApplications);

    return (
        <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <AdminHeader title="Leave Requests" subtitle="Review and manage student leave applications" actions={<FullPageRefreshButton content="Refresh" className="cursor-pointer h-10 flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-200 bg-slate-600 hover:bg-amber-700" />} />
                
                {/* filterSection of leaves like 'Pending', 'Approved', 'Rejected', 'All' */}
                <div className="flex space-x-1 sm:space-x-2 border-b border-gray-700 mb-6">
                    {['Pending', 'Approved', 'Rejected', 'All'].map(tab => (
                        <button key={tab} onClick={() => setFilter(tab)} className={`px-3 sm:px-4 py-2 font-medium text-sm rounded-t-lg transition-colors whitespace-nowrap ${filter === tab ? 'bg-gray-800 text-teal-400' : 'text-gray-400 hover:bg-gray-800/50'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                <h2 className="text-2xl font-semibold mb-4 text-gray-200">{filter} Applications ({filteredApplications.length})</h2>

                <div className="space-y-4">
                    {isLoading && <p>Loading...</p>}
                    {error && <p className="text-red-400">{error}</p>}
                    {!isLoading && filteredApplications.length === 0 && (<p className="text-gray-500 text-center py-8">No applications in this category.</p>)}
                    
                    {/* this is showing all data about student like student name,course,year */}
                    {filteredApplications.map(app => (
                        <div key={app._id} className="bg-gray-800 rounded-lg shadow-lg p-5">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                <div className="md:col-span-1 flex items-center gap-3">
                                    {/* <User className="w-5 h-5 text-gray-400 shrink-0" /> */}
                                    <img src={app.student?.profileURL} className='h-20 w-20 rounded-4xl' />
                                    <div>
                                        <p className="font-bold text-gray-200">Name: {app.student?.userName}</p>
                                        <p className="text-sm text-gray-500">Course: {app.student?.course}</p>
                                        <p className="text-sm text-gray-500">Academic Year: {app.student?.year}</p>
                                    </div>
                                </div>
                                
                                <div className="md:col-span-2">
                                    <div className="flex items-center gap-3 mb-2"><Calendar className="w-5 h-5 text-gray-400" />
                                      <p className="text-gray-300">{format(parseISO(app.startDate), 'dd MMM yyyy')} - {format(parseISO(app.endDate), 'dd MMM yyyy')}</p>
                                    </div>
                                    <div className="flex items-start gap-3"><MessageSquare className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                                      <p className="text-gray-400">{app.reason}</p>
                                    </div>
                                    {app.wardenComment && <div className="mt-2 pt-2 border-t border-gray-700/50"><p className="text-sm text-gray-500">Your comment: <span className="text-gray-300">{app.wardenComment}</span></p></div>}
                                </div>

                                <div className="md:col-span-1 flex flex-col justify-center items-stretch gap-2">
                                    {app.status === 'Pending' ? (
                                        <>
                                            <button onClick={() => handleAction('Approved', app)} className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md"><Check className="w-5 h-5" /> Approve</button>
                                            <button onClick={() => handleAction('Rejectd', app)} className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"><X className="w-5 h-5" /> Reject</button>
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