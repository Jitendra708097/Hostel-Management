import { useEffect, useMemo, useState } from 'react';
import { Coffee, Moon, RefreshCw, Salad, Soup, Utensils } from 'lucide-react';
import axiosClient from '../../config/axiosClient';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getCurrentDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

const mealMeta = {
  breakfast: { icon: Coffee, tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  lunch: { icon: Salad, tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  snack: { icon: Soup, tone: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  dinner: { icon: Moon, tone: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

const WeeklyMenuPage = () => {
  const [menuData, setMenuData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosClient.get('/menu/show');
      setMenuData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError(err?.response?.data?.message || 'Failed to fetch menu data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const currentMenu = useMemo(
    () => menuData.find((menu) => menu.days === selectedDay),
    [menuData, selectedDay]
  );

  const groupedMeals = useMemo(() => {
    if (!currentMenu?.mealAndItem) return {};

    return currentMenu.mealAndItem.reduce((acc, item) => {
      const mealType = item.meal?.toLowerCase() || 'meal';
      if (!acc[mealType]) acc[mealType] = [];
      acc[mealType].push(item);
      return acc;
    }, {});
  }, [currentMenu]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Loading weekly menu...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchMenuData}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-cyan-700">Mess Menu</p>
          <h1 className="text-3xl font-bold text-slate-900">Weekly Food Schedule</h1>
          <p className="mt-1 text-slate-600">Check meals planned for each day of the week.</p>
        </header>

        <div className="mb-8 flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`cursor-pointer rounded-md border px-4 py-2 text-sm font-semibold transition ${
                selectedDay === day
                  ? 'border-cyan-700 bg-cyan-700 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
              }`}
            >
              {day}
              {day === getCurrentDay() && (
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${selectedDay === day ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                  Today
                </span>
              )}
            </button>
          ))}
        </div>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-linear-to-r from-blue-700 to-cyan-600 p-6 text-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedDay}'s Menu</h2>
                <p className="text-sky-100">Fresh meals from the hostel mess.</p>
              </div>
              {selectedDay === getCurrentDay() && (
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white">
                  <Utensils className="h-4 w-4" />
                  Available Today
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {currentMenu && Object.keys(groupedMeals).length > 0 ? (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {Object.entries(groupedMeals).map(([mealType, items]) => {
                  const meta = mealMeta[mealType] || { icon: Utensils, tone: 'bg-slate-50 text-slate-700 border-slate-200' };
                  const Icon = meta.icon;
                  return (
                    <div key={mealType} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                      <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold capitalize ${meta.tone}`}>
                        <Icon className="h-4 w-4" />
                        {mealType}
                      </div>
                      <div className="space-y-3">
                        {items.map((item, index) => (
                          <div key={item._id || `${mealType}-${index}`} className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3">
                            <span className="font-medium text-slate-900">{item.itemName}</span>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-700">{index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Utensils className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-lg font-semibold text-slate-700">Menu not available for {selectedDay}</p>
                <p className="mt-1 text-slate-500">Please check back after the mess menu is updated.</p>
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedDay(getCurrentDay())}
            className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-cyan-300 hover:text-cyan-700"
          >
            <RefreshCw className="h-4 w-4" />
            Back to Today's Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMenuPage;
