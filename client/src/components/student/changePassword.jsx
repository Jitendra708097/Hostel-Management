import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import axiosClient from '../../config/axiosClient';
import { KeyRound, X } from 'lucide-react';

// Define Zod validation schema
const passwordChangeSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


const PasswordChangeForm = () => {
  const [showInputs, setShowInputs] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [notice, setNotice] = useState(null);

  const { user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordChangeSchema),
  });

  const handleChangePasswordClick = () => {
    setShowInputs(true);
  };

  const handleCancelClick = () => {
    setShowInputs(false);
    reset();
  };

  const onSubmit = async (data) => {
    setIsChanging(true);
    try {
      
      // Simulate API call
      const response = await axiosClient.put(`/user/change-password/${user._id}`,data);

      // On success
      setNotice({ type: 'success', message: response.data?.message || 'Password changed successfully.' });
      setShowInputs(false);
      reset();
    } catch (error) {
      console.error('Error changing password:', error);
      setNotice({ type: 'error', message: error?.response?.data?.error || 'Failed to change password. Please try again.' });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-5">
      {notice && (
        <div className={`mb-5 flex items-center justify-between rounded-lg border p-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message"><X className="h-4 w-4" /></button>
        </div>
      )}
      {!showInputs ? (
        <button
          onClick={handleChangePasswordClick}
          className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-4 py-3 font-semibold text-cyan-800 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors duration-200"
          type="button"
        >
          <KeyRound className="h-4 w-4" />
          Change Password
        </button>
      ) : (
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="bg-white p-6 rounded-lg shadow-sm border border-slate-200"
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Change Password</h2>
          
          <div className="space-y-5">
            {/* Old Password Field */}
            <div>
              <label 
                htmlFor="oldPassword" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Old Password
              </label>
              <input
                id="oldPassword"
                type="password"
                {...register('oldPassword')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.oldPassword 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-300 focus:border-cyan-500 focus:ring-cyan-500/30'
                } ${(isSubmitting || isChanging) ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                placeholder="Enter your current password"
                disabled={isSubmitting || isChanging}
              />
              {errors.oldPassword && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.oldPassword.message}
                </p>
              )}
            </div>

            {/* New Password Field */}
            <div>
              <label 
                htmlFor="newPassword" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.newPassword 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-300 focus:border-cyan-500 focus:ring-cyan-500/30'
                } ${(isSubmitting || isChanging) ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                placeholder="Enter your new password"
                disabled={isSubmitting || isChanging}
              />
              {errors.newPassword && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.newPassword.message}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.confirmPassword 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-slate-300 focus:border-cyan-500 focus:ring-cyan-500/30'
                } ${(isSubmitting || isChanging) ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                placeholder="Confirm your new password"
                disabled={isSubmitting || isChanging}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || isChanging}
              className="cursor-pointer flex-1 bg-cyan-700 text-white py-3 px-4 rounded-md font-semibold hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-cyan-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {(isSubmitting || isChanging) ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Changing...
                </>
              ) : 'Change Password'}
            </button>
            
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={isSubmitting || isChanging}
              className="cursor-pointer flex-1 bg-white border border-slate-300 text-slate-800 py-3 px-4 rounded-md font-semibold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PasswordChangeForm;
