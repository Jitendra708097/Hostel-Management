import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { School, LogIn, Mail, Lock, Eye, EyeOff, CheckCircle, Info } from 'lucide-react'; // Added CheckCircle, Info
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/authSlicer';
import axiosClient from '../../config/axiosClient';

// Schemas for different forms
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
});

const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(5, 'New password is required').max(10, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(5, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [viewState, setViewState] = useState('login'); // 'login', 'forgotPassword', 'linkSent', 'resetPassword', 'passwordChanged'
  const [passwordResetToken, setPasswordResetToken] = useState(null); // To store token from URL

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticate, loading, error } = useSelector(state => state.auth);

  // Reverted to original image URL
  const hostelImageUrl = "https://tse3.mm.bing.net/th/id/OIP.urH91B0nX8NDU8y5SYw3qgAAAA?rs=1&pid=ImgDetMain&o=7&rm=3";

  // Form hooks for different sections
  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const forgotPasswordForm = useForm({ resolver: zodResolver(forgotPasswordSchema) });
  const resetPasswordForm = useForm({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    if (token) {
      setPasswordResetToken(token);
      setViewState('resetPassword');
    }
  }, [viewState]);

  const onLoginSubmit = async (data) => {
    dispatch(loginUser(data));
  }

  const onForgotPasswordSubmit = async (data) => {
    // Simulate API call to send reset link
    console.log("Sending password reset link to:", data);
    const response = await axiosClient.post('/user/forgot-password',data);
    console.log("Response: ", response.data);
    setViewState('linkSent');
    forgotPasswordForm.reset();
  };

  const onResetPasswordSubmit = async (data) => {
    // Simulate API call to reset password
    console.log("Resetting password with token:", passwordResetToken, "and new password:", data.newPassword);
    setViewState('passwordChanged');
    resetPasswordForm.reset();
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex items-center justify-center min-h-screen bg-gray-900" // Original background
    >
      <div className="flex w-full max-w-4xl h-screen md:h-auto md:max-h-[700px] bg-white/90 rounded-lg shadow-2xl backdrop-blur-lg overflow-hidden border border-gray-200/50"> {/* Original card styles */}
        {/* Image Panel */}
        <motion.div
          variants={itemVariants}
          className="hidden md:block w-1/2 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: `url(${hostelImageUrl})` }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-black/60"> {/* Original gradient */}
            <div className="flex items-end h-full p-8">
              <motion.h1
                variants={itemVariants}
                className="text-3xl font-bold text-white leading-tight" // Original text style
              >
                A vibrant community awaits. Welcome back.
              </motion.h1>
            </div>
          </div>
        </motion.div>

        {/* Form Panel */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center relative"> {/* Original form panel styles */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <Link to="/" className="inline-block md:hidden">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-primary-100 rounded-full" // Original school icon styling
              >
                <School size={48} className="text-primary-600" /> {/* Original school icon styling */}
              </motion.div>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-primary-600 to-purple-600"> {/* Original title styling */}
              Welcome to RSD Hostel
            </h2>
          </motion.div>

          <AnimatePresence mode="wait">
            {viewState === 'login' && (
              <motion.form
                key="loginForm"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-6" // Original spacing
              >
                {/* Email Input */}
                <motion.div variants={itemVariants} className="space-y-1"> {/* Original spacing */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /> {/* Original icon positioning */}
                    <input
                      type="email"
                      {...loginForm.register('email')}
                      className={`block w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all duration-300
                        ${loginForm.formState.errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white/50'}
                        focus:ring-2 focus:ring-primary-500/30
                        text-gray-900`} // Original input styles
                      placeholder="Enter your email"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 ml-1" // Original error message style
                    >
                      {loginForm.formState.errors.email.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Password Input */}
                <motion.div variants={itemVariants} className="space-y-1"> {/* Original spacing */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /> {/* Original icon positioning */}
                    <input
                      type={showPassword ? "text" : "password"}
                      {...loginForm.register('password')}
                      className={`block w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-all duration-300
                        ${loginForm.formState.errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white/50'}
                        focus:ring-2 focus:ring-primary-500/30
                        text-gray-900`} // Original input styles
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none" // Original eye button style
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 ml-1" // Original error message style
                    >
                      {loginForm.formState.errors.password.message}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="text-right text-sm">
                  <button
                    type="button"
                    onClick={() => setViewState('forgotPassword')}
                    className="text-primary-600 hover:text-primary-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-md p-1" // Original link color
                  >
                    Forgot Password?
                  </button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`cursor-pointer w-full flex justify-center items-center py-3 px-4 rounded-lg bg-blue-100 text-blue-400 font-medium transition-all duration-300 shadow-lg hover:shadow-primary-500/25`} // Original button style
                    disabled={loading}
                  >
                    <span className={`flex items-center gap-2`}>
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <LogIn className="h-5 w-5" />
                          Sign in
                        </>
                      )}
                    </span>
                  </motion.button>
                  {error?.error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 mt-3 text-center" // Original error message style
                    >
                      {error?.error}
                    </motion.p>
                  )}
                </motion.div>
              </motion.form>
            )}

            {viewState === 'forgotPassword' && (
              <motion.div
                key="forgotPasswordForm"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6" // Original spacing
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Reset Your Password</h3>
                <p className="text-gray-600 text-center mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-6">
                  <motion.div variants={itemVariants} className="space-y-1"> {/* Original spacing */}
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        {...forgotPasswordForm.register('email')}
                        className={`block w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all duration-300 bg-amber-600
                          ${forgotPasswordForm.formState.errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-400'}
                          focus:ring-2 focus:ring-primary-500/30
                          text-gray-900`} // Original input styles
                        placeholder="Enter your email"
                      />
                    </div>
                    {forgotPasswordForm.formState.errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 ml-1" // Original error message style
                      >
                        {forgotPasswordForm.formState.errors.email.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 shadow-lg bg-green-500 hover:bg-green-600
                                 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} // New button style with green for reset
                      disabled={loading}
                    >
                      <span className={`flex items-center gap-2`}>
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending Link...
                          </>
                        ) : (
                          <>
                            <Mail className="h-5 w-5" />
                            Send Reset Link
                          </>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                  <motion.div variants={itemVariants} className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => setViewState('login')}
                      className="text-primary-600 hover:text-primary-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-md p-1" // Original link color
                    >
                      Back to Login
                    </button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {viewState === 'linkSent' && (
              <motion.div
                key="linkSentMessage"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800" // Styled message box
              >
                <div className="flex justify-center mb-4">
                  <Mail size={64} className="text-blue-500" /> {/* Mail icon for link sent */}
                </div>
                <h3 className="text-2xl font-bold">Password Reset Link Sent!</h3>
                <p className="px-4">
                  We've sent a password reset link to your email address. Please check your inbox (and spam folder) to continue.
                </p>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setViewState('login')}
                  className="mt-6 w-full flex justify-center items-center py-3 px-4 rounded-lg text-blue-400 font-medium transition-all duration-300 shadow-lg hover:shadow-primary-500/25" // Original button style
                >
                  <LogIn className="h-5 w-5 mr-2" /> Back to Login
                </motion.button>
              </motion.div>
            )}

            {viewState === 'resetPassword' && (
              <motion.div
                key="resetPasswordForm"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6" // Original spacing
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Set New Password</h3>
                <p className="text-gray-600 text-center mb-6">
                  Please enter your new password below.
                </p>
                <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-6">
                  {passwordResetToken && (
                     <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-300"> {/* Info message for token */}
                        <Info size={18} />
                        <span className="truncate">Using reset token: {passwordResetToken.substring(0,10)}...</span>
                     </div>
                  )}
                  {/* New Password Input */}
                  <motion.div variants={itemVariants} className="space-y-1"> {/* Original spacing */}
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        {...resetPasswordForm.register('newPassword')}
                        className={`block w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-all duration-300
                          ${resetPasswordForm.formState.errors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white/50'}
                          focus:ring-2 focus:ring-primary-500/30
                          text-gray-900`} // Original input styles
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
                  <motion.div variants={itemVariants} className="space-y-1"> {/* Original spacing */}
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...resetPasswordForm.register('confirmPassword')}
                        className={`block w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-all duration-300
                          ${resetPasswordForm.formState.errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white/50'}
                          focus:ring-2 focus:ring-primary-500/30
                          text-gray-900`} // Original input styles
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

                  <motion.div variants={itemVariants}>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 shadow-lg bg-green-500 hover:bg-green-600
                                 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} // New button style with green for reset
                      disabled={loading}
                    >
                      <span className={`flex items-center gap-2`}>
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Setting Password...
                          </>
                        ) : (
                          <>
                            <Lock className="h-5 w-5" />
                            Reset Password
                          </>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {viewState === 'passwordChanged' && (
              <motion.div
                key="passwordChangedMessage"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center p-4 rounded-lg bg-green-50 border border-green-200 text-green-800" // Styled message box
              >
                <div className="flex justify-center mb-4">
                  <CheckCircle size={64} className="text-green-500" /> {/* CheckCircle icon for success */}
                </div>
                <h3 className="text-2xl font-bold">Password Changed Successfully!</h3>
                <p className="px-4">
                  Your password has been updated. You can now log in with your new password.
                </p>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setViewState('login')}
                  className="mt-6 w-full flex justify-center items-center py-3 px-4 rounded-lg text-blue-400 font-medium transition-all duration-300 shadow-lg hover:shadow-primary-500/25" // Original button style
                >
                  <LogIn className="h-5 w-5 mr-2" /> Go to Login
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Decorative Background Elements (Original styles maintained) */}
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

export default AdminLoginPage;