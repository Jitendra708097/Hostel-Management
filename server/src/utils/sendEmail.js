const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
    // console.log('Preparing to send email...', options);
    const msg = {
        to: options.emailId, // Recipient's email
        from: process.env.SEND_FROM_EMAIL, // Your verified sender
        subject: options.subject,
        text: options.message,
    };

    try {
        await sgMail.send(msg);
        // console.log(`Email sent successfully to ${options.emailId}`);
    } catch (error) {
        console.error('Error sending password reset email');
        console.error(error);
        if (error.response) {
            console.error(error.response.body)
        }
        // Re-throw the error to be caught by the calling function
        throw new Error('Email could not be sent.');
    }
};

module.exports = sendEmail;