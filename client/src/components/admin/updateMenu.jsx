import { useState, useEffect } from 'react';
import axiosClient from '../../config/axiosClient';
import AdminHeader from './AdminHeader';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

const UpdateMenu = () => {
	const [day, setDay] = useState(WEEKDAYS[0]);
	const [meal, setMeal] = useState(MEALS[0]);
	const [itemName, setItemName] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');
	const [menuForDay, setMenuForDay] = useState(null);

	useEffect(() => {
		fetchMenu(day);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchMenu = async (selectedDay) => {
		setError('');
		setMenuForDay(null);
		try {
			const res = await axiosClient.get(`/menu/fetch/${selectedDay}`);
			// API returns array of menu documents for the day
			const data = Array.isArray(res.data) ? res.data[0] : res.data;
			setMenuForDay(data || null);
		} catch (err) {
			if (err.response && err.response.status === 404) {
				setMenuForDay(null);
			} else {
				console.error('Failed to fetch menu:', err);
				setError('Failed to fetch menu for selected day.');
			}
		}
	};

	const handleFetchClick = async (e) => {
		e.preventDefault();
		await fetchMenu(day);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setSuccess('');
		setError('');
		try {
			// Server expects { day, meal, itemName } in the body for update
			const payload = { day, meal, itemName };
			const res = await axiosClient.put('/menu/update', payload);
			setSuccess(res.data?.message || 'Menu updated successfully');
			setItemName('');
			await fetchMenu(day);
		} catch (err) {
			console.error('Update error:', err);
			setError(err.response?.data?.message || 'Failed to update menu');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-slate-50 min-h-screen p-4 sm:p-8">
			<div className="max-w-3xl mx-auto space-y-6">
				<form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow admin-card space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
						<div>
							<label className="block text-sm font-medium text-gray-700">Day</label>
							<select value={day} onChange={(e) => setDay(e.target.value)} className="cursor-pointer mt-1 block w-full rounded-md border-gray-500 p-2">
								{WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Meal</label>
							<select value={meal} onChange={(e) => setMeal(e.target.value)} className="cursor-pointer mt-1 block w-full rounded-md border-gray-300 p-2">
								{MEALS.map(m => <option key={m} value={m}>{m}</option>)}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Item Name</label>
							<input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Masala Dosa" className="mt-1 block w-full rounded-md border-gray-300 p-2" required />
						</div>
					</div>

					<div className="flex items-center gap-3">
						<button type="button" onClick={handleFetchClick} className="cursor-pointer px-4 py-2 rounded bg-white border text-gray-700 hover:bg-gray-50 clickable">Fetch Day Menu</button>
						<button type="submit" disabled={loading} className="cursor-pointer px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 clickable">{loading ? 'Updating...' : 'Add / Update'}</button>
						{success && <p className="text-sm text-green-600">{success}</p>}
						{error && <p className="text-sm text-red-600">{error}</p>}
					</div>
				</form>

				<div className="bg-white p-6 rounded-lg shadow admin-card">
					<h3 className="text-lg font-semibold mb-3">Current Menu for {day}</h3>
					{menuForDay ? (
						<div className="space-y-3">
							{Array.isArray(menuForDay.mealAndItem) && menuForDay.mealAndItem.length > 0 ? (
								menuForDay.mealAndItem.map(mi => (
									<div key={mi.meal} className="flex items-center justify-between p-3 border rounded">
										<div>
											<p className="font-medium">{mi.meal}</p>
											<p className="text-sm text-gray-600">{mi.itemName}</p>
										</div>
										<div className="flex gap-2">
											<button onClick={() => { setMeal(mi.meal); setItemName(mi.itemName); }} className="cursor-pointer px-3 py-1 bg-amber-100 text-amber-700 rounded clickable">Edit</button>
										</div>
									</div>
								))
							) : (
								<p className="text-sm text-gray-500">No items set for this day.</p>
							)}
						</div>
					) : (
						<p className="text-sm text-gray-500">No menu available for this day yet.</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default UpdateMenu;

