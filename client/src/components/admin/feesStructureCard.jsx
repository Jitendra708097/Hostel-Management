import { useState } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const FeeStructureCard = ({ feeStructure, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editData, setEditData] = useState({
    structureName: feeStructure.structureName,
    description: feeStructure.description,
    components: {
      admissionFee: feeStructure.components.admissionFee,
      securityDeposit: feeStructure.components.securityDeposit,
      hostelFee: feeStructure.components.hostelFee,
    },
  });

  const handleCancel = () => {
    setEditData({
      structureName: feeStructure.structureName,
      description: feeStructure.description,
      components: {
        admissionFee: feeStructure.components.admissionFee,
        securityDeposit: feeStructure.components.securityDeposit,
        hostelFee: feeStructure.components.hostelFee,
      },
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const totalAmount = editData.components.admissionFee +
        editData.components.securityDeposit +
        editData.components.hostelFee;

      await onUpdate(feeStructure._id, { ...editData, totalAmount });
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(feeStructure._id);
    } catch (error) {
      console.error('Delete error:', error);
      setIsDeleting(false);
    } finally {
      setConfirmDelete(false);
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
          [componentName]: parseFloat(value) || 0,
        },
      }));
    } else {
      setEditData(prev => ({ ...prev, [name]: value }));
    }
  };

  const calculateTotal = () => (
    (editData.components.admissionFee || 0) +
    (editData.components.securityDeposit || 0) +
    (editData.components.hostelFee || 0)
  );

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-md">
        <div className="space-y-4">
          <Field label="Structure Name *">
            <input
              type="text"
              name="structureName"
              value={editData.structureName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
              required
            />
          </Field>

          <Field label="Description">
            <textarea
              name="description"
              value={editData.description || ''}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
              maxLength={100}
            />
            <p className="text-xs text-slate-500 mt-1">{editData.description?.length || 0}/100 characters</p>
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ['Admission Fee', 'admissionFee'],
              ['Security Deposit', 'securityDeposit'],
              ['Hostel Fee', 'hostelFee'],
            ].map(([label, key]) => (
              <Field key={key} label={label}>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500">Rs.</span>
                  <input
                    type="number"
                    name={`components.${key}`}
                    value={editData.components[key]}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-11 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                  />
                </div>
              </Field>
            ))}
          </div>

          <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-700">Total Amount:</span>
              <span className="text-2xl font-bold text-cyan-700">Rs. {calculateTotal().toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button onClick={handleCancel} className="cursor-pointer px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition flex items-center space-x-2">
              <XMarkIcon className="h-5 w-5" />
              <span>Cancel</span>
            </button>
            <button onClick={handleSave} className="cursor-pointer px-4 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition flex items-center space-x-2">
              <CheckIcon className="h-5 w-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{feeStructure.structureName}</h3>
          {feeStructure.description && <p className="text-slate-600 mt-1">{feeStructure.description}</p>}
        </div>

        <div className="flex space-x-2">
          <button onClick={() => setIsEditing(true)} className="cursor-pointer p-2 text-cyan-700 hover:bg-cyan-50 rounded-lg transition" title="Edit">
            <PencilIcon className="h-5 w-5" />
          </button>
          <button onClick={() => setConfirmDelete(true)} disabled={isDeleting} className={`cursor-pointer p-2 text-red-600 hover:bg-red-50 rounded-lg transition ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`} title="Delete">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-cyan-50 p-4 rounded-lg">
          <p className="text-sm text-cyan-700 font-medium">Admission Fee</p>
          <p className="text-2xl font-bold text-cyan-800">Rs. {feeStructure.components.admissionFee.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg">
          <p className="text-sm text-amber-700 font-medium">Security Deposit</p>
          <p className="text-2xl font-bold text-amber-800">Rs. {feeStructure.components.securityDeposit.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-slate-600 font-medium">Hostel Fee</p>
          <p className="text-2xl font-bold text-slate-800">Rs. {feeStructure.components.hostelFee.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-linear-to-r from-emerald-50 to-cyan-50 p-4 rounded-lg border border-emerald-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold text-slate-700">Total Amount</p>
            <p className="text-sm text-slate-500">Sum of all components</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-600">Rs. {feeStructure.totalAmount.toLocaleString('en-IN')}</p>
            <p className="text-sm text-emerald-600">Payable amount</p>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Delete fee structure?</h3>
            <p className="mt-1 text-sm text-slate-600">This will remove "{feeStructure.structureName}" from the admin list.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{isDeleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructureCard;
