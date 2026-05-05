const mongoose = require('mongoose');
const Room = require('../models/roomSchema');
const RoomAllocation = require('../models/roomAllocationSchema');
const User = require('../models/UserSchema');

const ROOM_STATUSES = ['available', 'partial', 'full', 'maintenance', 'inactive'];
const ROOM_TYPES = ['single', 'double', 'triple'];
const HOSTEL_TYPES = ['boys', 'girls'];

const normalizeRoomPayload = (body = {}) => {
    const facilities = Array.isArray(body.facilities)
        ? body.facilities
        : typeof body.facilities === 'string'
            ? body.facilities.split(',').map((item) => item.trim()).filter(Boolean)
            : [];

    return {
        roomNumber: String(body.roomNumber || '').trim(),
        hostelType: String(body.hostelType || '').trim().toLowerCase(),
        block: String(body.block || '').trim(),
        floor: Number(body.floor),
        capacity: Number(body.capacity),
        roomType: String(body.roomType || '').trim().toLowerCase(),
        status: String(body.status || '').trim().toLowerCase(),
        facilities,
        notes: typeof body.notes === 'string' ? body.notes.trim() : '',
    };
};

const deriveRoomStatus = (room) => {
    if (room.status === 'maintenance' || room.status === 'inactive') {
        return room.status;
    }
    if (room.occupiedCount <= 0) {
        return 'available';
    }
    if (room.occupiedCount >= room.capacity) {
        return 'full';
    }
    return 'partial';
};

const validateRoomPayload = (payload, { allowPartial = false } = {}) => {
    const errors = [];

    if (!allowPartial || payload.roomNumber) {
        if (!payload.roomNumber) errors.push('Room number is required.');
    }
    if (!allowPartial || payload.hostelType) {
        if (!HOSTEL_TYPES.includes(payload.hostelType)) errors.push('Hostel type must be boys or girls.');
    }
    if (!allowPartial || payload.block) {
        if (!payload.block) errors.push('Block is required.');
    }
    if (!allowPartial || Number.isFinite(payload.floor)) {
        if (!Number.isInteger(payload.floor) || payload.floor < 0) errors.push('Floor must be a valid number.');
    }
    if (!allowPartial || Number.isFinite(payload.capacity)) {
        if (!Number.isInteger(payload.capacity) || payload.capacity < 1) errors.push('Capacity must be at least 1.');
    }
    if (!allowPartial || payload.roomType) {
        if (!ROOM_TYPES.includes(payload.roomType)) errors.push('Room type must be single, double, or triple.');
    }
    if (payload.status && !ROOM_STATUSES.includes(payload.status)) {
        errors.push('Invalid room status.');
    }

    return errors;
};

const enrichRooms = async (rooms) => {
    const roomIds = rooms.map((room) => room._id);
    const allocations = await RoomAllocation.find({ roomId: { $in: roomIds }, status: 'active' })
        .populate('studentId', 'userName emailId year institution course roomPreference');

    const byRoom = allocations.reduce((acc, allocation) => {
        const key = allocation.roomId.toString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(allocation);
        return acc;
    }, {});

    return rooms.map((room) => {
        const occupants = (byRoom[room._id.toString()] || []).map((allocation) => ({
            allocationId: allocation._id,
            studentId: allocation.studentId?._id,
            userName: allocation.studentId?.userName,
            emailId: allocation.studentId?.emailId,
            year: allocation.studentId?.year,
            institution: allocation.studentId?.institution,
            course: allocation.studentId?.course,
            roomPreference: allocation.studentId?.roomPreference,
            bedLabel: allocation.bedLabel,
            allocatedAt: allocation.allocatedAt,
        }));

        return {
            ...room.toObject(),
            availableBeds: Math.max(0, room.capacity - room.occupiedCount),
            occupants,
        };
    });
};

const createRoom = async (req, res) => {
    try {
        const payload = normalizeRoomPayload(req.body);
        const validationErrors = validateRoomPayload(payload);
        if (validationErrors.length) {
            return res.status(400).json({ message: validationErrors.join(' ') });
        }

        const room = await Room.create({
            ...payload,
            occupiedCount: 0,
            status: payload.status || 'available',
        });

        res.status(201).json({ message: 'Room created successfully.', data: room });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A room with this number already exists.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getRooms = async (req, res) => {
    try {
        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.block) query.block = req.query.block;
        if (req.query.hostelType) query.hostelType = req.query.hostelType;
        if (req.query.roomType) query.roomType = req.query.roomType;

        const rooms = await Room.find(query).sort({ block: 1, floor: 1, roomNumber: 1 });
        const enriched = await enrichRooms(rooms);
        res.status(200).json({ data: enriched });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found.' });
        }

        const [enriched] = await enrichRooms([room]);
        res.status(200).json({ data: enriched });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found.' });
        }

        if (room.occupiedCount > 0) {
            return res.status(400).json({ message: 'Cannot delete a room that still has active occupants.' });
        }

        const activeAllocations = await RoomAllocation.countDocuments({ roomId: room._id, status: 'active' });
        if (activeAllocations > 0) {
            return res.status(400).json({ message: 'Cannot delete a room with active allocations.' });
        }

        await Room.findByIdAndDelete(room._id);
        res.status(200).json({ message: 'Room deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found.' });
        }

        const payload = normalizeRoomPayload(req.body);
        const filteredPayload = Object.fromEntries(
            Object.entries(payload).filter(([_, value]) => {
                if (Array.isArray(value)) return true;
                return value !== '' && value !== undefined && value !== null && !(typeof value === 'number' && Number.isNaN(value));
            })
        );

        const validationErrors = validateRoomPayload(filteredPayload, { allowPartial: true });
        if (validationErrors.length) {
            return res.status(400).json({ message: validationErrors.join(' ') });
        }

        if (filteredPayload.capacity && filteredPayload.capacity < room.occupiedCount) {
            return res.status(400).json({ message: 'Capacity cannot be lower than the current occupied count.' });
        }

        Object.assign(room, filteredPayload);
        room.status = filteredPayload.status || deriveRoomStatus(room);
        await room.save();

        res.status(200).json({ message: 'Room updated successfully.', data: room });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A room with this number already exists.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getRoomAvailability = async (req, res) => {
    try {
        const rooms = await Room.find({});
        const summary = rooms.reduce((acc, room) => {
            acc.totalRooms += 1;
            acc.totalBeds += room.capacity;
            acc.occupiedBeds += room.occupiedCount;
            acc.availableBeds += Math.max(0, room.capacity - room.occupiedCount);
            acc.byStatus[room.status] = (acc.byStatus[room.status] || 0) + 1;
            acc.byType[room.roomType] = (acc.byType[room.roomType] || 0) + 1;
            return acc;
        }, {
            totalRooms: 0,
            totalBeds: 0,
            occupiedBeds: 0,
            availableBeds: 0,
            byStatus: {},
            byType: {},
        });

        const unallocatedStudents = await User.countDocuments({ role: 'student', currentRoomId: null });
        res.status(200).json({ data: { ...summary, unallocatedStudents } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getRoomAllocations = async (req, res) => {
    try {
        const status = req.query.status || 'active';
        const allocations = await RoomAllocation.find(status ? { status } : {})
            .populate('studentId', 'userName emailId year course institution roomPreference')
            .populate('roomId', 'roomNumber roomType block floor hostelType capacity status')
            .populate('allocatedBy', 'userName emailId')
            .sort({ createdAt: -1 });

        res.status(200).json({ data: allocations });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const allocateStudentToRoom = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { roomId } = req.params;
        const { studentId, bedLabel = '', reason = '', source = 'manual' } = req.body;

        await session.withTransaction(async () => {
            const room = await Room.findById(roomId).session(session);
            if (!room) throw new Error('Room not found.');
            if (['maintenance', 'inactive'].includes(room.status)) throw new Error('Room is not allocatable right now.');
            if (room.occupiedCount >= room.capacity) throw new Error('Room is already full.');

            const student = await User.findById(studentId).session(session);
            if (!student || student.role !== 'student') throw new Error('Student not found.');

            const existingAllocation = await RoomAllocation.findOne({ studentId, status: 'active' }).session(session);
            if (existingAllocation) throw new Error('Student already has an active room allocation.');

            const allocation = await RoomAllocation.create([{
                studentId,
                roomId: room._id,
                bedLabel,
                reason,
                source,
                allocatedBy: req.user._id,
            }], { session });

            room.occupiedCount += 1;
            room.status = deriveRoomStatus(room);
            await room.save({ session });

            student.currentRoomId = room._id;
            student.currentAllocationId = allocation[0]._id;
            student.roomNo = room.roomNumber;
            await student.save({ session });
        });

        const room = await Room.findById(roomId);
        const [enriched] = await enrichRooms([room]);
        res.status(200).json({ message: 'Student allocated successfully.', data: enriched });
    } catch (error) {
        res.status(400).json({ message: error.message || 'Allocation failed.' });
    } finally {
        await session.endSession();
    }
};

const vacateStudentAllocation = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { allocationId } = req.params;
        const { reason = '' } = req.body;

        await session.withTransaction(async () => {
            const allocation = await RoomAllocation.findById(allocationId).session(session);
            if (!allocation || allocation.status !== 'active') throw new Error('Active allocation not found.');

            const room = await Room.findById(allocation.roomId).session(session);
            const student = await User.findById(allocation.studentId).session(session);
            if (!room || !student) throw new Error('Allocation data is incomplete.');

            allocation.status = 'vacated';
            allocation.vacatedAt = new Date();
            allocation.reason = reason || allocation.reason;
            await allocation.save({ session });

            room.occupiedCount = Math.max(0, room.occupiedCount - 1);
            room.status = deriveRoomStatus(room);
            await room.save({ session });

            student.currentRoomId = null;
            student.currentAllocationId = null;
            student.roomNo = null;
            await student.save({ session });
        });

        res.status(200).json({ message: 'Allocation vacated successfully.' });
    } catch (error) {
        res.status(400).json({ message: error.message || 'Vacating allocation failed.' });
    } finally {
        await session.endSession();
    }
};

const transferStudentRoom = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { studentId, toRoomId, bedLabel = '', reason = '' } = req.body;

        await session.withTransaction(async () => {
            const student = await User.findById(studentId).session(session);
            if (!student || student.role !== 'student') throw new Error('Student not found.');

            const activeAllocation = await RoomAllocation.findOne({ studentId, status: 'active' }).session(session);
            if (!activeAllocation) throw new Error('Student does not have an active room allocation.');

            if (activeAllocation.roomId.toString() === toRoomId) {
                throw new Error('Student is already assigned to the selected room.');
            }

            const fromRoom = await Room.findById(activeAllocation.roomId).session(session);
            const toRoom = await Room.findById(toRoomId).session(session);
            if (!fromRoom || !toRoom) throw new Error('Room not found.');
            if (['maintenance', 'inactive'].includes(toRoom.status)) throw new Error('Target room is not allocatable right now.');
            if (toRoom.occupiedCount >= toRoom.capacity) throw new Error('Target room is already full.');

            activeAllocation.status = 'vacated';
            activeAllocation.vacatedAt = new Date();
            activeAllocation.reason = reason || 'Transferred to another room.';
            await activeAllocation.save({ session });

            fromRoom.occupiedCount = Math.max(0, fromRoom.occupiedCount - 1);
            fromRoom.status = deriveRoomStatus(fromRoom);
            await fromRoom.save({ session });

            const [newAllocation] = await RoomAllocation.create([{
                studentId,
                roomId: toRoom._id,
                bedLabel,
                reason,
                source: 'transfer',
                allocatedBy: req.user._id,
            }], { session });

            toRoom.occupiedCount += 1;
            toRoom.status = deriveRoomStatus(toRoom);
            await toRoom.save({ session });

            student.currentRoomId = toRoom._id;
            student.currentAllocationId = newAllocation._id;
            student.roomNo = toRoom.roomNumber;
            await student.save({ session });
        });

        res.status(200).json({ message: 'Student transferred successfully.' });
    } catch (error) {
        res.status(400).json({ message: error.message || 'Transfer failed.' });
    } finally {
        await session.endSession();
    }
};

const getMyRoom = async (req, res) => {
    try {
        if (!req.user.currentRoomId) {
            return res.status(200).json({ data: null, message: 'No room allocated yet.' });
        }

        const room = await Room.findById(req.user.currentRoomId);
        if (!room) {
            return res.status(404).json({ message: 'Allocated room not found.' });
        }

        const [enriched] = await enrichRooms([room]);
        res.status(200).json({ data: enriched });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createRoom,
    getRooms,
    getRoomById,
    deleteRoom,
    updateRoom,
    getRoomAvailability,
    getRoomAllocations,
    allocateStudentToRoom,
    vacateStudentAllocation,
    transferStudentRoom,
    getMyRoom,
};
