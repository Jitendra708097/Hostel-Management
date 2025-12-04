
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { registerUser } from '../../redux/authSlicer';
import ProfilePhotoUploader from '../../components/common/ProfilePhotoUploader';

// --- ICONS ---
import { FaUser, FaEnvelope, FaLock, FaGraduationCap,FaRestroom, FaCalendarAlt, FaUniversity, FaArrowRight, FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import 'react-image-crop/dist/ReactCrop.css';



// Zod Schema for Validation (Updated with profilePhoto)
const registerSchema = z.object({
  profilePhoto: z.any().refine((file) => file ? file.size <= 5 * 1024 * 1024 : true, `Max image size is 5MB.`).optional(),
  userName: z.string().min(3, { message: 'Student Name is required' }).max(20,{ message: "Student name must be between 3 and 25 characters"}),
  emailId: z.string().min(1, 'Email ID is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be contains minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1'),
  course: z.string().min(1, 'Please enter your course'),
  year: z.enum(['1', '2', '3', '4'], { errorMap: () => ({ message: 'Please select a valid year' }) }),
  institution: z.enum(['HRIT', 'Virohan'], { errorMap: () => ({ message: 'Please select an institution' }) }),
  roomNo: z.number().min(1, 'Please enter your Room No.').max(300, 'Room No. must be at most 300'),
  phoneNo: z.number().min(1000000000, 'Phone No. must be at least 10 digits').max(9999999999, 'Phone No. must be at most 10 digits'),
});

// Register Form Component
const RegisterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const SAVED_FORM_KEY = 'studentRegisterForm_v1';
  // load saved values from localStorage to avoid losing input on refresh
  const loadSaved = () => {
    try {
      const raw = localStorage.getItem(SAVED_FORM_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  };

  const { control, register, handleSubmit, watch, formState: { errors }, reset, setError } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: loadSaved(),
  });

  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticate, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // check user authentication status and redirect to student dashboard if already logged in
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
      // clear saved draft on successful registration
      reset();
      try { localStorage.removeItem(SAVED_FORM_KEY); } catch (e) {}
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

  // persist form values to localStorage on change (except file objects)
  useEffect(() => {
    const subscription = watch((value) => {
      try {
        const toStore = { ...value };
        // don't attempt to store file objects (profilePhoto)
        if (toStore.profilePhoto) delete toStore.profilePhoto;
        localStorage.setItem(SAVED_FORM_KEY, JSON.stringify(toStore));
      } catch (e) {
        // ignore storage errors
      }
    });
    return () => subscription && subscription.unsubscribe ? subscription.unsubscribe() : undefined;
  }, [watch]);

  // tailwind css styles and framer motion variants
  const asterik = <span className='text-red-500'> *</span>;
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } } };
  const itemVariant = { hidden: { opacity: 0, y: 12, scale: 0.995 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } } };
  const buttonVariants = { hidden: { opacity: 0, y: 20, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20, delay: 0.6 } } };
  const errorShake = { x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.3 } };
  const inputFocus = { scale: 1.01, boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.2)", transition: { duration: 0.2 } };
  const ErrorMessage = ({ message }) => (<motion.p className="mt-2 text-sm text-red-600 bg-red-50/80 inline-block px-2 py-1 rounded-md font-medium" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>{message}</motion.p>);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-6 font-sans">
        <motion.div
         className="relative bg-white/60 p-8 md:p-12 rounded-3xl w-full max-w-4xl backdrop-blur-lg border border-gray-400" 
         initial={{ scale: 0.95, opacity: 0 }} 
         animate={{ scale: 1, opacity: 1 }} 
         transition={{ duration: 0.6, ease: 'easeOut' }}>

          {/* --- Form Title --- */}
          <motion.h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8" 
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2, type: "spring" }}>
            Welcome to HRIT University Hostel - Student Registration
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

              {/* phoneNo input field */}
              <motion.div className="md:col-span-2" variants={itemVariant}>
                <label htmlFor="phoneNo" className="flex items-center text-sm font-medium text-gray-600 mb-2"><FaEnvelope className="mr-2 text-indigo-500" /> Phone No. {asterik}</label>
                <motion.input type="number" id="phoneNo" {...register('phoneNo', {valueAsNumber: true})} className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-gray-50 ${errors.phoneNo ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'}`} 
                placeholder="Enter Your Phone No." 
                whileFocus={inputFocus} 
                animate={errors.phoneNo ? errorShake : {}} />
                {errors.phoneNo && <ErrorMessage message={errors.phoneNo?.message} />}
              </motion.div>

              {/* roomNo input field */}
              <motion.div className="md:col-span-2" variants={itemVariant}>
                <label htmlFor="roomNo" className="flex items-center text-sm font-medium text-gray-600 mb-2"><FaRestroom className="mr-2 text-indigo-500" /> Room No. {asterik}</label>
                <motion.input type="number" id="roomNo" {...register('roomNo', {valueAsNumber: true})} className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-gray-50 ${errors.roomNo ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'}`} 
                placeholder="Enter Your Room No." 
                whileFocus={inputFocus} 
                animate={errors.roomNo ? errorShake : {}} />
                {errors.roomNo && <ErrorMessage message={errors.roomNo?.message} />}
              </motion.div>

              {/* --- Select Fields Course --- */}
              <motion.div className="relative" variants={itemVariant}>
                <label htmlFor="course" className="flex items-center text-sm font-medium text-gray-600 mb-2"><FaGraduationCap className="mr-2 text-indigo-500" /> Course {asterik}</label>
                <motion.select id="course" {...register('course')} className={`cursor-pointer block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-gray-50 appearance-none ${errors.year ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'}`} whileFocus={inputFocus}>
                  <option value="">Select Course</option>
                  <option value="B Tech">B Tech</option>
                  <option value="B Pharma">B Pharma</option>
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="MBA">MBA</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Other">Other</option>
                </motion.select>
                {errors.course && <ErrorMessage message={errors.course?.message} />}
              </motion.div>

              {/* --- Select Fields year 1,2,3,4 --- */}
              <motion.div className="relative" variants={itemVariant}>
                <label htmlFor="year" className="flex items-center text-sm font-medium text-gray-600 mb-2"><FaCalendarAlt className="mr-2 text-indigo-500" /> Year {asterik}</label>
                <motion.select id="year" {...register('year')} className={`cursor-pointer block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-gray-50 appearance-none ${errors.year ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'}`} whileFocus={inputFocus}>
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
                <motion.select id="institution" {...register('institution')} className={`cursor-pointer block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-gray-50 appearance-none ${errors.institution ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'}`} whileFocus={inputFocus}>
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

          {/* login redirect link */}
          <motion.p className="text-center text-gray-500 mt-8"
           initial={{ opacity: 0 }} 
           animate={{ opacity: 1 }} 
           transition={{ delay: 0.8 }}>Already have an account?{' '} <a href="/login" className="text-indigo-600 hover:underline font-medium">Login here</a>
          </motion.p>
        </motion.div>
    </div>
  );
};

export default RegisterForm;