import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, ChevronRight, ServerCrash, Trash2, Edit2, Save, BarChart2 } from 'lucide-react';
import axiosClient from '../../config/axiosClient';
import AdminHeader from './AdminHeader';

// --- Reusable UI Components (Internalized) ---
const Card = ({ children, className = '' }) => <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>{children}</div>;
const Button = ({ children, onClick, disabled = false }) => (
    <button onClick={onClick} disabled={disabled} className="px-4 py-2 font-semibold text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed">
        {children}
    </button>
);

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

    // --- DATA FETCHING ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Assume you have an endpoint to get all students
            // This is a necessary addition to your backend for this feature to work
            const studentsResponse = await axiosClient.get(`/user/getAllStudents`); // ASSUMED ENDPOINT
            console.log("StudentsList: ",studentsResponse.data);

            // <<< API CALL 1: Get All Fee Structures >>>
            const structuresResponse = await axiosClient.get(`/fees/structures`);
             console.log("Stuctures: ",structuresResponse.data);
            // console.log((await structuresResponse).data)

            // const [studentsResponse, structuresResponse] = await Promise.all([studentsPromise, structuresPromise]);
            
            setStudents(studentsResponse.data.data); // Adjust based on your actual student API response
            setStructures(structuresResponse.data.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError("Could not load students or fee structures. Please ensure the server is running.");
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
        } catch (err) {
            // ignore
        }
    }, [filter, students]);

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
            const res = await axiosClient.put(`/user/update/${selectedStudent._id}`, payload);
            alert('Student updated successfully');
            // refresh
            await fetchData();
            // re-select updated student object from refreshed list
            const updated = students.find(s => s._id === selectedStudent._id) || res.data.data || selectedStudent;
            setSelectedStudent(updated);
            setIsEditing(false);
        } catch (err) {
            console.error('Update failed', err);
            alert(err.response?.data?.message || 'Failed to update student');
        }
    };

    const handleDeleteStudent = async (studentId) => {
        const ok = confirm('Are you sure you want to delete this student? This action cannot be undone.');
        if (!ok) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/user/delete/${studentId}`);
            alert('Student deleted');
            // refresh list
            await fetchData();
            setSelectedStudent(null);
        } catch (err) {
            console.error('Delete failed', err);
            alert(err.response?.data?.message || 'Failed to delete student');
        } finally {
            setIsDeleting(false);
        }
    };
    
    // --- ASSIGNMENT LOGIC ---
    const handleAssignStructure = async () => {
        if (!selectedStudent || !selectedStructureId) {
            alert("Please select a student and a fee structure.");
            return;
        }
        setIsAssigning(true);
        try {
            // <<< API CALL 2: Assign a Fee Structure to a Student >>>
            await axiosClient.post(`/fees/assign`, {
                studentId: selectedStudent._id,
                feeStructureId: selectedStructureId,
            });

            alert(`Successfully assigned structure to ${selectedStudent.userName}.`);
            // Refresh data to show the change
            fetchData();
            setSelectedStudent(null); // Deselect student after successful assignment

        } catch (error) {
            console.error("Failed to assign structure:", error);
            alert(error.response?.data?.message || "An error occurred during assignment.");
        } finally {
            setIsAssigning(false);
        }
    };

    // Unassign a fee structure from a student (clear assignment)
    const handleUnassignStudent = async (studentId) => {
        const ok = confirm('Are you sure you want to unassign the fee structure from this student?');
        if (!ok) return;
        try {
            // Use the update endpoint to clear feeStructure and dues
            await axiosClient.put(`/user/update/${studentId}`, { feeStructure: null, totalDues: 0 });
            alert('Fee structure unassigned successfully.');
            await fetchData();
            setSelectedStudent(null);
        } catch (err) {
            console.error('Unassign failed', err);
            alert(err.response?.data?.message || 'Failed to unassign fee structure');
        }
    };

    // --- UI RENDERING LOGIC ---
    if (loading) return <div className="p-8 text-center">Loading student data...</div>;
    if (error) return (
        <div className="p-8">
            <Card className="text-center border-l-4 border-red-500">
                <ServerCrash className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800">Failed to Load Data</h2>
                <p className="text-gray-600">{error}</p>
            </Card>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
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
                                    <div key={y.year} className="bg-slate-100 p-3 rounded-md min-w-[140px]">
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
                            <div key={s._id} className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
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
                        <button onClick={() => setFilter('Unassigned')} className={`px-3 py-1 rounded-md ${filter==='Unassigned' ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border'}`}>Unassigned</button>
                        <button onClick={() => setFilter('Assigned')} className={`px-3 py-1 rounded-md ${filter==='Assigned' ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border'}`}>Assigned</button>
                        <button onClick={() => setFilter('All')} className={`px-3 py-1 rounded-md ${filter==='All' ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border'}`}>All</button>
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
                            <li key={student._id} className={`p-3 flex justify-between items-center hover:bg-sky-50 rounded-md ${selectedStudent?._id === student._id ? 'bg-sky-100' : ''}`}>
                                <div className="flex-1 cursor-pointer" onClick={() => handleSelectStudent(student)}>
                                    <p className="font-medium text-gray-800">{student.userName}</p>
                                    <p className="text-sm text-gray-500">{student.emailId}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button title="Edit" onClick={() => handleSelectStudent(student)} className="p-2 rounded text-sky-600 hover:bg-sky-50">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button title="Delete" onClick={() => handleDeleteStudent(student._id)} className="p-2 rounded text-red-600 hover:bg-red-50">
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
                                            <button className="px-3 py-2 rounded-md bg-sky-50 text-sky-700" onClick={() => setIsEditing(true)}><Edit2 className="w-4 h-4" /> Edit</button>
                                        )}
                                        {selectedStudent?.feeStructure ? (
                                            <button className="px-3 py-2 rounded-md bg-yellow-50 text-yellow-700" onClick={() => handleUnassignStudent(selectedStudent._id)}>Unassign</button>
                                        ) : null}
                                        <button className="px-3 py-2 rounded-md bg-red-50 text-red-600" onClick={() => handleDeleteStudent(selectedStudent._id)} disabled={isDeleting}><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <p className="text-gray-600 mt-2">
                                    Current Structure: <strong className="text-sky-700">{selectedStudent.feeStructure?.structureName || 'Not Assigned'}</strong>
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
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
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
                            <User className="w-16 h-16 mb-4" />
                            <p>Select a student from the list to manage their fee structure.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default StudentManager;