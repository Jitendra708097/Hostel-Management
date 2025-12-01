
import { Routes, Route, Navigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { checkAuthStatus } from './src/redux/authSlicer';

// Page Components
import HomePage from './src/components/common/HomePage';
import AdminLoginPage from './src/components/admin/adminLoginPage';
import WeeklyMenuPage from './src/components/student/WeeklyMenuPage';
import RegisterForm from './src/components/student/studentRegister';
import StudentLoginPage from './src/components/student/studentLoginPage';
import AttendanceDashboard from './src/components/admin/attendenceDashboard';
import StudentAttendenceRecords from './src/components/student/attendenceRecords';
import CircularsPage from './src/components/common/circularPage';
import Leave from './src/components/admin/leave';
import Leavepage from './src/components/student/leaveRequests';
import LoadingSpinner from './src/utils/loadingSpinner';
import StudentGrievance from './src/components/student/studentGrievance';
import WardenGrievance from './src/components/admin/adminGrievance';
import StudentFees from './src/components/student/studentFees';
import AdminFeesDashboard from './src/components/admin/adminFeesDashboard';
import AdminDashboard from './src/components/admin/adminDashboard';
import StudentDashboard from './src/components/student/studentDashboard';
import ProfileView from './src/components/student/ProfileView';
import StudentManager from './src/components/admin/studentManager';
import UpdateMenu from './src/components/admin/updateMenu';
import ResetPasswordPage from './src/components/common/reset-password';

const App = () => {

    const { isAuthenticated, loading, user } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    // 1. Check Auth Status on Mount/Refresh
    useEffect(() => {
        dispatch(checkAuthStatus());
    }, [dispatch]);

    // 2. Loading State
    if(loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner message="Checking session..." />
            </div>
        )
    }

    // 3. Determine Redirect Path for Authenticated Users
    const getAuthenticatedRedirectPath = () => {
        if (!isAuthenticated || !user) return null;
        if (user.role === "student") return "/student/dashboard";
        if (user.role === "admin") return "/admin/dashboard";
        return null;
    };
    const authenticatedRedirectPath = getAuthenticatedRedirectPath();

    const renderProtectedElement = (roleRequired, Component, redirectPath) => {
        // Ensure user object exists before checking role
        return isAuthenticated && user && user.role === roleRequired 
            ? typeof Component === 'function' ? <Component /> : Component 
            : <Navigate to={redirectPath} replace />;
    };


    return (
        <Routes>

            {/* === PUBLIC ROUTES & REDIRECTION LOGIC === */}
            
            {/* Home Page: Redirects authenticated users */}
            <Route path="/" element={ authenticatedRedirectPath ? <Navigate to={authenticatedRedirectPath} replace /> : <HomePage /> } />
            <Route path='/login' element={ authenticatedRedirectPath ? <Navigate to={authenticatedRedirectPath} replace /> : <StudentLoginPage />}  />
            <Route path="/register"  element={ authenticatedRedirectPath ? <Navigate to={authenticatedRedirectPath} replace /> : <RegisterForm /> } />
            <Route path="/admin/login" element={ authenticatedRedirectPath ? <Navigate to={authenticatedRedirectPath} replace /> : <AdminLoginPage />}  />


        
            <Route path="/student/dashboard"  element={renderProtectedElement("student", StudentDashboard, "/login")}  />
            <Route path="/student/profile" element={renderProtectedElement("student", ProfileView, "/login")} />
            <Route path="/student/attendance" element={renderProtectedElement("student", StudentAttendenceRecords, "/login")} />
            <Route path='/student/weekly-menu' element={renderProtectedElement("student", WeeklyMenuPage, "/login")} />
            <Route path="/student/grievance" element={renderProtectedElement("student", StudentGrievance, "/login")} />
            <Route path='/student/leave-request'  element={renderProtectedElement("student", Leavepage, "/login")}  />
            <Route path="/student/fees"  element={renderProtectedElement("student", StudentFees, "/login")} />
            <Route path="/student/circulars"  element={renderProtectedElement("student", () => <CircularsPage isAdmin={false} />, "/login")} />

           {/* PROTECTED ADMIN ROUTES (Ternary Check)  */}
            <Route path="/admin/dashboard"  element={renderProtectedElement("admin", AdminDashboard, "/admin/login")} />
            <Route path="admin/circulars"  element={renderProtectedElement("admin", () => <CircularsPage isAdmin={true} />, "/admin/login")} />
            <Route path="/admin/attendence-dashboard"  element={renderProtectedElement("admin", AttendanceDashboard, "/admin/login")}   />
            <Route path='/admin/leave'  element={renderProtectedElement("admin", Leave, "/admin/login")}  />
            <Route path="/admin/grievance"  element={renderProtectedElement("admin", WardenGrievance, "/admin/login")} />
            <Route path="/admin/fees"  element={renderProtectedElement("admin", AdminFeesDashboard, "/admin/login")} />
            <Route path="/admin/student-management"  element={renderProtectedElement("admin", StudentManager, "/admin/login")}   />
            <Route path="/admin/update-menu" element={renderProtectedElement("admin", UpdateMenu, "/admin/login")} />

            {/* Catch-all for 404 Not Found (Optional) */}
           <Route path='/reset-password/:token/:userId?' element={<ResetPasswordPage />} />
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
}

export default App;