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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Welcome back, {user?.name}!
                    </p>
                </div>

                {/* Statistics */}
                {!loading && stats && (
                    <div className="mb-6">
                        <DashboardStats stats={dashboardStats} />
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex overflow-x-auto scrollbar-hide -mb-px">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${activeTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                                >
                                    <span>{tab.icon}</span>
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

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
    );
};

export default StudentDashboard;

