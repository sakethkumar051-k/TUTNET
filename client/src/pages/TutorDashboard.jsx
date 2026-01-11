import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

// Components
import Sidebar from '../components/Sidebar';
import SessionsPage from './SessionsPage';
import DashboardStats from '../components/DashboardStats';
import MyCurrentStudents from '../components/MyCurrentStudents';
import StudyMaterials from '../components/StudyMaterials';
import ReviewList from '../components/ReviewList';
import AttendanceTracker from '../components/AttendanceTracker';
import ProgressAnalytics from '../components/ProgressAnalytics';
import ProgressReports from '../components/ProgressReports';
import TutorProfileForm from '../components/TutorProfileForm';
import LoadingSkeleton from '../components/LoadingSkeleton';

const TutorDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
    const [stats, setStats] = useState(null);
    const [tutorProfile, setTutorProfile] = useState(null);
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
            fetchData();
        }
    }, [activeTab]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('tab', tabId);

        // Clean up unneeded params
        if (!['students', 'resources'].includes(tabId)) {
            newSearchParams.delete('studentId');
            newSearchParams.delete('currentTutorId');
        }

        navigate(`/tutor-dashboard?${newSearchParams.toString()}`, { replace: true });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch bookings
            const { data: bookings } = await api.get('/bookings/mine');

            // Fetch tutor profile
            const { data: profile } = await api.get('/tutors/my-profile');
            setTutorProfile(profile);

            // Fetch reviews
            const { data: reviews } = await api.get(`/reviews/tutor/${user._id}`);

            // Calculate statistics
            const totalBookings = bookings.length;
            const pendingBookings = bookings.filter(b => b.status === 'pending').length;
            const approvedBookings = bookings.filter(b => b.status === 'approved').length;
            const completedBookings = bookings.filter(b => b.status === 'completed').length;

            // Calculate average rating
            const averageRating = reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : 0;

            setStats({
                total: totalBookings,
                pending: pendingBookings,
                approved: approvedBookings,
                completed: completedBookings,
                rating: averageRating,
                reviewCount: reviews.length,
                approvalStatus: profile?.approvalStatus || 'pending'
            });
        } catch (error) {
            console.error('Error fetching data:', error);
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
            label: 'Rating',
            value: stats.rating > 0 ? `${stats.rating} ⭐` : 'N/A',
            icon: '⭐',
            bgColor: 'bg-yellow-50',
            iconColor: 'text-yellow-600',
            footer: `${stats.reviewCount} review${stats.reviewCount !== 1 ? 's' : ''}`
        },
        {
            label: 'Completed',
            value: stats.completed,
            icon: '✅',
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-600'
        }
    ] : [];

    const getApprovalBadge = () => {
        if (!stats) return null;

        const statusConfig = {
            approved: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                label: '✓ Approved'
            },
            pending: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                label: '⏳ Pending Approval'
            },
            rejected: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                label: '✕ Rejected'
            }
        };

        const config = statusConfig[stats.approvalStatus] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'sessions':
                return <SessionsPage />;

            case 'students':
                return (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">My Students</h2>
                            <MyCurrentStudents />
                        </div>
                    </div>
                );

            case 'resources':
                return (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">My Materials</h2>
                            <StudyMaterials />
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h2>
                            <TutorProfileForm />
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Attendance & Reviews</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <AttendanceTracker />
                                <ReviewList tutorId={user?._id} />
                            </div>
                        </div>
                    </div>
                );

            case 'dashboard':
            default:
                return (
                    <div className="max-w-5xl mx-auto space-y-8">
                        {/* Welcome Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Welcome back, {user?.name?.split(' ')[0]}! 👋
                                </h1>
                                <p className="text-gray-500 mt-1">
                                    You have {stats?.approved || 0} upcoming sessions scheduled.
                                </p>
                            </div>
                            {getApprovalBadge()}
                        </div>

                        {/* Status Alert */}
                        {stats && stats.approvalStatus === 'pending' && (
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg flex items-start">
                                <span className="text-amber-500 text-xl mr-3">⚠️</span>
                                <div>
                                    <p className="text-sm font-medium text-amber-800">Account Pending Approval</p>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Your profile is currently under review. You'll be visible to students once approved.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Actionable Stats */}
                        {!loading && stats && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {dashboardStats.map((stat, index) => (
                                    <div key={index} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                                <span className={`text-xl ${stat.iconColor}`}>{stat.icon}</span>
                                            </div>
                                            {stat.footer && <span className="text-xs text-gray-400">{stat.footer}</span>}
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Interactive Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Student Progress */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-900">Student Progress Reports</h3>
                                    <button
                                        onClick={() => handleTabChange('students')}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        View All Students →
                                    </button>
                                </div>
                                <div className="h-64 overflow-hidden">
                                    <p className="text-sm text-gray-500 mb-4">Select a student to see detailed analytics.</p>
                                    <ProgressReports />
                                </div>
                            </div>

                            {/* Quick Actions / Attendance Placeholder */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6">Recent Activity</h3>
                                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                    <span className="text-4xl mb-2">📊</span>
                                    <p>Activity timeline coming soon</p>
                                </div>
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

export default TutorDashboard;

