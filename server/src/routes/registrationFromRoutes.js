const express = require('express');
const registerationRouter = express.Router();
const { registrationController, getAllRegistrations, getRegistrationById, updateRegistration, deleteRegistration } = require('../controllers/registrationController');

// Create a new registration
registerationRouter.post('/register',registrationController);
registerationRouter.get('/registrations', getAllRegistrations);
registerationRouter.get('/registrations/:_id', getRegistrationById);
registerationRouter.put('/registrations/:id', updateRegistration);
registerationRouter.delete('/registrations/:id', deleteRegistration);

module.exports = registerationRouter;
