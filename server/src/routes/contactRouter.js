const express = require('express');
const contactRouter = express.Router();
const contactactor = require('../controllers/contactactor');

contactRouter.post('/send',contactactor);

module.exports = contactRouter;