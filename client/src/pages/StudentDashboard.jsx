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
import StudentProgressDashboard from '../components/StudentProgressDashboard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import LoadingSpinner from '../components/LoadingSpinner';

const StudentDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTutors, setCurrentTutors] = useState([]);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [pendingBookings, setPendingBookings] = useState([]);
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
            // Fetch all data in parallel
            const [bookingsRes, tutorsRes] = await Promise.all([
                api.get('/bookings/mine'),
                api.get('/current-tutors/student/my-tutors').catch(() => ({ data: [] })) // Don't fail if no tutors
            ]);

            const bookings = bookingsRes.data;
            const tutors = tutorsRes.data;

            setCurrentTutors(tutors);

            // Filter bookings
            const pending = bookings.filter(b => b.status === 'pending');
            const approved = bookings.filter(b => b.status === 'approved');
            const upcoming = approved.filter(b => {
                if (!b.sessionDate) return false;
                const sessionDate = new Date(b.sessionDate);
                return sessionDate >= new Date();
            });

            setPendingBookings(pending);
            setUpcomingBookings(upcoming);

            // Calculate statistics
            const totalBookings = bookings.length;
            const completedBookings = bookings.filter(b => b.status === 'completed').length;

            setStats({
                total: totalBookings,
                pending: pending.length,
                approved: approved.length,
                completed: completedBookings,
                tutorsCount: tutors.length
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
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Study Materials</h2>
                            <StudyMaterials />
                        </div>
                    </div>
                );

            case 'progress':
                const tutorId = searchParams.get('tutorId');
                if (tutorId) {
                    return <ProgressAnalytics />;
                }
                return <StudentProgressDashboard />;

            case 'profile':
                return (
                    <div className="space-y-6">
                        <StudentProgressDashboard />
                    </div>
                );

            case 'dashboard':
            default:
                return (
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                        {/* Welcome Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-200 animate-fade-in-up">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
                                    Welcome back, {user?.name?.split(' ')[0]}
                                </h1>
                                <p className="text-gray-600 text-base">
                                    {stats?.approved > 0 
                                        ? `You have ${stats.approved} class${stats.approved !== 1 ? 'es' : ''} coming up.`
                                        : currentTutors.length > 0
                                        ? `You're learning with ${currentTutors.length} tutor${currentTutors.length !== 1 ? 's' : ''}.`
                                        : 'Ready to start learning? Find your perfect tutor.'}
                                </p>
                            </div>
                        </div>

                        {/* No Tutors Yet - Find Your First Tutor */}
                        {!loading && currentTutors.length === 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-12 shadow-sm">
                                <div className="max-w-md mx-auto text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to Start Learning?</h3>
                                    <p className="text-gray-700 mb-2 text-base">
                                        Find tutors who can help you learn and grow.
                                    </p>
                                    <p className="text-gray-600 mb-8 text-sm">
                                        Search for tutors, read reviews, and book your first class.
                                    </p>
                                    <button
                                        onClick={() => navigate('/find-tutors')}
                                        className="px-6 py-3 bg-gray-900 text-white rounded-md font-semibold text-base hover:bg-gray-800 transition-colors"
                                    >
                                        Find Tutors
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Matched Tutors - Book Your First Session */}
                        {currentTutors.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Your Tutors</h3>
                                        <p className="text-sm text-gray-600">You're learning with {currentTutors.length} tutor{currentTutors.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <button
                                        onClick={() => handleTabChange('tutors')}
                                        className="px-4 py-2 bg-white text-gray-700 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {currentTutors.slice(0, 2).map((tutor) => {
                                        const hasNoSessions = tutor.totalSessionsBooked === 0;
                                        return (
                                            <div key={tutor._id} className="bg-white rounded-lg p-4 border border-green-200">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-lg">{tutor.tutorId?.name}</p>
                                                        <p className="text-sm text-gray-600 mt-1 font-medium">{tutor.subject}</p>
                                                        {tutor.classGrade && (
                                                            <p className="text-xs text-gray-500 mt-1">For: {tutor.classGrade}</p>
                                                        )}
                                                    </div>
                                                    {hasNoSessions && (
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">New!</span>
                                                    )}
                                                </div>
                                                {hasNoSessions ? (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                        <p className="text-sm font-semibold text-blue-900 mb-2">Let's Start Learning!</p>
                                                        <p className="text-xs text-blue-700 mb-3">Book your first class with {tutor.tutorId?.name?.split(' ')[0]} to begin your learning journey.</p>
                                                        <button
                                                            onClick={() => handleTabChange('sessions')}
                                                            className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 transition-all duration-200"
                                                        >
                                                            Book My First Class
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Classes: {tutor.totalSessionsBooked}</span>
                                                        <button
                                                            onClick={() => handleTabChange('sessions')}
                                                            className="text-green-600 hover:text-green-700 font-medium"
                                                        >
                                                            View Classes →
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {currentTutors.length > 2 && (
                                    <p className="text-sm text-gray-600 text-center">
                                        + {currentTutors.length - 2} more tutor{currentTutors.length - 2 !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Actionable Stats */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-gray-200 rounded-md"></div>
                                            <div>
                                                <div className="h-10 w-20 bg-gray-200 rounded mb-2"></div>
                                                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : stats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {dashboardStats.map((stat, index) => (
                                    <div 
                                        key={index} 
                                        className="bg-white p-6 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-fade-in-up"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                        onClick={() => {
                                            if (stat.label === 'Pending Requests' && stats.pending > 0) {
                                                handleTabChange('sessions');
                                            } else if (stat.label === 'Upcoming Sessions' && stats.approved > 0) {
                                                handleTabChange('sessions');
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-md ${stat.bgColor} transition-transform duration-300 hover:scale-110`}>
                                                <span className={`text-xl ${stat.iconColor}`}>{stat.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-4xl font-bold text-gray-900 mb-2 leading-none transition-all duration-300">{stat.value}</p>
                                                <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                                                {stat.label === 'Pending Requests' && stats.pending > 0 && (
                                                    <p className="text-xs text-indigo-600 mt-3 font-medium animate-pulse">Click to check →</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Book a Session - Calendar Access */}
                        {currentTutors.length > 0 && (
                            <div className="bg-white border-l-4 border-indigo-500 rounded-lg p-6 shadow-sm animate-fade-in-up">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Book a Session</h3>
                                        <p className="text-sm text-gray-600">Schedule a new class with your tutor using the calendar</p>
                                    </div>
                                    <button
                                        onClick={() => handleTabChange('sessions')}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                                    >
                                        Open Calendar →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Upcoming Sessions - Quick View */}
                        {upcomingBookings.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-fade-in-up">
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                                    <h3 className="text-base font-bold text-gray-900">
                                        Your Next Classes
                                    </h3>
                                    <button
                                        onClick={() => handleTabChange('sessions')}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-all duration-200 transform hover:scale-105"
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {upcomingBookings.slice(0, 3).map((booking) => (
                                        <div key={booking._id} className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                    <span className="text-indigo-600 font-bold">
                                                        {booking.sessionDate ? new Date(booking.sessionDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'TBD'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">With {booking.tutorId?.name || 'Your Tutor'}</p>
                                                    <p className="text-sm text-gray-600">{booking.subject} • {booking.preferredSchedule}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleTabChange('sessions')}
                                                className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                                            >
                                                View Details →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pending Bookings - Waiting for Approval */}
                        {pendingBookings.length > 0 && (
                            <div className="bg-white border-l-4 border-blue-500 rounded-lg p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Waiting for Approval</h3>
                                        <p className="text-sm text-gray-600">Your tutor is reviewing {pendingBookings.length} class request{pendingBookings.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <button
                                        onClick={() => handleTabChange('sessions')}
                                        className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-semibold hover:bg-gray-800 transition-colors"
                                    >
                                        Check Status →
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {pendingBookings.slice(0, 3).map((booking) => (
                                        <div key={booking._id} className="bg-white rounded-lg p-3 border border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">{booking.tutorId?.name || 'Tutor'}</p>
                                                    <p className="text-sm text-gray-600">{booking.subject} • {booking.preferredSchedule}</p>
                                                </div>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">Waiting</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Helpful Tips for Students */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-5 pb-4 border-b border-gray-200">
                                Tips for Great Learning
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="text-2xl mb-2">📚</div>
                                    <p className="font-semibold text-gray-900 text-sm mb-1">Come Prepared</p>
                                    <p className="text-xs text-gray-600">Bring your books and questions to class. Your tutor will help you understand everything!</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                    <div className="text-2xl mb-2">💬</div>
                                    <p className="font-semibold text-gray-900 text-sm mb-1">Ask Questions</p>
                                    <p className="text-xs text-gray-600">Don't be shy! Ask your tutor anything you don't understand. That's what they're here for!</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <div className="text-2xl mb-2">⭐</div>
                                    <p className="font-semibold text-gray-900 text-sm mb-1">Practice Regularly</p>
                                    <p className="text-xs text-gray-600">Do your homework and practice what you learn. This helps you remember better!</p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Progress */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                                    <h3 className="text-base font-bold text-gray-900">
                                        Your Progress
                                    </h3>
                                    <button
                                        onClick={() => handleTabChange('profile')}
                                        className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                                    >
                                        View Full Report →
                                    </button>
                                </div>
                                <div className="min-h-[200px]">
                                    {currentTutors.length > 0 ? (
                                        <ProgressReports />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                            <span className="text-4xl mb-2">📈</span>
                                            <p className="text-sm">Your progress will appear here</p>
                                            <p className="text-xs mt-1">Start learning to see your progress!</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-fade-in-up">
                                <h3 className="text-base font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                                    Quick Actions
                                </h3>
                                <div className="space-y-3">
                                    {currentTutors.length > 0 && (
                                        <button
                                            onClick={() => handleTabChange('sessions')}
                                            className="w-full p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 text-left transition-all duration-200 transform hover:scale-[1.02] hover:shadow-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-900">Book a Session</p>
                                                    <p className="text-xs text-gray-600 mt-1">Use calendar to schedule classes with your tutor</p>
                                                </div>
                                                <span className="text-indigo-600 transition-transform duration-200 group-hover:translate-x-1">→</span>
                                            </div>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate('/find-tutors')}
                                        className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left transition-all duration-200 transform hover:scale-[1.02] hover:shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">Find a Tutor</p>
                                                <p className="text-xs text-gray-600 mt-1">Search for tutors who can help you learn</p>
                                            </div>
                                            <span className="text-gray-600 transition-transform duration-200 group-hover:translate-x-1">→</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('sessions')}
                                        className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left transition-all duration-200 transform hover:scale-[1.02] hover:shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">My Classes</p>
                                                <p className="text-xs text-gray-600 mt-1">See all your classes and sessions</p>
                                            </div>
                                            <span className="text-gray-600 transition-transform duration-200 group-hover:translate-x-1">→</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('tutors')}
                                        className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left transition-all duration-200 transform hover:scale-[1.02] hover:shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">My Tutors</p>
                                                <p className="text-xs text-gray-600 mt-1">View all your tutors and their details</p>
                                            </div>
                                            <span className="text-gray-600 transition-transform duration-200 group-hover:translate-x-1">→</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('resources')}
                                        className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left transition-all duration-200 transform hover:scale-[1.02] hover:shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">Study Materials</p>
                                                <p className="text-xs text-gray-600 mt-1">Access materials from your tutors</p>
                                            </div>
                                            <span className="text-gray-600 transition-transform duration-200 group-hover:translate-x-1">→</span>
                                        </div>
                                    </button>
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

export default StudentDashboard;


