import { useState, useEffect } from 'react';
import axiosClient from '../../config/axiosClient';

const WeeklyMenuPage = () => {
  const [menuData, setMenuData] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Days of the week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Get current day
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    return days[today];
  };

  // Fetch menu data from backend
  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/menu/show'); // Replace with your API endpoint
      setMenuData(response.data);
      setSelectedDay(getCurrentDay());
    } catch (err) {
      setError('Failed to fetch menu data');
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  // Get today's menu by default
  useEffect(() => {
    if (menuData.length > 0 && !selectedDay) {
      setSelectedDay(getCurrentDay());
    }
  }, [menuData, selectedDay]);

  // Get selected day's menu
  const getSelectedDayMenu = () => {
    return menuData.find(menu => menu.days === selectedDay);
  };

  // Group meals by type for a specific day
  const groupMealsByType = (dayMenu) => {
    if (!dayMenu || !dayMenu.mealAndItem) return {};
    
    return dayMenu.mealAndItem.reduce((acc, item) => {
      const mealType = item.meal.toLowerCase();
      if (!acc[mealType]) {
        acc[mealType] = [];
      }
      acc[mealType].push(item);
      return acc;
    }, {});
  };

  // Get icon for meal type
  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: '🍳',
      lunch: '🍽️',
      snack: '☕',
      dinner: '🌙'
    };
    return icons[mealType] || '📋';
  };

  // Get color for meal type
  const getMealColor = (mealType) => {
    const colors = {
      breakfast: 'from-orange-400 to-amber-500',
      lunch: 'from-green-500 to-emerald-600',
      snack: 'from-yellow-500 to-amber-500',
      dinner: 'from-purple-500 to-indigo-600'
    };
    return colors[mealType] || 'from-blue-500 to-cyan-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
        <button 
          onClick={fetchMenuData}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentMenu = getSelectedDayMenu();
  const groupedMeals = groupMealsByType(currentMenu);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">

      {/* Day Selection Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {daysOfWeek.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`cursor-pointer px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
              selectedDay === day
                ? 'bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <span>{day}</span>
            {day === getCurrentDay() && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Today
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Menu Display */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Day Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-700 text-white p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">{selectedDay}'s Menu</h2>
              <p className="text-blue-100 mt-1">Fresh and nutritious meals</p>
            </div>
            {selectedDay === getCurrentDay() && (
              <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                🎯 Available Today
              </span>
            )}
          </div>
        </div>

        {/* Menu Content */}
        <div className="p-6">
          {currentMenu ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(groupedMeals).map(([mealType, items]) => (
                <div 
                  key={mealType} 
                  className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`inline-flex items-center px-4 py-2 rounded-full bg-linear-to-r ${getMealColor(mealType)} text-white mb-4`}>
                    <span className="text-lg mr-2">{getMealIcon(mealType)}</span>
                    <h3 className="text-lg font-bold capitalize">
                      {mealType}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div 
                        key={item._id} 
                        className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-all duration-200 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                              {item.itemName}
                            </h4>
                            {/* You can add additional details here if available */}
                          </div>
                          <div className="ml-4 shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                              <span className="text-blue-500 group-hover:text-white text-sm font-bold">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-gray-500 text-xl">Menu not available for {selectedDay}</p>
              <p className="text-gray-400 mt-2">Please check back later</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Fresh ingredients daily</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Customizable options available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => setSelectedDay(getCurrentDay())}
          className="cursor-pointer px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold"
        >
          🔄 Back to Today's Menu
        </button>
      </div>
    </div>
  );
};

export default WeeklyMenuPage;