const express = require('express');
const {getRules, addRule, updateRule} = require('../controllers/rulesController');
const rulesRouter = express.Router();   

// Routes for rules management
rulesRouter.get('/show', getRules);
rulesRouter.post('/add', addRule);
rulesRouter.put('/update', updateRule);
// rulesRouter.delete('/delete', deleteRule);

module.exports = rulesRouter;