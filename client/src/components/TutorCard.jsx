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

    // Get elegant subject colors - more sophisticated palette
    const getSubjectColor = (index) => {
        const colors = [
            'bg-slate-100 text-slate-700 border border-slate-200',
            'bg-blue-50 text-blue-700 border border-blue-200',
            'bg-emerald-50 text-emerald-700 border border-emerald-200',
            'bg-amber-50 text-amber-700 border border-amber-200',
            'bg-rose-50 text-rose-700 border border-rose-200'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/60 hover:border-indigo-300/50 relative">
            {/* Elegant Top Accent Bar */}
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            {/* Header Section - Elegant and Clean */}
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 truncate tracking-tight">
                                {tutor.userId?.name}
                            </h3>
                            {user?.role === 'student' && !checkingFavorite && (
                                <button
                                    onClick={toggleFavorite}
                                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/60 transition-all duration-200 group/fav"
                                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    <svg
                                        className={`w-5 h-5 transition-all duration-200 ${
                                            isFavorite 
                                                ? 'text-amber-500 fill-amber-500 scale-110' 
                                                : 'text-gray-400 group-hover/fav:text-amber-400'
                                        }`}
                                        fill={isFavorite ? 'currentColor' : 'none'}
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{tutor.userId?.location?.area}, {tutor.userId?.location?.city || 'Hyderabad'}</span>
                        </div>
                    </div>

                    {/* Rating Badge - Elegant Design */}
                    {reviewCount > 0 && (
                        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-gray-200/60 shadow-sm">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <svg className="w-4 h-4 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-bold text-gray-900 text-base">{averageRating.toFixed(1)}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 sm:p-6 space-y-5">
                {/* Subjects - Elegant Pills */}
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Subjects</p>
                    <div className="flex flex-wrap gap-2">
                        {tutor.subjects?.slice(0, 4).map((subject, index) => (
                            <span
                                key={index}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getSubjectColor(index)} transition-all duration-200 hover:scale-105`}
                            >
                                {subject}
                            </span>
                        ))}
                        {tutor.subjects?.length > 4 && (
                            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                +{tutor.subjects.length - 4} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Classes */}
                {tutor.classes && tutor.classes.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Classes</p>
                        <p className="text-sm text-gray-700 font-medium">{tutor.classes.join(', ')}</p>
                    </div>
                )}

                {/* Info Cards - Elegant Design */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4 border border-indigo-100">
                        <p className="text-[10px] sm:text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1.5">Rate</p>
                        <p className="text-xl sm:text-2xl font-bold text-indigo-700">₹{tutor.hourlyRate}</p>
                        <p className="text-[10px] text-indigo-600/70 mt-0.5">per hour</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200">
                        <p className="text-[10px] sm:text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1.5">Experience</p>
                        <p className="text-xl sm:text-2xl font-bold text-slate-800">{tutor.experienceYears}</p>
                        <p className="text-[10px] text-slate-600/70 mt-0.5">years</p>
                    </div>
                </div>

                {/* Bio */}
                {tutor.bio && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About</p>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{tutor.bio}</p>
                    </div>
                )}

                {/* Elegant Book Button */}
                <button
                    onClick={() => onBook(tutor)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm sm:text-base"
                >
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Book Session
                    </span>
                </button>
            </div>
        </div>
    );
};

export default TutorCard;
