// StudentDashboard.js
import { useState } from 'react';
import {  FiBell, FiFileText, FiMessageSquare, FiCalendar, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlicer';
import { Link } from 'react-router';

const StudentDashboard = () => {
    const [isProfileOpen, setProfileOpen] = useState(false);
    const  {isAuthenticated, user, loading }  = useSelector(state => state.auth);
    const dispatch = useDispatch();

    // console.log("user: ",user);
    const features = [
        { name: 'Mess Menu', icon: <FiCalendar className="text-4xl" />, description: 'View the weekly mess menu.', path: '/student/weekly-menu' },
        { name: 'Leave Application', icon: <FiFileText className="text-4xl" />, description: 'Apply for out-of-campus leave.', path: '/student/leave-request' },
        { name: 'Grievance Portal', icon: <FiMessageSquare className="text-4xl" />, description: 'Raise and track your complaints.', path: "/student/grievance" },
        { name: 'Fee Payment', icon: <FiDollarSign className="text-4xl" />, description: 'Check your fee status and pay online.', path: "/student/fees" },
        { name: 'Attendance', icon: <FiCheckCircle className="text-4xl" />, description: 'View your attendance record.', path: "/student/attendance" },
        { name: 'Circulars', icon: <FiBell className="text-4xl" />, description: 'Check the latest notices and announcements.', path: "/student/circulars" },
    ];
    // this api call for checking authentication of user 
    
    const handleLogOut = () => {
        dispatch(logout());
    }

    // loading when api call 
    if(loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner message="loading..." />
            </div>
        )
    }


    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            {/* Header */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white shadow-md fixed w-full top-0 left-0 z-50"
            >
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <img src="https://tse2.mm.bing.net/th/id/OIP.tD4EJQ_esnNeKNa11WC7SAHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3" alt="HRIT UNIVERSITY logo" className="h-12 w-12" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">HRIT University Hostel</h1>
                            <p className="text-sm text-gray-500">Duhai, Muradnagar, Ghaziabad, (U.P.) </p>
                        </div>
                    </div>
                    <div className="relative">
                       <div className="flex items-center space-x-4">
                           <FiBell className="text-gray-600 h-6 w-6 cursor-pointer hover:text-teal-600 transition-colors"/>
                            <img
                                src={user.profileURL}
                                alt="Student Profile"
                                className="h-12 w-12 rounded-full cursor-pointer border-2 border-transparent hover:border-teal-500"
                                onClick={() => setProfileOpen(!isProfileOpen)}
                            />
                        </div>
                        <AnimatePresence>
                            {isProfileOpen && (
                                <div className="w-4 absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-center">
                                    <button onClick={handleLogOut} className='text-center cursor-pointer w-2'>Logout</button> 
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="pt-24 pb-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">Welcome, { user.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                        <Link to={feature.path} key={index} >
                            <div className="bg-white rounded-lg p-6 cursor-pointer">
                               <div className="flex items-center justify-between">
                                    <div className="p-3 bg-teal-100 text-teal-600 rounded-full">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mt-4">{feature.name}</h3>
                                <p className="text-gray-500 mt-2">{feature.description}</p>
                            </div>
                         </Link>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white py-4 bottom-0 left-0 w-full border-t">
                <div className="container mx-auto px-6 text-center text-gray-600">
                    &copy; {new Date().getFullYear()} HRIT UNIVERSITY. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};

export default StudentDashboard;