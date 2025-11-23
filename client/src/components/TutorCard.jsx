import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TutorCard = ({ tutor, onBook }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [checkingFavorite, setCheckingFavorite] = useState(true);
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        if (user?.role === 'student' && tutor.userId?._id) {
            checkFavorite();
        } else {
            setCheckingFavorite(false);
        }
    }, [user, tutor]);

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

    // Get subject colors
    const getSubjectColor = (index) => {
        const colors = [
            'bg-blue-100 text-blue-800',
            'bg-green-100 text-green-800',
            'bg-purple-100 text-purple-800',
            'bg-pink-100 text-pink-800',
            'bg-yellow-100 text-yellow-800'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 sm:px-6 py-4">
                <div className="flex items-start justify-between text-white gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold mb-1 truncate">
                            {tutor.userId?.name}
                        </h3>
                        <p className="text-indigo-100 text-xs sm:text-sm flex items-center gap-1 truncate">
                            📍 {tutor.userId?.location?.area}, {tutor.userId?.location?.city || 'Hyderabad'}
                        </p>
                    </div>

                    {/* Rating Badge & Favorite */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {user?.role === 'student' && !checkingFavorite && (
                            <button
                                onClick={toggleFavorite}
                                className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 hover:bg-opacity-30 transition-colors"
                                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                <svg
                                    className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'text-yellow-300 fill-current' : 'text-white'}`}
                                    fill={isFavorite ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </button>
                        )}
                        {reviewCount > 0 && (
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-center">
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                    <span className="text-yellow-300 text-sm sm:text-lg">★</span>
                                    <span className="font-bold text-sm sm:text-lg">{averageRating.toFixed(1)}</span>
                                </div>
                                <p className="text-[10px] sm:text-xs text-indigo-100">{reviewCount} reviews</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
                {/* Subjects */}
                <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Subjects</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {tutor.subjects?.slice(0, 4).map((subject, index) => (
                            <span
                                key={index}
                                className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getSubjectColor(index)}`}
                            >
                                {subject}
                            </span>
                        ))}
                        {tutor.subjects?.length > 4 && (
                            <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-600">
                                +{tutor.subjects.length - 4} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Classes */}
                <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Classes</p>
                    <p className="text-xs sm:text-sm text-gray-600">{tutor.classes?.join(', ')}</p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Hourly Rate</p>
                        <p className="text-base sm:text-lg font-bold text-indigo-600">₹{tutor.hourlyRate}</p>
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Experience</p>
                        <p className="text-base sm:text-lg font-bold text-gray-900">{tutor.experienceYears} years</p>
                    </div>
                </div>

                {/* Bio */}
                {tutor.bio && (
                    <div className="mb-3 sm:mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-1">About</p>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{tutor.bio}</p>
                    </div>
                )}

                {/* Book Button */}
                <button
                    onClick={() => onBook(tutor)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm sm:text-base"
                >
                    Book Now
                </button>
            </div>
        </div>
    );
};

export default TutorCard;
