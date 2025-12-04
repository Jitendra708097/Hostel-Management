import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { School, LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/authSlicer'; 
import axiosClient from '../../config/axiosClient';

// Schemas for different forms
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Enter your email')
    .email('Invalid email format'),
  password: z.string()
    .min(1, 'Enter your password')
    .min(6, 'Password must be at least 6 characters, lowercase, uppercase, number and special characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Enter your email')
    .email('Invalid email format'),
});

const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [viewState, setViewState] = useState('login');
  const [apiMessage, setApiMessage] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const { isAuthenticate, loading, error } = useSelector(state => state.auth);

  const hostelImageUrl = "https://tse3.mm.bing.net/th/id/OIP.urH91B0nX8NDU8y5SYw3qgAAAA?rs=1&pid=ImgDetMain&o=7&rm=3";

  // Form hooks for different sections
  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const forgotPasswordForm = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  // Clear API messages when changing views
  useEffect(() => {
    setApiMessage({ type: '', message: '' });
  }, [viewState]);


  // Handlers for form submissions 
  const onLoginSubmit = async (data) => {
    dispatch(loginUser(data));
  }

  const onForgotPasswordSubmit = async (data) => {
    setIsSubmitting(true);
    setApiMessage({ type: '', message: '' });
    
    try {
      const response = await axiosClient.post('/user/forgot-password', data);
      console.log("Response: ", response.data);
      setViewState('linkSent');
      forgotPasswordForm.reset();
      setApiMessage({ 
        type: 'success', 
        message: response.data?.message || 'Password reset link sent successfully!' 
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      setApiMessage({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to send reset link. Please try again.' 
      });
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
                A vibrant community awaits. Welcome back.
              </motion.h1>
            </div>
          </div>
        </motion.div>

        {/* Form Panel */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center relative">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <Link to="/" className="inline-block md:hidden">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-primary-100 rounded-full"
              >
                <School size={48} className="text-primary-600" />
              </motion.div>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-primary-600 to-purple-600">
              Welcome to RSD Hostel
            </h2>
          </motion.div>

          {/* API Message Display */}
          <AnimatePresence>
            {apiMessage.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-3 rounded-lg mb-4 text-center ${
                  apiMessage.type === 'error' 
                    ? 'bg-red-100 text-red-700 border border-red-300' 
                    : 'bg-green-100 text-green-700 border border-green-300'
                }`}
              >
                {apiMessage.message}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {viewState === 'login' && (
              <motion.form
                key="loginForm"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-6"
              >
                {/* Email Input */}
                <motion.div variants={itemVariants} className="space-y-1">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      {...loginForm.register('email')}
                      className={`block w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all duration-300
                        ${loginForm.formState.errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white/50'}
                        focus:ring-2 focus:ring-primary-500/30
                        text-gray-900`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 ml-1"
                    >
                      {loginForm.formState.errors.email.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Password Input */}
                <motion.div variants={itemVariants} className="space-y-1">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      {...loginForm.register('password')}
                      className={`block w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-all duration-300
                        ${loginForm.formState.errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white/50'}
                        focus:ring-2 focus:ring-primary-500/30
                        text-gray-900`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
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
                      className="text-xs text-red-500 ml-1"
                    >
                      {loginForm.formState.errors.password.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* forget password link */}
                <motion.div variants={itemVariants} className="text-right text-sm">
                  <button
                    type="button"
                    onClick={() => setViewState('forgotPassword')}
                    className="cursor-pointer text-primary-600 hover:text-primary-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-md p-1"
                  >
                    Forgot Password?
                  </button>
                </motion.div>
                {/* Sign in Button */}
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`cursor-pointer w-full flex justify-center items-center py-3 px-4 rounded-lg bg-blue-100 text-blue-400 font-medium transition-all duration-300 shadow-lg hover:shadow-primary-500/25 ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                    disabled={loading}
                  >
                    <span className="flex items-center gap-2">
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
                      className="text-xs text-red-500 mt-3 text-center"
                    >
                      {error?.error}
                    </motion.p>
                  )}
                </motion.div>

                 {/* Register Link */}
                <motion.div variants={itemVariants} className="text-center text-sm">
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link
                    to="/register"  
                    className="text-blue-800 hover:text-primary-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-md p-1"
                  >
                    Register Here
                  </Link>
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
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Reset Your Password</h3>
                <p className="text-gray-600 text-center mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-6">
                  <motion.div variants={itemVariants} className="space-y-1">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        {...forgotPasswordForm.register('email')}
                        className={`block w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all duration-300
                          ${forgotPasswordForm.formState.errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white/50'}
                          focus:ring-2 focus:ring-primary-500/30
                          text-gray-900`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {forgotPasswordForm.formState.errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 ml-1"
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
                      className="text-primary-600 hover:text-primary-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-md p-1"
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
                className="space-y-6 text-center p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800"
              >
                <div className="flex justify-center mb-4">
                  <Mail size={64} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold">Password Reset Link Sent!</h3>
                <p className="px-4">
                  We've sent a password reset link to your email address. Please check your inbox (and spam folder) to continue.
                </p>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setViewState('login')}
                  className="mt-6 w-full flex justify-center items-center py-3 px-4 rounded-lg text-blue-400 font-medium transition-all duration-300 shadow-lg hover:shadow-primary-500/25"
                >
                  <LogIn className="h-5 w-5 mr-2" /> Back to Login
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
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

export default AdminLoginPage;