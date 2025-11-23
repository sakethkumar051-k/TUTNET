import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const FavoriteTutors = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const { data } = await api.get('/favorites');
            setFavorites(data);
        } catch (err) {
            showError('Failed to fetch favorite tutors');
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (tutorId) => {
        try {
            await api.delete(`/favorites/${tutorId}`);
            setFavorites(favorites.filter(f => f.tutorId._id !== tutorId));
            showSuccess('Removed from favorites');
        } catch (err) {
            showError('Failed to remove favorite');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading favorites...</div>;
    }

    return (
        <div className="space-y-4">
            {favorites.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-lg text-gray-500 mb-2">No favorite tutors yet</p>
                    <p className="text-sm text-gray-400">Start adding tutors to your favorites!</p>
                    <Link
                        to="/student-dashboard"
                        className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Find Tutors
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((favorite) => {
                        const tutor = favorite.tutorId;
                        const profile = favorite.tutorProfile;
                        return (
                            <div
                                key={favorite._id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{tutor.name}</h3>
                                        <p className="text-sm text-gray-500">{tutor.email}</p>
                                        {tutor.location && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                📍 {tutor.location.area}, {tutor.location.city}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeFavorite(tutor._id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Remove from favorites"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                                {profile && (
                                    <div className="space-y-2 mb-3">
                                        {profile.subjects && profile.subjects.length > 0 && (
                                            <div>
                                                <p className="text-xs text-gray-500">Subjects:</p>
                                                <p className="text-sm text-gray-700">{profile.subjects.join(', ')}</p>
                                            </div>
                                        )}
                                        {profile.hourlyRate > 0 && (
                                            <p className="text-sm text-gray-700">
                                                💰 ₹{profile.hourlyRate}/hr
                                            </p>
                                        )}
                                    </div>
                                )}
                                <Link
                                    to={`/tutors/${tutor._id}`}
                                    className="block w-full text-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors text-sm font-medium"
                                >
                                    View Profile
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FavoriteTutors;

