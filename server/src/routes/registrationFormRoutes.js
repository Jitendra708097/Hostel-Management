const express = require('express');
const registrationRouter = express.Router();
const { registrationController, getAllRegistrations, getRegistrationById, updateRegistration, deleteRegistration } = require('../controllers/registrationController');

// Create a new registration
registrationRouter.post('/register',registrationController);
registrationRouter.get('/registrations', getAllRegistrations);
registrationRouter.get('/registrations/:_id', getRegistrationById);
registrationRouter.put('/registrations/:id', updateRegistration);
registrationRouter.delete('/registrations/:id', deleteRegistration);

module.exports = registrationRouter;
