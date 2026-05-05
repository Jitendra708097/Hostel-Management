import { useEffect, useMemo, useState } from 'react';
import { BedDouble, Building2, CircleDot, DoorOpen, Pencil, Plus, RefreshCw, Send, Trash2, UserPlus, Waypoints } from 'lucide-react';
import axiosClient from '../../config/axiosClient';
import AdminHeader from './AdminHeader';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white shadow-sm border border-slate-200 rounded-lg p-6 ${className}`}>{children}</div>
);

const initialRoomForm = {
    roomNumber: '',
    hostelType: 'boys',
    block: '',
    floor: '',
    capacity: '',
    roomType: 'double',
    facilities: '',
    notes: '',
};

const AdminRoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [students, setStudents] = useState([]);
    const [summary, setSummary] = useState(null);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedOccupantId, setSelectedOccupantId] = useState('');
    const [transferRoomId, setTransferRoomId] = useState('');
    const [roomForm, setRoomForm] = useState(initialRoomForm);
    const [editingRoomId, setEditingRoomId] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [savingRoom, setSavingRoom] = useState(false);
    const [allocating, setAllocating] = useState(false);
    const [transferring, setTransferring] = useState(false);
    const [notice, setNotice] = useState(null);

    const showNotice = (type, message) => setNotice({ type, message });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [roomsRes, studentsRes, availabilityRes] = await Promise.all([
                axiosClient.get('/rooms'),
                axiosClient.get('/user/getAllStudents'),
                axiosClient.get('/rooms/availability'),
            ]);
            setRooms(roomsRes.data.data || []);
            setStudents(studentsRes.data.data || []);
            setSummary(availabilityRes.data.data || null);
        } catch (error) {
            showNotice('error', error?.response?.data?.message || 'Failed to load room management data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const unallocatedStudents = useMemo(
        () => students.filter((student) => !student.currentRoom),
        [students]
    );

    const selectedStudent = students.find((student) => student._id === selectedStudentId) || null;
    const allActiveOccupants = rooms.flatMap((room) => (room.occupants || []).map((occupant) => ({
        ...occupant,
        roomId: room._id,
        roomNumber: room.roomNumber,
    })));
    const selectedOccupant = allActiveOccupants.find((occupant) => occupant.studentId?.toString() === selectedOccupantId) || null;

    const filteredRooms = rooms.filter((room) => {
        if (filter === 'all') return true;
        return room.status === filter;
    });

    const suggestedRooms = useMemo(() => {
        if (!selectedStudent) return filteredRooms;
        return filteredRooms
            .filter((room) => room.status !== 'maintenance' && room.status !== 'inactive')
            .sort((a, b) => {
                const aPref = a.roomType === selectedStudent.roomPreference ? 0 : 1;
                const bPref = b.roomType === selectedStudent.roomPreference ? 0 : 1;
                if (aPref !== bPref) return aPref - bPref;
                return b.availableBeds - a.availableBeds;
            });
    }, [filteredRooms, selectedStudent]);

    const transferCandidates = useMemo(() => {
        if (!selectedOccupant) return filteredRooms;
        return filteredRooms.filter((room) =>
            room._id !== selectedOccupant.roomId &&
            room.availableBeds > 0 &&
            !['maintenance', 'inactive'].includes(room.status)
        );
    }, [filteredRooms, selectedOccupant]);

    const handleRoomChange = (field, value) => {
        setRoomForm((current) => ({ ...current, [field]: value }));
    };

    const startEditRoom = (room) => {
        setEditingRoomId(room._id);
        setRoomForm({
            roomNumber: room.roomNumber || '',
            hostelType: room.hostelType || 'boys',
            block: room.block || '',
            floor: String(room.floor ?? ''),
            capacity: String(room.capacity ?? ''),
            roomType: room.roomType || 'double',
            facilities: Array.isArray(room.facilities) ? room.facilities.join(', ') : '',
            notes: room.notes || '',
        });
    };

    const resetRoomForm = () => {
        setEditingRoomId('');
        setRoomForm(initialRoomForm);
    };

    const handleSaveRoom = async (event) => {
        event.preventDefault();
        setSavingRoom(true);
        try {
            const payload = {
                ...roomForm,
                floor: Number(roomForm.floor),
                capacity: Number(roomForm.capacity),
                facilities: roomForm.facilities,
            };
            if (editingRoomId) {
                await axiosClient.put(`/rooms/${editingRoomId}`, payload);
                showNotice('success', 'Room updated successfully.');
            } else {
                await axiosClient.post('/rooms', payload);
                showNotice('success', 'Room created successfully.');
            }
            resetRoomForm();
            fetchData();
        } catch (error) {
            showNotice('error', error?.response?.data?.message || 'Failed to save room.');
        } finally {
            setSavingRoom(false);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            await axiosClient.delete(`/rooms/${roomId}`);
            if (editingRoomId === roomId) resetRoomForm();
            showNotice('success', 'Room deleted successfully.');
            fetchData();
        } catch (error) {
            showNotice('error', error?.response?.data?.message || 'Failed to delete room.');
        }
    };

    const handleAllocate = async () => {
        if (!selectedRoomId || !selectedStudentId) {
            showNotice('error', 'Please select both a student and a room.');
            return;
        }

        setAllocating(true);
        try {
            await axiosClient.post(`/rooms/${selectedRoomId}/allocate`, {
                studentId: selectedStudentId,
                source: 'manual',
                reason: 'Allocated from admin room dashboard',
            });
            setSelectedRoomId('');
            setSelectedStudentId('');
            showNotice('success', 'Student allocated successfully.');
            fetchData();
        } catch (error) {
            showNotice('error', error?.response?.data?.message || 'Failed to allocate room.');
        } finally {
            setAllocating(false);
        }
    };

    const handleVacate = async (allocationId) => {
        try {
            await axiosClient.post(`/rooms/allocation/${allocationId}/vacate`, {
                reason: 'Vacated by admin',
            });
            showNotice('success', 'Room vacated successfully.');
            fetchData();
        } catch (error) {
            showNotice('error', error?.response?.data?.message || 'Failed to vacate room.');
        }
    };

    const handleTransfer = async () => {
        if (!selectedOccupantId || !transferRoomId) {
            showNotice('error', 'Please select an occupant and a target room.');
            return;
        }

        setTransferring(true);
        try {
            await axiosClient.post('/rooms/transfer', {
                studentId: selectedOccupantId,
                toRoomId: transferRoomId,
                reason: 'Transferred by admin',
            });
            setSelectedOccupantId('');
            setTransferRoomId('');
            showNotice('success', 'Student transferred successfully.');
            fetchData();
        } catch (error) {
            showNotice('error', error?.response?.data?.message || 'Failed to transfer student.');
        } finally {
            setTransferring(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <AdminHeader
                title="Room Management"
                subtitle="Create rooms, edit inventory, allocate students, and transfer occupants"
                actions={(
                    <button
                        onClick={fetchData}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-700 hover:bg-slate-50"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                )}
            />

            {notice ? (
                <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : notice.type === 'info' ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                    {notice.message}
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <Card className="xl:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <Plus className="h-5 w-5 text-cyan-700" />
                        <h2 className="text-lg font-semibold text-slate-900">{editingRoomId ? 'Edit Room' : 'Create Room'}</h2>
                    </div>

                    <form onSubmit={handleSaveRoom} className="space-y-4">
                        <input value={roomForm.roomNumber} onChange={(e) => handleRoomChange('roomNumber', e.target.value)} placeholder="Room Number" className="w-full rounded-md border border-slate-300 px-3 py-2" required />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <select value={roomForm.hostelType} onChange={(e) => handleRoomChange('hostelType', e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
                                <option value="boys">Boys Hostel</option>
                                <option value="girls">Girls Hostel</option>
                            </select>
                            <select value={roomForm.roomType} onChange={(e) => handleRoomChange('roomType', e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="triple">Triple</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <input value={roomForm.block} onChange={(e) => handleRoomChange('block', e.target.value)} placeholder="Block" className="rounded-md border border-slate-300 px-3 py-2" required />
                            <input value={roomForm.floor} onChange={(e) => handleRoomChange('floor', e.target.value)} placeholder="Floor" type="number" className="rounded-md border border-slate-300 px-3 py-2" required />
                            <input value={roomForm.capacity} onChange={(e) => handleRoomChange('capacity', e.target.value)} placeholder="Capacity" type="number" className="rounded-md border border-slate-300 px-3 py-2" required />
                        </div>
                        <input value={roomForm.facilities} onChange={(e) => handleRoomChange('facilities', e.target.value)} placeholder="Facilities, comma separated" className="w-full rounded-md border border-slate-300 px-3 py-2" />
                        <textarea value={roomForm.notes} onChange={(e) => handleRoomChange('notes', e.target.value)} placeholder="Notes" rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button type="submit" disabled={savingRoom} className="flex-1 rounded-md bg-cyan-700 px-4 py-2 text-white font-semibold hover:bg-cyan-800 disabled:opacity-60">
                                {savingRoom ? 'Saving...' : editingRoomId ? 'Update Room' : 'Create Room'}
                            </button>
                            {editingRoomId ? (
                                <button type="button" onClick={resetRoomForm} className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
                                    Cancel
                                </button>
                            ) : null}
                        </div>
                    </form>
                </Card>

                <Card className="xl:col-span-2">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                            <p className="text-xs text-slate-500">Total Rooms</p>
                            <p className="text-2xl font-bold text-slate-900">{summary?.totalRooms ?? 0}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                            <p className="text-xs text-slate-500">Total Beds</p>
                            <p className="text-2xl font-bold text-slate-900">{summary?.totalBeds ?? 0}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                            <p className="text-xs text-slate-500">Occupied</p>
                            <p className="text-2xl font-bold text-slate-900">{summary?.occupiedBeds ?? 0}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                            <p className="text-xs text-slate-500">Available</p>
                            <p className="text-2xl font-bold text-emerald-700">{summary?.availableBeds ?? 0}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                            <p className="text-xs text-slate-500">Unallocated Students</p>
                            <p className="text-2xl font-bold text-amber-700">{summary?.unallocatedStudents ?? 0}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <UserPlus className="h-5 w-5 text-cyan-700" />
                                <h3 className="text-lg font-semibold text-slate-900">Allocate Student</h3>
                            </div>
                            <div className="space-y-3">
                                <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2">
                                    <option value="">Select Unallocated Student</option>
                                    {unallocatedStudents.map((student) => (
                                        <option key={student._id} value={student._id}>
                                            {student.userName} - prefers {student.roomPreference || 'double'}
                                        </option>
                                    ))}
                                </select>

                                <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2">
                                    <option value="">Select Room</option>
                                    {suggestedRooms
                                        .filter((room) => room.availableBeds > 0 && !['maintenance', 'inactive'].includes(room.status))
                                        .map((room) => (
                                            <option key={room._id} value={room._id}>
                                                {room.roomNumber} - {room.roomType} - {room.availableBeds} free
                                            </option>
                                        ))}
                                </select>

                                <button onClick={handleAllocate} disabled={allocating} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-cyan-700 px-4 py-2 text-white font-semibold hover:bg-cyan-800 disabled:opacity-60">
                                    <Send className="h-4 w-4" />
                                    {allocating ? 'Allocating...' : 'Allocate Room'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Waypoints className="h-5 w-5 text-cyan-700" />
                                <h3 className="text-lg font-semibold text-slate-900">Transfer Occupant</h3>
                            </div>
                            <div className="space-y-3">
                                <select value={selectedOccupantId} onChange={(e) => setSelectedOccupantId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2">
                                    <option value="">Select Occupant</option>
                                    {allActiveOccupants.map((occupant) => (
                                        <option key={occupant.allocationId} value={occupant.studentId}>
                                            {occupant.userName} - {occupant.roomNumber}
                                        </option>
                                    ))}
                                </select>

                                <select value={transferRoomId} onChange={(e) => setTransferRoomId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2">
                                    <option value="">Select Target Room</option>
                                    {transferCandidates.map((room) => (
                                        <option key={room._id} value={room._id}>
                                            {room.roomNumber} - {room.roomType} - {room.availableBeds} free
                                        </option>
                                    ))}
                                </select>

                                <button onClick={handleTransfer} disabled={transferring} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-white font-semibold hover:bg-slate-800 disabled:opacity-60">
                                    <Waypoints className="h-4 w-4" />
                                    {transferring ? 'Transferring...' : 'Transfer Student'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <CircleDot className="h-5 w-5 text-cyan-700" />
                            <h3 className="text-lg font-semibold text-slate-900">Status Filter</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['all', 'available', 'partial', 'full', 'maintenance', 'inactive'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`rounded-full px-3 py-1.5 text-sm font-medium ${filter === status ? 'bg-cyan-700 text-white' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-cyan-700" />
                        <h2 className="text-lg font-semibold text-slate-900">Rooms</h2>
                    </div>

                    {loading ? <p className="text-sm text-slate-500">Loading rooms...</p> : null}

                    <div className="space-y-3 max-h-[700px] overflow-y-auto">
                        {suggestedRooms.map((room) => (
                            <div key={room._id} className="rounded-lg border border-slate-200 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-900">{room.roomNumber}</p>
                                        <p className="text-sm text-slate-500">{room.block} Block, Floor {room.floor}</p>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${room.status === 'full' ? 'bg-red-50 text-red-700' : room.status === 'available' ? 'bg-emerald-50 text-emerald-700' : room.status === 'partial' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {room.status}
                                    </span>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                                    <div className="flex items-center gap-2"><BedDouble className="h-4 w-4" /> {room.roomType}</div>
                                    <div className="flex items-center gap-2"><DoorOpen className="h-4 w-4" /> {room.availableBeds} free</div>
                                </div>

                                <div className="mt-3 text-sm text-slate-600">
                                    <p>Occupants: {room.occupiedCount}/{room.capacity}</p>
                                    {room.facilities?.length ? <p className="mt-1">Facilities: {room.facilities.join(', ')}</p> : null}
                                </div>

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <button onClick={() => startEditRoom(room)} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </button>
                                    <button onClick={() => handleDeleteRoom(room._id)} className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100">
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-2 mb-4">
                        <UserPlus className="h-5 w-5 text-cyan-700" />
                        <h2 className="text-lg font-semibold text-slate-900">Current Occupants</h2>
                    </div>

                    <div className="space-y-3 max-h-[700px] overflow-y-auto">
                        {allActiveOccupants.map((occupant) => (
                            <div key={occupant.allocationId} className="rounded-lg border border-slate-200 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="break-words font-semibold text-slate-900">{occupant.userName}</p>
                                        <p className="text-sm text-slate-500">{occupant.roomNumber}</p>
                                        <p className="text-sm text-slate-500">{occupant.course} / Year {occupant.year}</p>
                                    </div>
                                    <button onClick={() => handleVacate(occupant.allocationId)} className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100">
                                        Vacate
                                    </button>
                                </div>
                            </div>
                        ))}
                        {allActiveOccupants.length === 0 ? (
                            <p className="text-sm text-slate-500">No active room allocations yet.</p>
                        ) : null}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminRoomManagement;
