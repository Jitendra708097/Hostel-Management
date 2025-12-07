import { useState } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const FeeStructureCard = ({ feeStructure, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    structureName: feeStructure.structureName,
    description: feeStructure.description,
    components: {
      admissionFee: feeStructure.components.admissionFee,
      securityDeposit: feeStructure.components.securityDeposit,
      hostelFee: feeStructure.components.hostelFee,
    }
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({
      structureName: feeStructure.structureName,
      description: feeStructure.description,
      components: {
        admissionFee: feeStructure.components.admissionFee,
        securityDeposit: feeStructure.components.securityDeposit,
        hostelFee: feeStructure.components.hostelFee,
      }
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      // Calculate total amount before sending
      const totalAmount = editData.components.admissionFee + 
                         editData.components.securityDeposit + 
                         editData.components.hostelFee;
      
      const updatedData = {
        ...editData,
        totalAmount
      };

      await onUpdate(feeStructure._id, updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${feeStructure.structureName}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(feeStructure._id);
      } catch (error) {
        console.error('Delete error:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('components.')) {
      const componentName = name.split('.')[1];
      setEditData(prev => ({
        ...prev,
        components: {
          ...prev.components,
          [componentName]: parseFloat(value) || 0
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateTotal = () => {
    return (editData.components.admissionFee || 0) + 
           (editData.components.securityDeposit || 0) + 
           (editData.components.hostelFee || 0);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl">
        <div className="space-y-4">
          {/* Structure Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Structure Name *
            </label>
            <input
              type="text"
              name="structureName"
              value={editData.structureName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={editData.description || ''}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {editData.description?.length || 0}/100 characters
            </p>
          </div>

          {/* Fee Components */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admission Fee
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                <input
                  type="number"
                  name="components.admissionFee"
                  value={editData.components.admissionFee}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                <input
                  type="number"
                  name="components.securityDeposit"
                  value={editData.components.securityDeposit}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hostel Fee
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                <input
                  type="number"
                  name="components.hostelFee"
                  value={editData.components.hostelFee}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Total Amount (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{calculateTotal().toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleCancel}
              className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center space-x-2"
            >
              <XMarkIcon className="h-5 w-5" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
            >
              <CheckIcon className="h-5 w-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{feeStructure.structureName}</h3>
          {feeStructure.description && (
            <p className="text-gray-600 mt-1">{feeStructure.description}</p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="cursor-pointer p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`cursor-pointer p-2 text-red-600 hover:bg-red-50 rounded-lg transition ${
              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Admission Fee</p>
          <p className="text-2xl font-bold text-blue-700">
            ₹{feeStructure.components.admissionFee.toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600 font-medium">Security Deposit</p>
          <p className="text-2xl font-bold text-yellow-700">
            ₹{feeStructure.components.securityDeposit.toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Hostel Fee</p>
          <p className="text-2xl font-bold text-purple-700">
            ₹{feeStructure.components.hostelFee.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-linear-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold text-gray-700">Total Amount</p>
            <p className="text-sm text-gray-500">Sum of all components</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">
              ₹{feeStructure.totalAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-green-500">Payable amount</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeStructureCard;