import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

// Components
import Sidebar from '../components/Sidebar';
import SessionsPage from './SessionsPage';
import DashboardStats from '../components/DashboardStats';
import MyCurrentTutors from '../components/MyCurrentTutors';
import FavoriteTutors from '../components/FavoriteTutors';
import StudyMaterials from '../components/StudyMaterials';
import ReviewList from '../components/ReviewList';
import AttendanceTracker from '../components/AttendanceTracker';
import ProgressAnalytics from '../components/ProgressAnalytics';
import ProgressReports from '../components/ProgressReports';
import LoadingSkeleton from '../components/LoadingSkeleton';

const StudentDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Sync activeTab with URL search params
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab') || 'dashboard';
        if (tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchStats();
        }
    }, [activeTab]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('tab', tabId);

        // Clean up unneeded params when switching top-level tabs
        if (!['tutors', 'resources'].includes(tabId)) {
            newSearchParams.delete('tutorId');
            newSearchParams.delete('currentTutorId');
        }

        navigate(`/student-dashboard?${newSearchParams.toString()}`, { replace: true });
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
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
            label: 'Upcoming Sessions',
            value: stats.approved,
            icon: '📅',
            bgColor: 'bg-indigo-50',
            iconColor: 'text-indigo-600'
        },
        {
            label: 'Pending Requests',
            value: stats.pending,
            icon: '⏳',
            bgColor: 'bg-amber-50',
            iconColor: 'text-amber-600'
        },
        {
            label: 'Completed Classes',
            value: stats.completed,
            icon: '🎓',
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-600'
        }
    ] : [];

    const renderContent = () => {
        switch (activeTab) {
            case 'sessions':
                return <SessionsPage />;

            case 'tutors':
                return (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">My Learning Network</h2>
                            <MyCurrentTutors />
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Favorite Tutors</h2>
                            <FavoriteTutors />
                        </div>
                    </div>
                );

            case 'resources':
                return (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Study Materials</h2>
                            <StudyMaterials />
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Attendance & Reviews</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <AttendanceTracker />
                                <ReviewList studentId={user?._id} />
                            </div>
                        </div>
                    </div>
                );

            case 'dashboard':
            default:
                return (
                    <div className="max-w-5xl mx-auto space-y-8">
                        {/* Welcome Header */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome back, {user?.name?.split(' ')[0]}! 👋
                            </h1>
                            <p className="text-gray-500 mt-1">
                                You have {stats?.approved || 0} upcoming sessions scheduled.
                            </p>
                        </div>

                        {/* Actionable Stats */}
                        {!loading && stats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {dashboardStats.map((stat, index) => (
                                    <div key={index} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
                                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                            <span className={`text-xl ${stat.iconColor}`}>{stat.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Interactive Progress Section - Simplified for Home */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-900">Recent Progress</h3>
                                    <button
                                        onClick={() => handleTabChange('profile')}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        View Full Report →
                                    </button>
                                </div>
                                <div className="h-64 overflow-hidden">
                                    <p className="text-sm text-gray-500 mb-4">Select a tutor to see detailed analytics.</p>
                                    <ProgressReports />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                                <div className="p-4 bg-indigo-50 rounded-full mb-4">
                                    <span className="text-3xl">🔍</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Find a New Tutor</h3>
                                <p className="text-gray-500 text-sm mb-6 max-w-xs">
                                    Browse our network of extensive tutors to find your perfect match.
                                </p>
                                <button
                                    onClick={() => navigate('/find-tutors')}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Search Tutors
                                </button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden font-sans">
            <Sidebar
                user={user}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                <main className="px-4 sm:px-8 py-8 min-h-full">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;


