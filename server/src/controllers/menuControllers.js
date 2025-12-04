const Menu = require('../models/menuSchema');

// it will show whole menu to user
const getMenu = async(req,res) => {
    try{
        const menu = await Menu.find();

        if(menu.length === 0){
            return res.status(404).json({message: 'No menu items found'});
        }
        res.status(200).json(menu);
        // console.log(menu);
    }
    catch(error){
        res.status(500).json({message: 'Server error', error: error.message});
    }
}

// it will fetch the menu of selected day to the student
const fetchMenuOfSelectedDay = async (req,res) => {
    try{

        const days = req.params.day;
        // console.log("Days: ",days);
        const menu = await Menu.find({days});
        // console.log("Backend Menu: ",menu);
        if(menu.length === 0){
            return res.status(404).json({message: 'No menu items found'});
        }
        res.status(200).json(menu);
        // console.log(menu);
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
        res.status(500).json({message: 'Server error', error: error.message});
    }
}

// it will update the menu item of the menu these routes for admin 
const updateMenu = async (req, res) => {
    try {
        const { day, meal, itemName } = req.body;
        if (!day || !meal || !itemName) {
            return res.status(400).json({ message: 'Day, meal, and itemName are required' });
        }

        // Find the menu for the given day
        let menu = await Menu.findOne({days: day });
        if (!menu) {
            // If no menu for this day, create a new one
            menu = new Menu({
                day,
                mealAndItem: [{ meal, itemName }]
            });
            await menu.save();
            return res.status(201).json({ message: 'Menu created and item added', menu });
        }

        // Check if the meal already exists for this day
        const mealIndex = menu.mealAndItem.findIndex(m => m.meal.toLowerCase() === meal.toLowerCase());
        if (mealIndex !== -1) {
            // Update the itemName for this meal
           const res =  menu.mealAndItem[mealIndex].itemName = itemName;
        } else {
            const res = menu.mealAndItem.push({ meal, itemName });
        }
        

        res.status(200).json({ message: 'Menu updated successfully', menu });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = {getMenu, addMenu, updateMenu, fetchMenuOfSelectedDay};
