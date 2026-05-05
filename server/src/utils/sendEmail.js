const nodemailer = require('nodemailer');
require('dotenv').config();

const smtpPort = Number(process.env.SMTP_PORT || 587);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async (options) => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_FROM) {
        throw new Error('SMTP configuration is incomplete.');
    }

    const msg = {
        to: options.emailId,
        from: process.env.EMAIL_FROM,
        subject: options.subject,
        text: options.message,
    };

    try {
        await transporter.sendMail(msg);
    } catch (error) {
        console.error('Error sending email');
        console.error(error);
        throw new Error('Email could not be sent.');
    }
};

module.exports = sendEmail;
