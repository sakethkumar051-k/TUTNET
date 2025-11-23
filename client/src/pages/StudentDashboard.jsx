import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TutorList from '../components/TutorList';
import BookingList from '../components/BookingList';
import ReviewList from '../components/ReviewList';
import DashboardStats from '../components/DashboardStats';
import StudyMaterials from '../components/StudyMaterials';
import FavoriteTutors from '../components/FavoriteTutors';
import ProgressReports from '../components/ProgressReports';
import AttendanceTracker from '../components/AttendanceTracker';
import MyCurrentTutors from '../components/MyCurrentTutors';
import TodaysSessions from '../components/TodaysSessions';
import ProgressAnalytics from '../components/ProgressAnalytics';
import SessionManagementDashboard from '../components/SessionManagementDashboard';
import { useSearchParams } from 'react-router-dom';

const StudentDashboard = () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'find-tutors');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/bookings/mine');

            // Calculate statistics
            const totalBookings = data.length;
            const pendingBookings = data.filter(b => b.status === 'pending').length;
            const approvedBookings = data.filter(b => b.status === 'approved').length;
            const completedBookings = data.filter(b => b.status === 'completed').length;

            setStats({
                total: totalBookings,
                pending: pendingBookings,
                approved: approvedBookings,
                completed: completedBookings
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const dashboardStats = stats ? [
        {
            label: 'Total Bookings',
            value: stats.total,
            icon: '📚',
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        {
            label: 'Pending',
            value: stats.pending,
            icon: '⏳',
            bgColor: 'bg-yellow-100',
            iconColor: 'text-yellow-600'
        },
        {
            label: 'Active Sessions',
            value: stats.approved,
            icon: '✓',
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600'
        },
        {
            label: 'Completed',
            value: stats.completed,
            icon: '🎓',
            bgColor: 'bg-indigo-100',
            iconColor: 'text-indigo-600'
        }
    ] : [];

    const tabs = [
        { id: 'today', label: "Today's Classes", icon: '📅' },
        { id: 'current-tutors', label: 'My Current Tutors', icon: '👨‍🏫' },
        { id: 'sessions', label: 'Session Management', icon: '📆' },
        { id: 'find-tutors', label: 'Find Tutors', icon: '🔍' },
        { id: 'favorites', label: 'Favorites', icon: '⭐' },
        { id: 'my-bookings', label: 'My Bookings', icon: '📋' },
        { id: 'study-materials', label: 'Study Materials', icon: '📚' },
        { id: 'progress', label: 'Progress Reports', icon: '📊' },
        { id: 'attendance', label: 'Attendance', icon: '✅' },
        { id: 'my-reviews', label: 'My Reviews', icon: '⭐' }
    ];

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Left Sidebar Navigation */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Welcome, {user?.name}!
                    </p>
                </div>
                <nav className="flex-1 overflow-y-auto p-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-indigo-50 text-indigo-600 font-semibold border-l-4 border-indigo-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            <span className="text-sm">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    {/* Statistics */}
                    {!loading && stats && (
                        <div className="mb-6">
                            <DashboardStats stats={dashboardStats} />
                        </div>
                    )}

                    {/* Tab Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {activeTab === 'today' && <TodaysSessions />}
                    {activeTab === 'current-tutors' && <MyCurrentTutors />}
                    {activeTab === 'sessions' && <SessionManagementDashboard />}
                    {activeTab === 'find-tutors' && <TutorList />}
                    {activeTab === 'favorites' && <FavoriteTutors />}
                    {activeTab === 'my-bookings' && <BookingList role="student" />}
                    {activeTab === 'study-materials' && <StudyMaterials />}
                    {activeTab === 'progress' && (
                        searchParams.get('tutorId') ? (
                            <ProgressAnalytics />
                        ) : (
                            <ProgressReports />
                        )
                    )}
                    {activeTab === 'attendance' && <AttendanceTracker />}
                    {activeTab === 'my-reviews' && (
                        <ReviewList studentId={user?._id} />
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

