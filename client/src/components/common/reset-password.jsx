import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { School, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosClient from '../../config/axiosClient';

// Reset Password Schema
const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters'),
  confirmPassword: z.string()
    .min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPasswordPage = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const token = searchParams.get('token');
//   console.log("Reset token from URL:", token);

//   const userId = searchParams.get('userId');
//   console.log("User ID from URL:", userId);
const { token, userId } = useParams();
console.log("Reset token from URL:", token);
console.log("User ID from URL:", userId);

  const resetPasswordForm = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

//   // Verify token on component mount
//   useEffect(() => {
//     if (!token) {
//       setTokenValid(false);
//       setMessage({
//         type: 'error',
//         text: 'Invalid or missing reset token. Please request a new password reset link.'
//       });
//     }
//     // You can add an API call here to verify token validity with backend
//     // verifyToken();
//   }, [token]);

  const onResetPasswordSubmit = async (data) => {
    if (!token) {
      setMessage({
        type: 'error',
        text: 'Invalid reset token'
      });
      return;
    }

    else if (!userId) {
      setMessage({
        type: 'error',
        text: 'Invalid user ID'
        });
        return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axiosClient.post(`/user/reset-password/${token}/${userId}`, {
        token: token,
        newPassword: data.newPassword
      });

      console.log("Password reset response:", response.data);
      
      setMessage({
        type: 'success',
        text: response.data?.message || 'Password reset successfully!'
      });
      setIsSuccess(true);
      resetPasswordForm.reset();

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error("Reset password error:", error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to reset password. The link may have expired. Please request a new one.'
      });
      
      // If token is invalid, mark it as such
      if (error.response?.status === 400 || error.response?.status === 410) {
        setTokenValid(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 20, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const hostelImageUrl = "https://tse3.mm.bing.net/th/id/OIP.urH91B0nX8NDU8y5SYw3qgAAAA?rs=1&pid=ImgDetMain&o=7&rm=3";

  if (isSuccess) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex items-center justify-center min-h-screen bg-gray-900"
      >
        <div className="w-full max-w-md bg-white/90 rounded-lg shadow-2xl backdrop-blur-lg overflow-hidden border border-gray-200/50 p-8">
          <motion.div
            variants={itemVariants}
            className="space-y-6 text-center p-4 rounded-lg bg-green-50 border border-green-200 text-green-800"
          >
            <div className="flex justify-center mb-4">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold">Password Changed Successfully!</h3>
            <p className="px-4">
              Your password has been updated successfully. Redirecting to login page...
            </p>
            <div className="pt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-green-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">Redirecting in 3 seconds</p>
            </div>
            <Link
              to="/login"
              className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Go to Login immediately
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex items-center justify-center min-h-screen bg-gray-900"
    >
      <div className="flex w-full max-w-4xl h-screen md:h-auto md:max-h-[700px] bg-white/90 rounded-lg shadow-2xl backdrop-blur-lg overflow-hidden border border-gray-200/50">
        {/* Image Panel */}
        <motion.div
          variants={itemVariants}
          className="hidden md:block w-1/2 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: `url(${hostelImageUrl})` }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-black/60">
            <div className="flex items-end h-full p-8">
              <motion.h1
                variants={itemVariants}
                className="text-3xl font-bold text-white leading-tight"
              >
                Set your new password and secure your account.
              </motion.h1>
            </div>
          </div>
        </motion.div>

        {/* Form Panel */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center relative">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <Link to="/" className="inline-block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-primary-100 rounded-full"
              >
                <School size={48} className="text-primary-600" />
              </motion.div>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-primary-600 to-purple-600">
              RSD Hostel - Reset Password
            </h2>
            <p className="mt-2 text-gray-600">
              Enter your new password below
            </p>
          </motion.div>

          {/* Message Display */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg mb-4 text-center ${
                message.type === 'error' 
                  ? 'bg-red-100 text-red-700 border border-red-300' 
                  : 'bg-blue-100 text-blue-700 border border-blue-300'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {!tokenValid ? (
            <motion.div
              variants={itemVariants}
              className="text-center space-y-4"
            >
              <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-yellow-800">
                  This password reset link is invalid or has expired.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </motion.div>
          ) : (
            <motion.form
              key="resetPasswordForm"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)}
              className="space-y-6"
            >
              {/* New Password Input */}
              <motion.div variants={itemVariants} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    {...resetPasswordForm.register('newPassword')}
                    className={`block w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-all duration-300
                      ${resetPasswordForm.formState.errors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white/50'}
                      focus:ring-2 focus:ring-primary-500/30
                      text-gray-900`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {resetPasswordForm.formState.errors.newPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 ml-1"
                  >
                    {resetPasswordForm.formState.errors.newPassword.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div variants={itemVariants} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...resetPasswordForm.register('confirmPassword')}
                    className={`block w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-all duration-300
                      ${resetPasswordForm.formState.errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white/50'}
                      focus:ring-2 focus:ring-primary-500/30
                      text-gray-900`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {resetPasswordForm.formState.errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 ml-1"
                  >
                    {resetPasswordForm.formState.errors.confirmPassword.message}
                  </motion.p>
                )}
              </motion.div>

              {/* button Submit and Back to Login  */}
              <motion.div variants={itemVariants} className="space-y-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`cursor-pointer w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 shadow-lg bg-green-500 hover:bg-green-600
                             ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting}
                >
                  <span className="flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        Reset Password
                      </>
                    )}
                  </span>
                </motion.button>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm justify-center w-full"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </motion.div>
            </motion.form>
          )}
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl"
        />
      </div>
    </motion.div>
  );
};

export default ResetPasswordPage;