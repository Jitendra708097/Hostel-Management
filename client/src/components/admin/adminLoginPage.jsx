import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router'; // Corrected import for Link and useNavigate
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { School, LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'; // Removed Loader2 as it's not used
import { motion } from 'framer-motion'; // Removed AnimatePresence as it's not used directly here
import { useDispatch, useSelector } from 'react-redux';
import { adminLoginUser } from '../../redux/authSlicer';
import hostelImageUrl from '../../assests/HostelImages/hostel1.png';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const AdminLoginPage = () => {

  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticate, loading, error } = useSelector(state => state.auth);
  // console.log("Error: ",error?.error);  this line for debugging 
  // Using a more modern and high-quality image placeholder
  // const hostelImageUrl = "https://images.unsplash.com/photo-1579761922659-dc7a0665f979?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const { register, handleSubmit, formState: { errors }, } = useForm({ resolver: zodResolver(loginSchema) });

  // useEffect(() => {
  //   if (isAuthenticate) {
  //     navigate('/'); // Corrected navigation
  //   }
  // }, [isAuthenticate, navigate]);

  const onSubmit = async (data) => {
    dispatch(adminLoginUser(data));
  }

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
    hidden: { opacity: 0, y: 20 },
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
      className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-900 to-black p-4" // Enhanced background
    >
      <div className="flex w-full max-w-5xl h-[calc(100vh-2rem)] md:h-[650px] bg-white/5 rounded-2xl shadow-3xl backdrop-blur-xl overflow-hidden border border-gray-700/50 transform transition-all duration-500 hover:scale-[1.005]"> {/* Enhanced card styles */}
        {/* Image Panel */}
        <motion.div
          variants={itemVariants}
          className="hidden md:block w-1/2 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: `url(${hostelImageUrl})` }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end h-full p-8"> {/* Enhanced gradient */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-extrabold text-white leading-tight drop-shadow-lg" // Enhanced text style
            >
              A vibrant community awaits. Welcome back.
            </motion.h1>
          </div>
        </motion.div>

        {/* Form Panel */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 lg:p-12 flex flex-col justify-center relative bg-gray-900/90"> {/* Darker form panel background */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <Link to="/" className="inline-block md:hidden">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-blue-600/10 rounded-full shadow-lg" // Enhanced school icon styling
              >
                <School size={52} className="text-blue-500" />
              </motion.div>
            </Link>
            <h2 className="mt-6 text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-purple-600 drop-shadow-md"> {/* Enhanced title */}
              Welcome to RSD Hostel
            </h2>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7"> {/* Increased spacing */}

            {/* Email */}
            <motion.div variants={itemVariants} className="space-y-2"> {/* Increased spacing */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /> {/* Icon adjusted */}
                <input
                  type="email"
                  className={`block w-full pl-12 pr-12 py-3.5 border rounded-xl outline-none transition-all duration-300 bg-gray-800 text-white placeholder-gray-500
                    ${errors.email ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-700 focus:ring-blue-500/30'}
                    focus:border-blue-500`} // Enhanced input styles
                  placeholder="Enter your email"
                   {...register('email')}
                />
              </div>
              {errors.email && ( // Corrected conditional rendering
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 ml-1.5" // Enhanced error message style
                >
                  {errors.email?.message}
                </motion.p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="space-y-2"> {/* Increased spacing */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /> {/* Icon adjusted */}
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                  className={`block w-full pl-12 pr-12 py-3.5 border rounded-xl outline-none transition-all duration-300 bg-gray-800 text-white placeholder-gray-500
                    ${errors.password ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-700 focus:ring-blue-500/30'}
                    focus:border-blue-500`} // Enhanced input styles
                  placeholder="Enter your password"
                />
                {/* Eye option in password field */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors focus:outline-none" // Enhanced button style
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && ( // Corrected conditional rendering
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 ml-1.5" // Enhanced error message style
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              {/* Button Sign In  */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(99, 102, 241, 0.4)" }} // Enhanced hover effect
                whileTap={{ scale: 0.98 }}
                className={`cursor-pointer w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg
                           bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                           ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} // Enhanced button styles, added loading state
                disabled={loading}
              >
                <span className={`flex items-center gap-2`}>
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

              {/* this function is showing error on the screen which from server. */}
              {error?.error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 mt-3 text-center"
                >
                  {error?.error}
                </motion.p>
              )}
            </motion.div>
          </form>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.2 }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full mix-blend-screen filter blur-3xl opacity-50" // Enhanced colors and blend mode
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-3xl opacity-50" // Enhanced colors and blend mode
        />
         <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-40" // Added another decorative element
        />
      </div>
    </motion.div>
  );
};

export default AdminLoginPage;