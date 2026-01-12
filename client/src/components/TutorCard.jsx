import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import RegularBookingModal from './RegularBookingModal';

const TutorCard = ({ tutor, onRequestDemo }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [checkingFavorite, setCheckingFavorite] = useState(true);
    const [trialStatus, setTrialStatus] = useState(null);
    const [loadingTrialStatus, setLoadingTrialStatus] = useState(true);
    const [showRegularBooking, setShowRegularBooking] = useState(false);
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'student' && tutor.userId?._id) {
            checkFavorite();
            checkTrialStatus();
        } else {
            setCheckingFavorite(false);
            setLoadingTrialStatus(false);
        }
    }, [user, tutor]);

    const checkTrialStatus = async () => {
        try {
            const { data } = await api.get(`/bookings/trial-status/${tutor.userId._id}`);
            setTrialStatus(data);
        } catch (err) {
            console.error('Failed to check trial status:', err);
            setTrialStatus(null);
        } finally {
            setLoadingTrialStatus(false);
        }
    };

    const checkFavorite = async () => {
        try {
            const { data } = await api.get(`/favorites/check/${tutor.userId._id}`);
            setIsFavorite(data.isFavorite);
        } catch (err) {
            // Not a favorite or error
            setIsFavorite(false);
        } finally {
            setCheckingFavorite(false);
        }
    };

    const toggleFavorite = async (e) => {
        e.stopPropagation();
        if (!user || user.role !== 'student') return;

        try {
            if (isFavorite) {
                await api.delete(`/favorites/${tutor.userId._id}`);
                setIsFavorite(false);
                showSuccess('Removed from favorites');
            } else {
                await api.post('/favorites', { tutorId: tutor.userId._id });
                setIsFavorite(true);
                showSuccess('Added to favorites');
            }
        } catch (err) {
            showError('Failed to update favorite');
        }
    };
    // Calculate average rating
    const averageRating = tutor.averageRating || 0;
    const reviewCount = tutor.reviewCount || 0;

    // Get initials for avatar fallback
    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'T';
    };

    return (
        <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden flex flex-col h-full hover:border-indigo-300">
            {/* Header Section - Clean & White */}
            <div className="px-5 pt-6 pb-4 bg-white">
                <div className="flex items-start gap-4">
                    {/* Avatar - Plain & Clean */}
                    <div className="relative flex-shrink-0">
                        {tutor.userId?.profilePicture ? (
                            <img
                                src={tutor.userId.profilePicture}
                                alt={tutor.userId.name}
                                className="w-16 h-16 rounded-full object-cover border border-gray-100 shadow-sm"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl border border-indigo-100">
                                {getInitials(tutor.userId?.name)}
                            </div>
                        )}
                    </div>

                    {/* Name & Title */}
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-gray-900 truncate" title={tutor.userId?.name}>
                                {tutor.userId?.name}
                            </h3>
                            {user?.role === 'student' && !checkingFavorite && (
                                <button
                                    onClick={toggleFavorite}
                                    className="text-gray-300 hover:text-amber-400 transition-colors ml-1"
                                >
                                    <svg
                                        className={`w-5 h-5 ${isFavorite ? 'text-amber-400 fill-amber-400' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <p className="text-sm text-gray-600 mt-0.5">
                            <span className="font-medium">{tutor.experienceYears}+ Years</span> Experience
                        </p>

                        <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                                {tutor.mode === 'online' ? 'Online' : tutor.mode === 'home' ? 'Home' : 'Online & Home'}
                            </div>
                            {reviewCount > 0 && (
                                <div className="flex items-center gap-1">
                                    <span className="text-amber-500 text-xs">★</span>
                                    <span className="text-xs font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                                    <span className="text-[10px] text-gray-500">({reviewCount})</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="px-5 pb-5 space-y-4 flex-1">
                {/* Subjects */}
                <div className="flex flex-wrap gap-2">
                    {tutor.subjects?.slice(0, 3).map((subject, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-white text-gray-700 text-xs font-medium border border-gray-200">
                            {subject}
                        </span>
                    ))}
                    {tutor.subjects?.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500">+{tutor.subjects.length - 3}</span>
                    )}
                </div>

                {/* Location if Home Tuition */}
                {(tutor.mode === 'home' || tutor.mode === 'both') && tutor.userId?.location?.area && (
                    <div className="flex items-center text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {tutor.userId.location.area}, {tutor.userId.location.city}
                    </div>
                )}
            </div>


            {/* Footer / Actions */}
            <div className="px-5 pb-5 pt-4 border-t border-gray-200 mt-auto space-y-2">
                {user?.role === 'student' ? (
                    <>
                        {/* Primary Action - Smart Button */}
                        {loadingTrialStatus ? (
                            <button disabled className="w-full py-2.5 px-4 rounded-lg bg-gray-200 text-gray-500 text-sm font-semibold cursor-wait">
                                Loading...
                            </button>
                        ) : !trialStatus || !trialStatus.hasTriedTutor ? (
                            // No trial yet - PRIMARY CTA
                            <button
                                onClick={() => onRequestDemo(tutor)}
                                className="w-full py-3 px-4 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Try Free Demo Class
                            </button>
                        ) : trialStatus.status === 'pending' ? (
                            // Trial pending
                            <button
                                disabled
                                className="w-full py-3 px-4 rounded-md bg-yellow-50 text-yellow-800 text-sm font-semibold cursor-not-allowed border border-yellow-200"
                            >
                                Free Demo Pending...
                            </button>
                        ) : trialStatus.status === 'approved' ? (
                            // Trial scheduled
                            <button
                                onClick={() => navigate('/student-dashboard?tab=sessions')}
                                className="w-full py-3 px-4 rounded-md bg-green-50 text-green-800 text-sm font-semibold hover:bg-green-100 transition border border-green-200"
                            >
                                Demo Scheduled - View Details
                            </button>
                        ) : trialStatus.status === 'completed' ? (
                            // Trial done - encourage booking (PRIMARY)
                            <button
                                onClick={() => setShowRegularBooking(true)}
                                className="w-full py-3 px-4 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Book Paid Session
                            </button>
                        ) : (
                            // Default
                            <button
                                onClick={() => setShowRegularBooking(true)}
                                className="w-full py-3 px-4 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Book Session
                            </button>
                        )}

                        {/* Secondary Actions */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => navigate(`/tutor/${tutor._id}`)}
                                className="py-2 px-3 rounded-md bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition border border-gray-300"
                            >
                                View Profile
                            </button>
                            {!loadingTrialStatus && (!trialStatus || !trialStatus.hasTriedTutor) && (
                                <button
                                    onClick={() => setShowRegularBooking(true)}
                                    className="py-2 px-3 rounded-md bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition border border-gray-300"
                                >
                                    Book Paid Session
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    // Non-student view
                    <button
                        onClick={() => navigate(`/tutor/${tutor._id}`)}
                        className="w-full py-3 px-4 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        View Profile
                    </button>
                )}
            </div>

            {/* Regular Booking Modal */}
            {showRegularBooking && (
                <RegularBookingModal
                    tutor={tutor}
                    onClose={() => setShowRegularBooking(false)}
                    onSuccess={() => {
                        setShowRegularBooking(false);
                        checkTrialStatus(); // Refresh status
                    }}
                />
            )}
        </div>
    );
};

export default TutorCard;

