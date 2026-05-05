const express = require('express');
const roomRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
const {
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
} = require('../controllers/roomController');

roomRouter.get('/my-room', userMiddleware, getMyRoom);

roomRouter.post('/', adminMiddleware, createRoom);
roomRouter.get('/', adminMiddleware, getRooms);
roomRouter.get('/availability', adminMiddleware, getRoomAvailability);
roomRouter.get('/allocations', adminMiddleware, getRoomAllocations);
roomRouter.get('/:roomId', adminMiddleware, getRoomById);
roomRouter.put('/:roomId', adminMiddleware, updateRoom);
roomRouter.delete('/:roomId', adminMiddleware, deleteRoom);
roomRouter.post('/:roomId/allocate', adminMiddleware, allocateStudentToRoom);
roomRouter.post('/allocation/:allocationId/vacate', adminMiddleware, vacateStudentAllocation);
roomRouter.post('/transfer', adminMiddleware, transferStudentRoom);

module.exports = roomRouter;
