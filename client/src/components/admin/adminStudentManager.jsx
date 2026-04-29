import { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Info, ServerCrash, Trash2, Edit2, Save, X } from 'lucide-react';
import axiosClient from '../../config/axiosClient';
import AdminHeader from './AdminHeader';

// --- Reusable UI Components (Internalized) ---
const Card = ({ children, className = '' }) => <div className={`bg-white shadow-sm border border-slate-200 rounded-lg p-6 ${className}`}>{children}</div>;
const Button = ({ children, onClick, disabled = false }) => (
    <button onClick={onClick} disabled={disabled} className="inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-cyan-700 rounded-md shadow-sm hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed">
        {children}
    </button>
);

const getErrorMessage = (err, fallback) => (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
);

const Toast = ({ toast, onClose }) => {
    if (!toast) return null;

    const styles = {
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        error: 'border-red-200 bg-red-50 text-red-800',
        info: 'border-cyan-200 bg-cyan-50 text-cyan-800',
    };
    const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertTriangle : Info;

    return (
        <div className={`fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg ${styles[toast.type] || styles.info}`}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.message && <p className="mt-1 text-sm opacity-90">{toast.message}</p>}
            </div>
            <button onClick={onClose} className="rounded-md p-1 hover:bg-black/5" aria-label="Dismiss message">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

const ConfirmActionModal = ({ confirmState, onCancel, onConfirm, isBusy }) => {
    if (!confirmState) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                <div className="flex items-start gap-3 border-b border-slate-200 p-5">
                    <div className="rounded-full bg-red-50 p-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">{confirmState.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{confirmState.message}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-4">
                    <button onClick={onCancel} disabled={isBusy} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={isBusy} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                        {isBusy ? 'Working...' : confirmState.confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

const StudentManager = () => {
    // State Management
    const [students, setStudents] = useState([]);
    const [structures, setStructures] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedStructureId, setSelectedStructureId] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({});
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [filter, setFilter] = useState('Unassigned'); // 'All' | 'Assigned' | 'Unassigned'
    const [toast, setToast] = useState(null);
    const [confirmState, setConfirmState] = useState(null);

    const showToast = useCallback((type, title, message = '') => {
        setToast({ type, title, message });
    }, []);

    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(timer);
    }, [toast]);

    // --- DATA FETCHING ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Assume you have an endpoint to get all students
            // This is a necessary addition to your backend for this feature to work
            const studentsResponse = await axiosClient.get(`/user/getAllStudents`); // ASSUMED ENDPOINT

            // <<< API CALL 1: Get All Fee Structures >>>
            const structuresResponse = await axiosClient.get(`/fees/structures`);
            
            setStudents(studentsResponse.data.data); // Adjust based on your actual student API response
            setStructures(structuresResponse.data.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError(getErrorMessage(err, "Could not load students or fee structures. Please ensure the server is running."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-select first student when filter or students change
    useEffect(() => {
        try {
            const filtered = students.filter(s => {
                if (filter === 'All') return true;
                if (filter === 'Assigned') return Boolean(s.feeStructure);
                if (filter === 'Unassigned') return !s.feeStructure;
                return true;
            });
            // If current selection is not in filtered list, or nothing selected, pick first
            const isSelectedInFiltered = selectedStudent && filtered.some(f => f._id === selectedStudent._id);
            if (!isSelectedInFiltered) {
                if (filtered.length > 0) {
                    const first = filtered[0];
                    setSelectedStudent(first);
                    setSelectedStructureId(first.feeStructure?._id || '');
                    setIsEditing(false);
                    setEditValues({ userName: first.userName || '', emailId: first.emailId || '' });
                } else {
                    setSelectedStudent(null);
                    setSelectedStructureId('');
                    setEditValues({});
                }
            }
        } catch {
            // ignore
        }
    }, [filter, selectedStudent, students]);

    // Compute year-wise statistics from fetched students
    const yearStatsArray = useMemo(() => {
        const map = {};
        students.forEach(s => {
            const y = s.year ?? 'Unknown';
            if (!map[y]) map[y] = { total: 0, assigned: 0, unassigned: 0, fullyPaid: 0 };
            map[y].total += 1;
            if (s.feeStructure) map[y].assigned += 1;
            else map[y].unassigned += 1;
            if (Number(s.due) === 0 && (s.feeStructure?.totalAmount ?? 0) > 0) map[y].fullyPaid += 1;
        });
        return Object.keys(map)
            .sort((a, b) => {
                if (a === 'Unknown') return 1;
                if (b === 'Unknown') return -1;
                return Number(b) - Number(a);
            })
            .map(year => ({ year, ...map[year] }));
    }, [students]);

    // Handle selecting a student from the list
    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        // Pre-select the dropdown with the student's current fee structure
        setSelectedStructureId(student.feeStructure?._id || '');
        setIsEditing(false);
        setEditValues({ userName: student.userName || '', emailId: student.emailId || '' });
    };

    // --- UPDATE / DELETE ---
    const handleUpdateStudent = async () => {
        if (!selectedStudent) return;
        try {
            const payload = { userName: editValues.userName, emailId: editValues.emailId };
            const res = await axiosClient.put(`/user/admin/update/${selectedStudent._id}`, payload);
            showToast('success', 'Student updated', `${payload.userName || 'Student'} was updated successfully.`);
            // refresh
            await fetchData();
            // re-select updated student object from refreshed list
            const updated = students.find(s => s._id === selectedStudent._id) || res.data.user || selectedStudent;
            setSelectedStudent(updated);
            setIsEditing(false);
        } catch (err) {
            console.error('Update failed', err);
            showToast('error', 'Update failed', getErrorMessage(err, 'Failed to update student.'));
        }
    };

    const requestDeleteStudent = (studentId, studentName = 'this student') => {
        setConfirmState({
            type: 'delete',
            studentId,
            title: 'Delete student?',
            message: `This will permanently delete ${studentName}. This action cannot be undone.`,
            confirmLabel: 'Delete student',
        });
    };

    const handleDeleteStudent = async (studentId) => {
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/user/delete/${studentId}`);
            showToast('success', 'Student deleted', 'The student record has been removed.');
            // refresh list
            await fetchData();
            setSelectedStudent(null);
        } catch (err) {
            console.error('Delete failed', err);
            showToast('error', 'Delete failed', getErrorMessage(err, 'Failed to delete student.'));
        } finally {
            setIsDeleting(false);
            setConfirmState(null);
        }
    };
    
    // --- ASSIGNMENT LOGIC ---
    const handleAssignStructure = async () => {
        if (!selectedStudent || !selectedStructureId) {
            showToast('info', 'Selection needed', 'Please select a student and a fee structure.');
            return;
        }
        setIsAssigning(true);
        try {
            // <<< API CALL 2: Assign a Fee Structure to a Student >>>
            await axiosClient.post(`/fees/assign`, {
                studentId: selectedStudent._id,
                feeStructureId: selectedStructureId,
            });

            showToast('success', 'Fee structure assigned', `Successfully assigned structure to ${selectedStudent.userName}.`);
            // Refresh data to show the change
            fetchData();
            setSelectedStudent(null); // Deselect student after successful assignment

        } catch (error) {
            console.error("Failed to assign structure:", error);
            showToast('error', 'Assignment failed', getErrorMessage(error, 'An error occurred during assignment.'));
        } finally {
            setIsAssigning(false);
        }
    };

    // Unassign a fee structure from a student (clear assignment)
    const requestUnassignStudent = (studentId, studentName = 'this student') => {
        setConfirmState({
            type: 'unassign',
            studentId,
            title: 'Unassign fee structure?',
            message: `This will remove the current fee structure and reset dues for ${studentName}.`,
            confirmLabel: 'Unassign',
        });
    };

    const handleUnassignStudent = async (studentId) => {
        setIsDeleting(true);
        try {
            // Use the update endpoint to clear feeStructure and dues
            await axiosClient.put(`/user/admin/update/${studentId}`, { feeStructure: null, totalDues: 0 });
            showToast('success', 'Fee structure unassigned', 'The student is now marked as unassigned.');
            await fetchData();
            setSelectedStudent(null);
        } catch (err) {
            console.error('Unassign failed', err);
            showToast('error', 'Unassign failed', getErrorMessage(err, 'Failed to unassign fee structure.'));
        } finally {
            setIsDeleting(false);
            setConfirmState(null);
        }
    };

    const handleConfirmAction = () => {
        if (!confirmState) return;
        if (confirmState.type === 'delete') {
            handleDeleteStudent(confirmState.studentId);
        } else if (confirmState.type === 'unassign') {
            handleUnassignStudent(confirmState.studentId);
        }
    };

    // --- UI RENDERING LOGIC ---
    if (loading) return <div className="p-8 text-center">Loading student data...</div>;
    if (error) return (
        <div className="bg-slate-50 min-h-screen p-8">
            <Card className="text-center border-l-4 border-red-500">
                <ServerCrash className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800">Failed to Load Data</h2>
                <p className="text-gray-600">{error}</p>
                <button onClick={fetchData} className="mt-5 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
                    Try again
                </button>
            </Card>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <Toast toast={toast} onClose={() => setToast(null)} />
            <ConfirmActionModal confirmState={confirmState} onCancel={() => setConfirmState(null)} onConfirm={handleConfirmAction} isBusy={isDeleting} />
            <AdminHeader title="Student Fee Management" subtitle="Assign structures, view payments and manage students" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats Panel */}
                <Card className="md:col-span-3 mb-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                        <div>
                            <h3 className="text-lg font-semibold">Overview</h3>
                            <p className="text-sm text-gray-600">Quick stats about students and fee assignments</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 md:gap-6">
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Total Students</p>
                                <p className="text-2xl font-bold text-gray-800">{students.length}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Assigned</p>
                                <p className="text-2xl font-bold text-sky-600">{students.filter(s => s.feeStructure).length}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Unassigned</p>
                                <p className="text-2xl font-bold text-gray-700">{students.filter(s => !s.feeStructure).length}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Fully Paid</p>
                                <p className="text-2xl font-bold text-green-600">{students.filter(s => Number(s.due) === 0 && (s.feeStructure?.totalAmount ?? 0) > 0).length}</p>
                            </div>
                        </div>
                    </div>
                    {/* Year-wise stats */}
                    <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Year-wise Stats</h4>
                        <div className="flex gap-3 overflow-x-auto py-1">
                            {yearStatsArray.length > 0 ? (
                                yearStatsArray.map(y => (
                            <div key={y.year} className="bg-slate-50 border border-slate-200 p-3 rounded-md min-w-[140px]">
                                        <p className="text-xs text-gray-500">Year {y.year}</p>
                                        <p className="text-2xl font-bold text-gray-800">{y.total}</p>
                                        <p className="text-sm text-gray-600">Assigned: <span className="text-sky-600 font-semibold">{y.assigned}</span></p>
                                        <p className="text-sm text-gray-600">Unassigned: <span className="text-gray-700 font-semibold">{y.unassigned}</span></p>
                                        <p className="text-sm text-gray-600">Fully Paid: <span className="text-green-600 font-semibold">{y.fullyPaid}</span></p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No year data available.</p>
                            )}
                        </div>
                    </div>
                </Card>
                {/* Fully paid list */}
                <Card className="md:col-span-3">
                    <h3 className="text-lg font-semibold mb-3">Students with Full Payment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {students.filter(s => Number(s.due) === 0 && (s.feeStructure?.totalAmount ?? 0) > 0).map(s => (
                            <div key={s._id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-md">
                                <img src={s.profileURL} alt={s.userName} className="w-12 h-12 rounded-full object-cover" />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{s.userName}</p>
                                    <p className="text-sm text-gray-500">{s.feeStructure?.structureName || '—'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Paid</p>
                                    <p className="font-semibold text-green-600">₹{Number(s.totalPaid || 0).toLocaleString()}</p>
                                    <p className="text-xs text-gray-400">Due ₹{Number(s.due || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        {students.filter(s => Number(s.due) === 0 && (s.feeStructure?.totalAmount ?? 0) > 0).length === 0 && (
                            <p className="text-sm text-gray-500">No students have completed full payment yet.</p>
                        )}
                    </div>
                </Card>
                {/* Column 1: List of Students */}
                <Card className="md:col-span-1">
                    <h2 className="text-xl font-semibold mb-4">Students</h2>
                    <div className="flex gap-2 mb-3">
                        <button onClick={() => setFilter('Unassigned')} className={`px-3 py-1 rounded-md text-sm font-medium ${filter==='Unassigned' ? 'bg-cyan-700 text-white' : 'bg-white text-gray-700 border border-slate-300 hover:bg-slate-50'}`}>Unassigned</button>
                        <button onClick={() => setFilter('Assigned')} className={`px-3 py-1 rounded-md text-sm font-medium ${filter==='Assigned' ? 'bg-cyan-700 text-white' : 'bg-white text-gray-700 border border-slate-300 hover:bg-slate-50'}`}>Assigned</button>
                        <button onClick={() => setFilter('All')} className={`px-3 py-1 rounded-md text-sm font-medium ${filter==='All' ? 'bg-cyan-700 text-white' : 'bg-white text-gray-700 border border-slate-300 hover:bg-slate-50'}`}>All</button>
                    </div>
                    <ul className="divide-y divide-gray-200 max-h-[360px] sm:max-h-[600px] overflow-y-auto">
                        {students
                            .filter(s => {
                                if (filter === 'All') return true;
                                if (filter === 'Assigned') return Boolean(s.feeStructure);
                                if (filter === 'Unassigned') return !s.feeStructure;
                                return true;
                            })
                            .map(student => (
                            <li key={student._id} className={`p-3 flex justify-between items-center hover:bg-cyan-50 rounded-md ${selectedStudent?._id === student._id ? 'bg-cyan-50 ring-1 ring-cyan-200' : ''}`}>
                                <div className="flex-1 cursor-pointer" onClick={() => handleSelectStudent(student)}>
                                    <p className="font-medium text-gray-800">{student.userName}</p>
                                    <p className="text-sm text-gray-500">{student.emailId}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button title="Edit" onClick={() => handleSelectStudent(student)} className="p-2 rounded text-cyan-700 hover:bg-cyan-50">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button title="Delete" onClick={() => requestDeleteStudent(student._id, student.userName)} className="p-2 rounded text-red-600 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* Column 2: Details and Assignment Panel */}
                <Card className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Assign Fee Structure</h2>
                    {selectedStudent ? (
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        {isEditing ? (
                                            <>
                                                <input value={editValues.userName} onChange={(e) => setEditValues(v => ({ ...v, userName: e.target.value }))} className="border px-2 py-1 rounded-md w-full sm:w-auto" />
                                                <input value={editValues.emailId} onChange={(e) => setEditValues(v => ({ ...v, emailId: e.target.value }))} className="border px-2 py-1 rounded-md w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2" />
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="text-lg font-bold">{selectedStudent.userName}</h3>
                                                <p className="text-gray-600">Email: {selectedStudent.emailId}</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {isEditing ? (
                                            <>
                                                <div className="w-full sm:w-auto">
                                                    <Button onClick={handleUpdateStudent}><Save className="w-4 h-4 mr-2" /> Save</Button>
                                                </div>
                                                <button className="px-3 py-2 rounded-md bg-gray-200" onClick={() => { setIsEditing(false); setEditValues({ userName: selectedStudent.userName, emailId: selectedStudent.emailId }); }}>Cancel</button>
                                            </>
                                        ) : (
                                        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-cyan-50 text-cyan-700" onClick={() => setIsEditing(true)}><Edit2 className="w-4 h-4" /> Edit</button>
                                    )}
                                    {selectedStudent?.feeStructure ? (
                                            <button className="px-3 py-2 rounded-md bg-amber-50 text-amber-700" onClick={() => requestUnassignStudent(selectedStudent._id, selectedStudent.userName)}>Unassign</button>
                                        ) : null}
                                        <button className="px-3 py-2 rounded-md bg-red-50 text-red-600" onClick={() => requestDeleteStudent(selectedStudent._id, selectedStudent.userName)} disabled={isDeleting}><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <p className="text-gray-600 mt-2">
                                    Current Structure: <strong className="text-cyan-700">{selectedStudent.feeStructure?.structureName || 'Not Assigned'}</strong>
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="fee-structure-select" className="block text-sm font-medium text-gray-700">
                                    Select New Fee Structure:
                                </label>
                                <select 
                                    id="fee-structure-select"
                                    value={selectedStructureId}
                                    onChange={(e) => setSelectedStructureId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                >
                                    <option value="">-- Choose a structure --</option>
                                    {structures.map(s => (
                                        <option key={s._id} value={s._id}>{s.structureName} (₹{s.totalAmount.toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full sm:w-auto">
                                <Button onClick={handleAssignStructure} disabled={isAssigning || !selectedStructureId}>
                                    {isAssigning ? 'Assigning...' : 'Assign / Update Structure'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-gray-500">
                            <Info className="w-16 h-16 mb-4" />
                            <p>Select a student from the list to manage their fee structure.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default StudentManager;
