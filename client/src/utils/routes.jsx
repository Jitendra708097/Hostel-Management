import {  FiBell, FiUserPlus, FiFileText, FiMessageSquare, FiTrendingUp, FiCalendar, FiDollarSign } from 'react-icons/fi';

export const features = [
        { name: 'Student Management', icon: <FiUserPlus className="text-4xl" />, description: 'Add, view, and manage student details.', path: "/admin/student-management" },
        { name: 'Leave Requests', icon: <FiFileText className="text-4xl" />, description: 'Approve or reject student leave applications.', path: '/admin/leave' },
        { name: 'Grievances', icon: <FiMessageSquare className="text-4xl" />, description: 'Address and resolve student complaints.', path: "/admin/grievance" },
        { name: 'Attendance', icon: <FiTrendingUp className="text-4xl" />, description: 'Monitor and record student attendance.', path: "/admin/attendence-dashboard" },
        { name: 'Circulars', icon: <FiBell className="text-4xl" />, description: 'Publish notices and announcements.', path: "/admin/circulars" },
        { name: 'Fees Management', icon: <FiDollarSign className="text-4xl" />, description: 'Track and manage student fee payments.', path: "/admin/fees" },
        { name: 'Mess Menu', icon: <FiCalendar className="text-4xl" />, description: 'Update and manage the weekly mess menu.', path: "/admin/update-menu" },
    ];
