
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { registerUser } from '../../redux/authSlicer';
import logoImg from '../../assests/HostelImages/hostelPhoto.png';
import ProfilePhotoUploader from '../../components/common/ProfilePhotoUploader';

// --- ICONS ---
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaCalendarAlt, FaUniversity, FaArrowRight, FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import 'react-image-crop/dist/ReactCrop.css';



// Zod Schema for Validation (Updated with profilePhoto)
const registerSchema = z.object({
  profilePhoto: z.any().refine((file) => file ? file.size <= 5 * 1024 * 1024 : true, `Max image size is 5MB.`).optional(),
  userName: z.string().min(3, { message: 'Student Name is required' }).max(20,{ message: "Student name must be between 3 and 20 characters"}),
  emailId: z.string().min(1, 'Email ID is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  course: z.string().min(1, 'Course is required'),
  year: z.enum(['1', '2', '3', '4'], { errorMap: () => ({ message: 'Please select a valid year' }) }),
  institution: z.enum(['HRIT', 'Virohan'], { errorMap: () => ({ message: 'Please select an institution' }) }),
});

// --- MAIN REGISTRATION FORM COMPONENT ---
const RegisterForm = () => {
  const [started, setStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, register, handleSubmit, formState: { errors }, reset, setError } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticate, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // console.log("Hii");
    // console.log("isAuthenticate: ",isAuthenticate,user);
    if (isAuthenticate && user?.role === 'student') {
      // console.log("Hello");
      navigate("/student/dashboard");
    }
  }, [isAuthenticate]);


  // this is handling api calling and after successful registration re-directed to the student dashboard 
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    console.log("Data: ",data);
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key]) { // Append only if value is not null/undefined
            formData.append(key, data[key]);
        }
    });

    try {
      await dispatch(registerUser(formData)).unwrap(); 
      alert('Registration successful! You can now Access your plateform.');
      reset();
      navigate("/student/dashboard");
    } catch (error) {
      console.error('Registration failed:', error);
      if (error?.message?.includes('already registered')) { // Example error check
        setError('emailId', { type: 'server', message: 'This email is already registered.' });
      } else {
        alert(`Registration failed: ${error?.message || 'An unknown error occurred.'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const asterik = <span className='text-red-500'> *</span>;
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } } };
  const itemVariant = { hidden: { opacity: 0, y: 12, scale: 0.995 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } } };
  const buttonVariants = { hidden: { opacity: 0, y: 20, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20, delay: 0.6 } } };
  const errorShake = { x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.3 } };
  const inputFocus = { scale: 1.01, boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.2)", transition: { duration: 0.2 } };
  const ErrorMessage = ({ message }) => (<motion.p className="mt-2 text-sm text-red-600 bg-red-50/80 inline-block px-2 py-1 rounded-md font-medium" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>{message}</motion.p>);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
      {!started ? (

        // first section with image and welcome to rsd hostel 
        <motion.div 
          className="w-full max-w-3xl bg-white/80 p-12 rounded-2xl shadow-xl backdrop-blur-sm" 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold text-indigo-700 mb-4 text-center">Welcome to RSD Hostel</h1>
          <p className="text-gray-600 mb-6 text-center">Proceed to register as a student to access hostel services.</p>

          <motion.img src={logoImg} alt="RSD Hostel" 
            className="w-40 h-40 mx-auto object-cover rounded-full shadow-md border-4 border-white" 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ delay: 0.3, type: "spring", stiffness: 150 }} 
          />

          {/* proceed button  */}
          <div className="flex flex-col items-center space-y-4 mt-6">
            <motion.button onClick={() => setStarted(true)} 
              className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center cursor-pointer" 
              whileTap={{ scale: 0.98 }}>
                Proceed to Register <FaArrowRight className="ml-3" />
            </motion.button>
            <p className="text-gray-500">Already have an account?{' '} <a href="/login" className="text-indigo-600 hover:underline flex items-center justify-center">Login here <FaSignInAlt className="ml-1" /></a></p>
          </div>
        </motion.div>
      ) : (
        <motion.div
         className="relative bg-white/60 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-4xl backdrop-blur-lg border border-white/10" 
         initial={{ scale: 0.95, opacity: 0 }} 
         animate={{ scale: 1, opacity: 1 }} 
         transition={{ duration: 0.6, ease: 'easeOut' }}>
          <motion.h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8" 
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2, type: "spring" }}>
            Student Registration 
          </motion.h2>

          {/* full registration form  */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div className="flex justify-center" variants={itemVariant}>
             {/* We render the component directly, passing it the props it needs */}
             <ProfilePhotoUploader 
               name="profilePhoto" 
               control={control} 
               setError={setError} 
             />
          </motion.div>
            {errors.profilePhoto && <div className="text-center"><ErrorMessage message={errors.profilePhoto?.message} /></div>}
            
            <motion.div 
              variants={containerVariants}
              initial="hidden" animate="visible" 
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* --- All Input Fields --- */}
              {[{ id: 'userName', label: 'Student Name', type: 'text', icon: FaUser, placeholder: 'John Doe' },
               { id: 'emailId', label: 'Email ID', type: 'email', icon: FaEnvelope, placeholder: 'john.doe@example.com' },
               { id: 'password', label: 'Password', type: 'password', icon: FaLock, placeholder: '••••••••' },
               { id: 'course', label: 'Course', type: 'text', icon: FaGraduationCap, placeholder: 'e.g., Computer Science' }
              ].map(field => (
                <motion.div className="relative" variants={itemVariant} key={field.id}>
                    <label htmlFor={field?.id} className="flex items-center text-sm font-medium text-gray-600 mb-2"><field.icon className="mr-2 text-indigo-500" /> {field.label} {asterik}</label>
                    <div className="relative">
                        <motion.input type={field?.id === 'password' ? (showPassword ? 'text' : 'password') : field.type} 
                        id={field.id}
                        {...register(field.id)} 
                        className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-gray-50 ${errors[field.id] ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'}`} 
                        placeholder={field.placeholder} 
                        whileFocus={inputFocus} 
                        animate={errors[field.id] ? errorShake : {}} />
                        {field?.id === 'password' && <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 p-1">{ showPassword ? FaEyeSlash : FaEye}</button>}
                    </div>
                    {errors[field?.id] && <ErrorMessage message={errors[field?.id]?.message} />}
                </motion.div>
              ))}

              {/* --- Select Fields year 1,2,3,4 --- */}
              <motion.div className="relative" variants={itemVariant}>
                <label htmlFor="year" className="flex items-center text-sm font-medium text-gray-600 mb-2"><FaCalendarAlt className="mr-2 text-indigo-500" /> Year {asterik}</label>
                <motion.select id="year" {...register('year')} className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-gray-50 appearance-none ${errors.year ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'}`} whileFocus={inputFocus}>
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </motion.select>
                {errors.year && <ErrorMessage message={errors.year?.message} />}
              </motion.div>

              {/* select institute between HRIT and Virohan */}
              <motion.div className="relative" variants={itemVariant}>
                <label htmlFor="institution" className="flex items-center text-sm font-medium text-gray-600 mb-2"><FaUniversity className="mr-2 text-indigo-500" /> Institution {asterik}</label>
                <motion.select id="institution" {...register('institution')} className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-gray-50 appearance-none ${errors.institution ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'}`} whileFocus={inputFocus}>
                  <option value="">Select Institution</option>
                  <option value="HRIT">HRIT</option>
                  <option value="Virohan">Virohan</option>
                  </motion.select>
                {errors.institution && <ErrorMessage message={errors.institution?.message} />}
              </motion.div>
              
              {/* Register button  */}
              <motion.div className="md:col-span-2 pt-4" variants={buttonVariants}>
                <button type="submit" disabled={isSubmitting} className="cursor-pointer w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105" whileTap={{ scale: 0.99 }}>
                    {isSubmitting ? (
                      <><motion.span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />Registering...</>
                      ) : (
                      <>Register <FaArrowRight className="ml-2" />
                      </>
                    )}
                </button>
              </motion.div>
            </motion.div>
          </form>
          <motion.p className="text-center text-gray-500 mt-8"
           initial={{ opacity: 0 }} 
           animate={{ opacity: 1 }} 
           transition={{ delay: 0.8 }}>Already have an account?{' '} <a href="/login" className="text-indigo-600 hover:underline font-medium">Login here</a>
          </motion.p>
        </motion.div>
      )}
    </div>
  );
};

export default RegisterForm;