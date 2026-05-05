const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = require('../config/mongoDB');
const User = require('../models/UserSchema');
const Room = require('../models/roomSchema');
const RoomAllocation = require('../models/roomAllocationSchema');

const deriveRoomStatus = (room) => {
    if (room.occupiedCount <= 0) return 'available';
    if (room.occupiedCount >= room.capacity) return 'full';
    return 'partial';
};

const inferRoomType = (preference) => {
    if (['single', 'double', 'triple'].includes(preference)) return preference;
    return 'double';
};

const inferCapacity = (roomType) => {
    if (roomType === 'single') return 1;
    if (roomType === 'triple') return 3;
    return 2;
};

const run = async () => {
    await connectToDatabase();

    const admin = await User.findOne({ role: 'admin' }).select('_id');
    if (!admin) {
        throw new Error('At least one admin account is required before running the backfill.');
    }

    const students = await User.find({
        role: 'student',
        roomNo: { $nin: [null, ''] },
        currentRoomId: null,
    });

    for (const student of students) {
        const roomNumber = String(student.roomNo).trim();
        const roomType = inferRoomType(student.roomPreference);
        const room = await Room.findOneAndUpdate(
            { roomNumber },
            {
                $setOnInsert: {
                    roomNumber,
                    hostelType: 'boys',
                    block: 'Legacy',
                    floor: 0,
                    capacity: inferCapacity(roomType),
                    roomType,
                    status: 'available',
                    occupiedCount: 0,
                },
            },
            { new: true, upsert: true }
        );

        const allocation = await RoomAllocation.create({
            studentId: student._id,
            roomId: room._id,
            status: 'active',
            source: 'manual',
            reason: 'Backfilled from legacy roomNo data',
            allocatedBy: admin._id,
        });

        room.occupiedCount += 1;
        room.status = deriveRoomStatus(room);
        await room.save();

        student.currentRoomId = room._id;
        student.currentAllocationId = allocation._id;
        student.roomNo = room.roomNumber;
        await student.save();
    }

    console.log(`Backfilled ${students.length} student room allocations.`);
    await mongoose.connection.close();
};

run().catch((error) => {
    console.error(error);
    mongoose.connection.close();
    process.exit(1);
});
