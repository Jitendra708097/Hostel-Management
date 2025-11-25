
import { motion, } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { features } from '../../utils/routes';
import AdminHeader from './AdminHeader';
import { useDispatch,} from 'react-redux';
import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { logout } from '../../redux/authSlicer';


const AdminDashboard = () => {
    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onLogout = () => {
        // Implement logout functionality here
        dispatch(logout());
        navigate('/admin/login');
    }

    return (
        <div className="bg-gray-200 min-h-screen font-sans">
            {/* Header */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white shadow-md fixed w-full top-0 left-0 z-50"
            >
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <img src="https://tse2.mm.bing.net/th/id/OIP.tD4EJQ_esnNeKNa11WC7SAHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3" alt="HRIT UNIVERSITY Logo" className="h-12 w-12" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">HRIT University Hostel</h1>
                            <p className="text-sm text-gray-500">Duhai, Muradnagar Ghaziabad (U.P.) 201203</p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="flex items-center gap-5">
                         {user && (
                          <div className="hidden md:flex flex-col items-end">
                           <span className="text-sm font-medium text-slate-200">{user.name}</span>
                           <span className="text-xs text-slate-500 uppercase">{user.role}</span>
                        </div>
                       )}
                      <button 
                        onClick={onLogout}
                        className="cursor-pointer flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-md transition-all text-sm border border-slate-700"
                       >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Logout</span>
                      </button>
                      </div>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="pt-24 pb-16">
                <div className="container mx-auto px-6">
                    <AdminHeader title="Managing Dashboard" subtitle="Overview & quick actions" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                        <Link to={feature.path} key={index} >
                            <div
                                className="bg-white rounded-lg p-6 cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
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
                    &copy; {new Date().getFullYear()} Jitendra Kumar. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};

export default AdminDashboard;