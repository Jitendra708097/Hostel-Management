const validator = require('validator');
const User = require('../models/User');

// Function to validate email

const validatorFunction = async (data) => {

    // const mandatoryFields = ['emailId', 'password', 'userName', 'year', 'course', 'institution'];
    // for (const field of mandatoryFields) {
    //     if (!data[field]) {
    //         return { valid: false, message: `${field} is required.` };
    //     }
    // }
    const mandatoryFields = ['emailId', 'password', 'userName', 'year', 'course', 'institution'];
    Object.keys(data).forEach(key => {
        if (mandatoryFields.includes(key) && !data[key]) {
            return { valid: false, message: `${key} is required.` };
        }
    });

    const checkedEmail = await User.findOne({ emailId: data.emailId });
    if (checkedEmail) {
        return { valid: false, message: 'Email ID already exists.' };
    }

    if (!validator.isEmail(data.emailId)) {
        return { valid: false, message: 'Invalid email format.' };
    }

    if (!validator.isStrongPassword(data.password)) {
        return { valid: false, message: 'Password must be contains minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1' };
    }   
    if (data.userName.length < 3 || data.userName.length > 20) {
        return { valid: false, message: 'Student name must be between 3 and 20 characters.' };
    }
    if (data.year < 1 || data.year > 4) {
        return { valid: false, message: 'Year must be between 1 and 4.' };
    }
    const validInstitutions = ['HRIT', 'Virohan', 'Other'];
    if (!validInstitutions.includes(data.institution)) {
        return { valid: false, message: 'Institution must be one of HRIT, Virohan, or Other.' };
    }
    return { valid: true };
}
module.exports = validatorFunction;
