import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TutorProfileForm from '../components/TutorProfileForm';
import BookingList from '../components/BookingList';
import ReviewList from '../components/ReviewList';
import DashboardStats from '../components/DashboardStats';
import ProgressReports from '../components/ProgressReports';
import AttendanceTracker from '../components/AttendanceTracker';
import StudyMaterials from '../components/StudyMaterials';
import MyCurrentStudents from '../components/MyCurrentStudents';
import TodaysSessions from '../components/TodaysSessions';
import ProgressAnalytics from '../components/ProgressAnalytics';
import SessionManagementDashboard from '../components/SessionManagementDashboard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useSearchParams, useNavigate } from 'react-router-dom';

const TutorDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'today');
    const [stats, setStats] = useState(null);
    const [tutorProfile, setTutorProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Sync activeTab with URL search params
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab') || 'today';
        if (tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
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
            label: 'Total Bookings',
            value: stats.total,
            icon: '📚',
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        {
            label: 'Pending Requests',
            value: stats.pending,
            icon: '⏳',
            bgColor: 'bg-yellow-100',
            iconColor: 'text-yellow-600'
        },
        {
            label: 'Average Rating',
            value: stats.rating > 0 ? `${stats.rating} ⭐` : 'No reviews',
            icon: '⭐',
            bgColor: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            footer: `${stats.reviewCount} review${stats.reviewCount !== 1 ? 's' : ''}`
        },
        {
            label: 'Completed Sessions',
            value: stats.completed,
            icon: '✅',
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600'
        }
    ] : [];

    const tabs = [
        { id: 'today', label: "Today's Sessions", icon: '📅' },
        { id: 'current-students', label: 'My Current Students', icon: '👨‍🎓' },
        { id: 'sessions', label: 'Session Management', icon: '📆' },
        { id: 'bookings', label: 'All Bookings', icon: '📋' },
        { id: 'profile', label: 'Edit Profile', icon: '✏️' },
        { id: 'study-materials', label: 'My Materials', icon: '📚' },
        { id: 'progress', label: 'Progress Reports', icon: '📊' },
        { id: 'attendance', label: 'Attendance', icon: '✅' },
        { id: 'reviews', label: 'My Reviews', icon: '⭐' }
    ];

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

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Left Sidebar Navigation */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <h1 className="text-xl font-bold text-gray-900">Tutor Dashboard</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Welcome, {user?.name}!
                    </p>
                    <div className="mt-3">
                        {getApprovalBadge()}
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto p-2" role="navigation" aria-label="Dashboard navigation">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                // Update URL without navigation
                                const newSearchParams = new URLSearchParams(searchParams);
                                newSearchParams.set('tab', tab.id);
                                // Remove studentId and currentTutorId when switching tabs (unless it's progress or sessions)
                                if (tab.id !== 'progress' && tab.id !== 'sessions') {
                                    newSearchParams.delete('studentId');
                                    newSearchParams.delete('currentTutorId');
                                }
                                navigate(`/tutor-dashboard?${newSearchParams.toString()}`, { replace: true });
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setActiveTab(tab.id);
                                    const newSearchParams = new URLSearchParams(searchParams);
                                    newSearchParams.set('tab', tab.id);
                                    if (tab.id !== 'progress' && tab.id !== 'sessions') {
                                        newSearchParams.delete('studentId');
                                        newSearchParams.delete('currentTutorId');
                                    }
                                    navigate(`/tutor-dashboard?${newSearchParams.toString()}`, { replace: true });
                                }
                            }}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                activeTab === tab.id
                                    ? 'bg-indigo-50 text-indigo-600 font-semibold border-l-4 border-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <span className="text-lg" aria-hidden="true">{tab.icon}</span>
                            <span className="text-sm">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    {/* Approval Status Alert */}
                    {stats && stats.approvalStatus === 'pending' && (
                        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-yellow-400 text-xl">⚠️</span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        Your profile is pending admin approval. You will be visible to students once approved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistics */}
                    {!loading && stats && (
                        <div className="mb-6">
                            <DashboardStats stats={dashboardStats} />
                        </div>
                    )}

                    {/* Loading State for Stats */}
                    {loading && (
                        <div className="mb-6">
                            <LoadingSkeleton type="stats" count={4} />
                        </div>
                    )}

                    {/* Tab Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[400px]">
                    {activeTab === 'today' && <TodaysSessions />}
                    {activeTab === 'current-students' && <MyCurrentStudents />}
                    {activeTab === 'sessions' && <SessionManagementDashboard />}
                    {activeTab === 'bookings' && <BookingList role="tutor" />}
                    {activeTab === 'profile' && <TutorProfileForm />}
                    {activeTab === 'study-materials' && <StudyMaterials />}
                    {activeTab === 'progress' && (
                        searchParams.get('studentId') ? (
                            <ProgressAnalytics />
                        ) : (
                            <ProgressReports />
                        )
                    )}
                    {activeTab === 'attendance' && <AttendanceTracker />}
                    {activeTab === 'reviews' && (
                        <ReviewList tutorId={user?._id} />
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorDashboard;

