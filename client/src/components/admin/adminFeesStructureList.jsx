import { useState, useEffect } from 'react';
import FeeStructureCard from './feesStructureCard';
import axiosClient from '../../config/axiosClient';

const FeeStructureList = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch fee structures on component mount
  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/fees/structures');
      console.log("Res: ",response);
      if (response.statusText != 'OK') throw new Error('Failed to fetch');
      console.log("Res0: ",response.data.data);
      setFeeStructures(response.data.data);
      console.log("Hii")
    } catch (err) {
        // console.log("error")
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
        console.log("delete")
      const response = await axiosClient.delete(`/fees/structure/${id}/delete`);

      if (response.statusText != 'OK') throw new Error('Delete failed');

      // Remove from state
      setFeeStructures(prev => prev.filter(item => item._id !== id));
      
      // Show success message
      alert('Fee structure deleted successfully');
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
      throw error;
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
        console.log("update")
      const response = await axiosClient.put(`/fees/${id}/update`,updatedData);
      if (response.statusText != 'OK') throw new Error('Update failed');
      // Update in state
      setFeeStructures(prev =>
        prev.map(item =>
          item._id === id ? response?.data?.data : item
        )
      );
      
      // Show success message
      alert('Fee structure updated successfully');
      return response?.data?.data;
    } catch (error) {
      alert(`Update failed: ${error.message}`);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
// console.log("error: ",error);
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-700">Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchFeeStructures}
          className="cursor-pointer mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (feeStructures.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">💰</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Fee Structures Found</h3>
        <p className="text-gray-500">Create your first fee structure to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fee Structures</h2>
          <p className="text-gray-600">Manage and edit all fee structures</p>
        </div>
        <div className="text-sm text-gray-500">
          Showing {feeStructures.length} structure{feeStructures.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {feeStructures.map((structure) => (
          <FeeStructureCard
            key={structure?._id}
            feeStructure={structure}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default FeeStructureList;