import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import RequestDemoModal from '../components/RequestDemoModal';

const TutorProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tutor, setTutor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDemoModal, setShowDemoModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, reviewsRes] = await Promise.all([
                    api.get(`/tutors/${id}`),
                    api.get(`/reviews/tutor/${id}`) // Assuming review endpoint accepts tutorProfile or userId, verification needed. 
                    // Based on code, reviews might be by tutor userId. 
                    // NOTE: TutorProfile.userId is what we usually use. 
                    // Let's check if 'id' param is TutorProfile ID. 
                    // getTutorById fetches TutorProfile.
                ]);

                setTutor(profileRes.data);

                // If reviews endpoint needs USER ID, we use profileRes.data.userId._id
                // But for now let's try fetching efficiently.
                if (profileRes.data.userId) {
                    const realReviews = await api.get(`/reviews/tutor/${profileRes.data.userId._id}`);
                    setReviews(realReviews.data);
                }
            } catch (err) {
                console.error('Error fetching tutor details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                {user && <Sidebar user={user} />}
                <div className="flex-1 overflow-auto">
                    <div className="p-8 max-w-5xl mx-auto">
                        <LoadingSkeleton type="profile" />
                    </div>
                </div>
            </div>
        );
    }

    if (!tutor) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Tutor not found</h2>
                    <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:text-indigo-800">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Helper for initials
    const getInitials = (name) => name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Conditionally render sidebar based on auth */}
            {user && <Sidebar user={user} activeTab="find-tutors" />}

            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="mb-6 flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Tutors
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Brief Info & Sticky CTA */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center relative overflow-hidden">
                                    <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500 absolute top-0 left-0 w-full"></div>

                                    <div className="relative mt-8 mb-4">
                                        {tutor.userId?.profilePicture ? (
                                            <img
                                                src={tutor.userId.profilePicture}
                                                alt={tutor.userId.name}
                                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mx-auto"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-4xl border-4 border-white shadow-md mx-auto">
                                                {getInitials(tutor.userId?.name)}
                                            </div>
                                        )}
                                    </div>

                                    <h1 className="text-2xl font-bold text-gray-900">{tutor.userId?.name}</h1>
                                    <div className="flex items-center justify-center gap-2 mt-2 text-gray-600">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase font-semibold tracking-wide">
                                            {tutor.mode === 'both' ? 'Online & Home' : tutor.mode}
                                        </span>
                                    </div>

                                    <div className="mt-6 flex justify-center items-center gap-8 border-t border-gray-50 pt-6">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">₹{tutor.hourlyRate}</p>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Per Hour</p>
                                        </div>
                                        <div className="w-px h-8 bg-gray-100"></div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{tutor.experienceYears}</p>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Years Exp</p>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            onClick={() => setShowDemoModal(true)}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
                                        >
                                            Request Demo Class
                                        </button>
                                        <p className="text-xs text-gray-400 mt-3">Free 30-min session to get started</p>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Overview</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 text-sm">Review Rating</span>
                                            <div className="flex items-center font-bold text-gray-900">
                                                <span className="text-amber-500 mr-1">★</span>
                                                {tutor.averageRating?.toFixed(1) || '0.0'}
                                                <span className="text-gray-400 font-normal text-xs ml-1">({tutor.totalReviews || 0})</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 text-sm">Location</span>
                                            <span className="text-gray-900 font-medium text-sm text-right truncate pl-4">
                                                {tutor.userId?.location?.area}, {tutor.userId?.location?.city}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 text-sm">Languages</span>
                                            <span className="text-gray-900 font-medium text-sm text-right truncate pl-4">
                                                {tutor.languages?.join(', ') || 'English'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Detailed Info */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* About */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                        {tutor.bio || "This tutor hasn't added a bio yet."}
                                    </p>
                                </div>

                                {/* Expertise */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Expertise</h2>

                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Subjects</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {tutor.subjects?.map((subject, idx) => (
                                                <span key={idx} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Classes / Grades</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {tutor.classes?.map((cls, idx) => (
                                                <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                                                    {cls}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Education */}
                                    {tutor.education && (tutor.education.degree || tutor.education.institution) && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Education</h3>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                {tutor.education.degree && (
                                                    <p className="text-gray-900 font-medium">{tutor.education.degree}</p>
                                                )}
                                                {tutor.education.institution && (
                                                    <p className="text-gray-600 text-sm mt-1">{tutor.education.institution}</p>
                                                )}
                                                {tutor.education.year && (
                                                    <p className="text-gray-500 text-xs mt-1">Year: {tutor.education.year}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Qualifications */}
                                    {tutor.qualifications && tutor.qualifications.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Qualifications</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {tutor.qualifications.map((qual, idx) => (
                                                    <span key={idx} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                                                        {qual}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Availability */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Availability</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {tutor.availableSlots?.length > 0 ? (
                                            tutor.availableSlots.map((slot, idx) => (
                                                <div key={idx} className="flex items-center p-3 border border-gray-100 rounded-lg bg-gray-50">
                                                    <span className="text-green-500 mr-2">●</span>
                                                    <span className="text-gray-700 text-sm font-medium">{slot}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">Contact for availability</p>
                                        )}
                                    </div>
                                </div>

                                {/* Reviews */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Student Reviews</h2>
                                        {reviews.length > 0 && (
                                            <span className="text-sm text-gray-500">
                                                Showing {reviews.length} reviews
                                            </span>
                                        )}
                                    </div>

                                    {reviews.length > 0 ? (
                                        <div className="space-y-6">
                                            {reviews.map((review) => (
                                                <div key={review._id} className="border-b border-gray-50 last:border-0 pb-6 last:pb-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                                {getInitials(review.studentId?.name)}
                                                            </div>
                                                            <span className="font-semibold text-gray-900 text-sm">{review.studentId?.name}</span>
                                                        </div>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center mb-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={`text-sm ${i < review.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                                                        ))}
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-400">No reviews yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal */}
            {showDemoModal && (
                <RequestDemoModal
                    tutor={tutor}
                    onClose={() => setShowDemoModal(false)}
                    onSuccess={() => {
                        // Optional: Navigate to requests/dashboard
                    }}
                />
            )}
        </div>
    );
};

export default TutorProfilePage;
