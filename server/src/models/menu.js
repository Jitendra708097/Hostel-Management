const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    days: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
        unique: true
    },
    mealAndItem: [{
        meal: {
            type: String,
            required: true,
            enum: ['Breakfast', 'Lunch','Snack','Dinner']
        },
        itemName: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 25 
        }
    }]

}, { timestamps: true });

const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;
