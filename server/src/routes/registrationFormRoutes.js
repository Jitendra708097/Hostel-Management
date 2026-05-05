const express = require('express');
const registrationRouter = express.Router();
const { registrationController, getAllRegistrations, getRegistrationById, updateRegistration, deleteRegistration } = require('../controllers/registrationController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Create a new registration
registrationRouter.post('/register',registrationController);
registrationRouter.get('/registrations', adminMiddleware, getAllRegistrations);
registrationRouter.get('/registrations/:_id', adminMiddleware, getRegistrationById);
registrationRouter.put('/registrations/:id', adminMiddleware, updateRegistration);
registrationRouter.delete('/registrations/:id', adminMiddleware, deleteRegistration);

module.exports = registrationRouter;
