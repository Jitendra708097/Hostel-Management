
const registrationForm = require('../models/registrationForm');

// Create a new registration
const registrationController = async (req, res) => {
    try {
        const newRegistration = new registrationForm(req.body);
        const savedRegistration = await newRegistration.save();
        res.status(201).json(savedRegistration);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }   
};

// Get all registrations
const getAllRegistrations = async (req, res) => {
    try {
        const registrations = await registrationForm.find();
        res.status(200).json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get a registration by ID
const getRegistrationById = async (req, res) => {
    try {
        const registration = await registrationForm.findById(req.params._id);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }
        res.status(200).json(registration);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}       
// Update a registration by ID
const updateRegistration = async (req, res) => {
    try {       
        const updatedRegistration = await registrationForm.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );          
        if (!updatedRegistration) {
            return res.status(404).json({ message: 'Registration not found' });
        }
        res.status(200).json(updatedRegistration);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }   
};
// Delete a registration by ID
const deleteRegistration = async (req, res) => {
    try {
        const deletedRegistration = await registrationForm.findByIdAndDelete(req.params.id);
        if (!deletedRegistration) {
            return res.status(404).json({ message: 'Registration not found' });
        }   
        res.status(200).json({ message: 'Registration deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }       
};

module.exports = {
    registrationController,
    getAllRegistrations,
    getRegistrationById,
    updateRegistration,
    deleteRegistration
};