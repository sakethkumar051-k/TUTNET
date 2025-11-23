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
import { useSearchParams } from 'react-router-dom';

const TutorDashboard = () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'today');
    const [stats, setStats] = useState(null);
    const [tutorProfile, setTutorProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

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
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tutor Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Welcome back, {user?.name}!
                        </p>
                    </div>
                    {getApprovalBadge()}
                </div>

                {/* Approval Status Alert */}
                {stats && stats.approvalStatus === 'pending' && (
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
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
                {!loading && stats && <DashboardStats stats={dashboardStats} />}

                {/* Tabs Navigation */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
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
    );
};

export default TutorDashboard;

