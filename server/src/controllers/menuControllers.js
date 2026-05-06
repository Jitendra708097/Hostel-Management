const Menu = require('../models/menuSchema');

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const VALID_MEALS = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

const sendMenuError = (res, error) => {
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors).map(err => err.message).join(', ');
        return res.status(400).json({ message });
    }

    if (error.code === 11000) {
        return res.status(409).json({ message: 'Menu for this day already exists' });
    }

    return res.status(500).json({ message: 'Server error', error: error.message });
};

// it will show whole menu to user
const getMenu = async(req,res) => {
    try{
        const menu = await Menu.find();

        if(menu.length === 0){
            return res.status(404).json({message: 'No menu items found'});
        }
        res.status(200).json(menu);
    }
    catch(error){
        res.status(500).json({message: 'Server error', error: error.message});
    }
}

// it will fetch the menu of selected day to the student
const fetchMenuOfSelectedDay = async (req,res) => {
    try{

        const days = req.params.day;
        const menu = await Menu.find({days});
        if(menu.length === 0){
            return res.status(404).json({message: 'No menu items found'});
        }
        res.status(200).json(menu);
    }
    catch(error){
        res.status(500).json({message: 'Server error', error: error.message});
    }
}

// it will add new menu item to the menu these routes for admin
const addMenu = async(req,res) => {
    try{
        const {days,mealAndItem} = req.body;
        if(!days || !mealAndItem){
            return res.status(400).json({message: 'All fields are required'});
        }
        const newMenu = new Menu({days,mealAndItem});
        await newMenu.save();
        res.status(201).json({message: 'Menu item added successfully', menu: newMenu});
    }
    catch(error){
        sendMenuError(res, error);
    }
}

// it will update the menu item of the menu these routes for admin 
const updateMenu = async (req, res) => {
    try {
        const day = typeof req.body.day === 'string' ? req.body.day.trim() : '';
        const meal = typeof req.body.meal === 'string' ? req.body.meal.trim() : '';
        const itemName = typeof req.body.itemName === 'string' ? req.body.itemName.trim() : '';

        if (!day || !meal || !itemName) {
            return res.status(400).json({ message: 'Day, meal, and itemName are required' });
        }
        if (!VALID_DAYS.includes(day)) {
            return res.status(400).json({ message: 'Invalid day selected' });
        }
        if (!VALID_MEALS.includes(meal)) {
            return res.status(400).json({ message: 'Invalid meal selected' });
        }
        if (itemName.length < 3 || itemName.length > 100) {
            return res.status(400).json({ message: 'Item name must be between 3 and 100 characters' });
        }

        // Find the menu for the given day
        let menu = await Menu.findOne({days: day });
        if (!menu) {
            // If no menu for this day, create a new one
            menu = new Menu({
                days: day,
                mealAndItem: [{ meal, itemName }]
            });
            await menu.save();
            return res.status(201).json({ message: 'Menu created and item added', menu });
        }

        // Check if the meal already exists for this day
        const mealIndex = menu.mealAndItem.findIndex(m => m.meal.toLowerCase() === meal.toLowerCase());
        if (mealIndex !== -1) {
            // Update the itemName for this meal
            menu.mealAndItem[mealIndex].itemName = itemName;
        } else {
            menu.mealAndItem.push({ meal, itemName });
        }

        await menu.save();

        res.status(200).json({ message: 'Menu updated successfully', menu });
    } catch (error) {
        sendMenuError(res, error);
    }
}

module.exports = {getMenu, addMenu, updateMenu, fetchMenuOfSelectedDay};
