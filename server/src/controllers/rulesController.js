
const rules = require('../models/rulesSchema');


const getRules = async(req, res) => {
    // Logic to fetch and return rules
    res.send('Fetching rules...');

    const allRules = await rules.find();
    res.json(allRules);

}

const addRule = async(req, res) => {
    // Logic to add a new rule
    // res.send('Adding a new rule...');
    const newRule = new rules(req.body);
    await newRule.save();
    res.status(200).json(newRule);
}   

const updateRule = async(req, res) => {
    // Logic to update an existing rule
    res.send('Updating a rule...');
    const { id } = req.body;
    const updatedRule = await rules.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedRule);
}

module.exports = {getRules, addRule, updateRule};