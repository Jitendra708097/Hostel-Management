import { useEffect, useState } from 'react';
import { BedDouble, Building2, Home, Users } from 'lucide-react';
import axiosClient from '../../config/axiosClient';

const StudentMyRoom = () => {
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRoom = async () => {
            setLoading(true);
            try {
                const { data } = await axiosClient.get('/rooms/my-room');
                setRoom(data.data || null);
                setError('');
            } catch (fetchError) {
                setError(fetchError?.response?.data?.message || 'Could not load your room details.');
            } finally {
                setLoading(false);
            }
        };

        fetchRoom();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <p className="text-sm font-medium text-cyan-700">Student Portal</p>
                    <h1 className="text-3xl font-bold text-slate-900">My Room</h1>
                    <p className="mt-1 text-slate-600">View your current hostel allocation and roommate details.</p>

                    <div className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm p-6">
                        {loading ? <p className="text-sm text-slate-500">Loading room details...</p> : null}
                        {error ? <p className="text-sm text-red-600">{error}</p> : null}
                        {!loading && !error && !room ? (
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800">
                                No room has been allocated to your account yet.
                            </div>
                        ) : null}

                        {room ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                                        <p className="text-xs text-slate-500">Room Number</p>
                                        <p className="text-2xl font-bold text-slate-900">{room.roomNumber}</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                                        <p className="text-xs text-slate-500">Room Type</p>
                                        <p className="text-2xl font-bold text-slate-900 capitalize">{room.roomType}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-700">
                                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 p-4">
                                        <Building2 className="h-4 w-4 text-cyan-700" />
                                        {room.block} Block
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 p-4">
                                        <Home className="h-4 w-4 text-cyan-700" />
                                        Floor {room.floor}
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 p-4">
                                        <BedDouble className="h-4 w-4 text-cyan-700" />
                                        {room.occupiedCount}/{room.capacity} occupied
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users className="h-4 w-4 text-cyan-700" />
                                        <h2 className="text-lg font-semibold text-slate-900">Occupants</h2>
                                    </div>
                                    <div className="space-y-3">
                                        {(room.occupants || []).map((occupant) => (
                                            <div key={occupant.allocationId} className="rounded-lg border border-slate-200 p-4">
                                                <p className="font-medium text-slate-900">{occupant.userName}</p>
                                                <p className="text-sm text-slate-500">{occupant.course} / Year {occupant.year}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentMyRoom;
