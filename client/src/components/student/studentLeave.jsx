import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, isBefore, parseISO, startOfToday } from 'date-fns';
import { AlertCircle, ChevronDown, Send, CheckCircle, XCircle, Clock, Paperclip, History, X } from 'lucide-react';
import axiosClient from "../../config/axiosClient";
import { useSelector } from 'react-redux';


// Zod Schema (no changes)
const leaveSchema = z.object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    reason: z.string().min(10, 'Reason must be at least 10 characters long'),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'End date cannot be before start date',
    path: ['endDate'],
});



const GatePass = ({ student, application }) => (
    <div className="flex-wrap bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-teal-500/30 text-white font-sans w-full max-w-md mx-auto transition-all duration-300 hover:shadow-teal-500/40">
        <header className="flex justify-between items-center pb-4 border-b border-gray-700">
            <h1 className="text-xl font-bold text-teal-400">HOSTEL GATE PASS</h1>
            <Paperclip className="w-6 h-6 text-teal-400" />
        </header>
        <main className="flex-col gap-6 mt-6">
            <div className="shrink-0 flex justify-center">
                <img src={student.profileURL} alt="Student" className="w-28 h-28 rounded-full border-4 border-teal-500 object-cover" />
            </div>
            <div className="space-y-2 text-gray-300 text-center pt-4">
                <p><strong>Name:</strong> {student.userName}</p>
                <p><strong>Course:</strong> {student.course} ({student.year})</p>
                <p><strong>Leave:</strong> {format(parseISO(application.startDate), 'dd MMM yyyy')} to {format(parseISO(application.endDate), 'dd MMM yyyy')}</p>
                <p><strong>Gate Pass ID:</strong> <span className="font-mono bg-gray-700 text-teal-300 px-2 py-1 rounded">{application.gatePass.passId}</span></p>
            </div>
        </main>
        <footer className="mt-6 pt-4 border-t border-gray-700 text-center text-sm text-gray-500">
            <p>Approved By: <strong>Warden</strong></p>
            <p>Issued On: {format(new Date(), 'dd MMM yyyy, hh:mm a')}</p>
        </footer>
    </div>
);

const StatusPill = ({ status }) => {
    const styles = { Approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', Rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200', Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' };
    const Icon = { Approved: CheckCircle, Rejected: XCircle, Pending: Clock }[status];
    return (<span className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full ${styles[status]}`}><Icon className="w-4 h-4" />{status}</span>);
};

// Main Component
const StudentLeaveDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const { user } = useSelector(( state ) => state.auth);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(leaveSchema),
    });

    
    // this fetch leave data from database for checking status of leave 
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                if (!user?._id) return;
                const response = await axiosClient.get(`/leave/check/${user._id}`);
                setApplications(response.data.data);
                setError(null);
            } catch {
                setError('Failed to fetch leave applications.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplications();
    }, [user?._id]);

    // form submission handler 
    const onSubmit = async (data) => {
        try {
            const response = await axiosClient.post(`/leave/request/${user?._id}`,data);
            setApplications(prev => [response.data.data, ...prev]);
            setNotice({ type: 'success', message: 'Leave application submitted successfully.' });
            reset();
            setIsFormVisible(false);
        } catch (err) {
            setNotice({ type: 'error', message: err?.response?.data?.error || err?.response?.data?.message || 'Failed to submit application.' });
        }
    };

    // logic to categorize applications and get active gate pass
    const today = startOfToday();
    const activeGatePassApp = applications.find(app => 
        app.status === 'Approved' &&
        app.gatePass?.passId &&
        !isBefore(today, parseISO(app.startDate)) &&
        !isBefore(parseISO(app.endDate), today)
    );


    const pendingAndUpcomingApps = applications.filter(app => 
        app.status === 'Pending' || 
        (app.status === 'Approved' && !isBefore(parseISO(app.endDate), today))
    ).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    const pastApps = applications.filter(app => 
        app.status === 'Rejected' || 
        (app.status === 'Approved' && isBefore(parseISO(app.endDate), today))
    ).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    // Reusable component for displaying a list of applications
    const ApplicationList = ({ apps }) => (
        <div className="space-y-4">
            {apps.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No applications in this category.</p>
            ) : (
                apps.map(app => (
                    <div key={app._id} className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm hover:border-cyan-300 hover:shadow-md transition-all">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <div>
                                <p className="font-bold text-lg text-slate-900">{format(parseISO(app.startDate), 'dd MMM yyyy')} - {format(parseISO(app.endDate), 'dd MMM yyyy')}</p>
                                <p className="text-slate-600 text-sm">{app.reason}</p>
                            </div>
                            <StatusPill status={app.status} />
                        </div>
                        {app.wardenComment && (<div className="mt-3 pt-3 border-t border-slate-200"><p className="text-sm text-slate-600"><strong>Warden's Comment:</strong> {app.wardenComment}</p></div>)}
                    </div>
                ))
            )}
        </div>
    );
    
    return (
        <div className="bg-slate-50 text-slate-700 min-h-screen p-4 sm:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <p className="text-sm font-medium text-cyan-700">Leave Application</p>
                    <h1 className="text-3xl font-bold text-slate-900">Student Leave Portal</h1>
                    <p className="text-slate-600 mt-1">Apply for leave and track warden approval status.</p>
                </header>

                {notice && (
                    <div className={`mb-5 flex items-center justify-between rounded-lg border p-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                        <span>{notice.message}</span>
                        <button onClick={() => setNotice(null)} aria-label="Dismiss message"><X className="h-4 w-4" /></button>
                    </div>
                )}

                {error && (
                    <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {activeGatePassApp && (
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-slate-900">Your Active Gate Pass</h2>
                        <GatePass student={user} application={activeGatePassApp} />
                    </section>
                )}

                <section className="mb-10 bg-white rounded-lg shadow-sm border border-slate-200">
                    <button onClick={() => setIsFormVisible(!isFormVisible)} className="w-full flex justify-between items-center p-4 text-left">
                        <h2 className="text-xl font-semibold text-slate-900">Apply for New Leave</h2>
                        <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform ${isFormVisible ? 'rotate-180' : ''}`} />
                    </button>
                    {isFormVisible && (
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-0 space-y-4">
                            {/* Form fields... (same as before) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-800 mb-1">Start Date</label>
                                    <input type="date" {...register('startDate')} className="w-full bg-white border border-slate-300 rounded-md p-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none" />
                                    {errors.startDate && <p className="text-red-600 text-xs mt-1">{errors.startDate.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-800 mb-1">End Date</label>
                                    <input type="date" {...register('endDate')} className="w-full bg-white border border-slate-300 rounded-md p-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none" />
                                    {errors.endDate && <p className="text-red-600 text-xs mt-1">{errors.endDate.message}</p>}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-800 mb-1">Reason for Leave</label>
                                <textarea {...register('reason')} rows="4" className="w-full bg-white border border-slate-300 rounded-md p-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none"></textarea>
                                {errors.reason && <p className="text-red-600 text-xs mt-1">{errors.reason.message}</p>}
                            </div>
                            <div className="text-right">
                                <button type="submit" className="cursor-pointer inline-flex items-center gap-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-4 rounded-md"><Send className="w-4 h-4" /> Submit</button>
                            </div>
                        </form>
                    )}
                </section>
                
                {/* --- Pending & Upcoming Section --- */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-slate-900 flex items-center gap-2"><Clock className="w-6 h-6 text-cyan-600" /> Pending & Upcoming Applications</h2>
                    {isLoading ? <p>Loading...</p> : <ApplicationList apps={pendingAndUpcomingApps} />}
                </section>

                {/* --- History Section --- */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-slate-900 flex items-center gap-2"><History className="w-6 h-6 text-cyan-600" /> Leave History</h2>
                    {isLoading ? <p>Loading...</p> : <ApplicationList apps={pastApps} />}
                </section>
            </div>
        </div>
    );
};

export default StudentLeaveDashboard;
