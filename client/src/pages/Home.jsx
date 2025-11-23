import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TutorCard from '../components/TutorCard';
import BookingForm from '../components/BookingForm';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showSuccess } = useToast();
    const [featuredTutors, setFeaturedTutors] = useState([]);
    const [loadingTutors, setLoadingTutors] = useState(true);
    const [selectedTutor, setSelectedTutor] = useState(null);

    useEffect(() => {
        fetchFeaturedTutors();
    }, []);

    const fetchFeaturedTutors = async () => {
        try {
            const { data } = await api.get('/tutors?limit=6');
            setFeaturedTutors(data);
        } catch (err) {
            console.error('Error fetching tutors:', err);
        } finally {
            setLoadingTutors(false);
        }
    };

    const handleBookingSuccess = () => {
        showSuccess('Booking request sent successfully!');
        setSelectedTutor(null);
    };

    const handleBookClick = (tutor) => {
        if (!user) {
            // Redirect to login with return path
            navigate('/login?redirect=/');
            return;
        }
        if (user.role !== 'student') {
            showSuccess('Please login as a student to book tutors');
            return;
        }
        setSelectedTutor(tutor);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="text-center">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block">Find Your Perfect</span>
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                        Home Tutor
                                    </span>
                                </h1>
                                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                                    Connect with qualified, verified tutors in West Hyderabad. Get personalized, one-on-one learning in the comfort of your home.
                                </p>
                                {!user && (
                                    <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8 gap-3">
                                        <div className="rounded-xl shadow">
                                            <Link
                                                to="/register"
                                                className="w-full flex items-center justify-center px-6 py-3 sm:px-8 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/50"
                                            >
                                                Get Started
                                            </Link>
                                        </div>
                                        <div className="mt-3 rounded-xl shadow sm:mt-0">
                                            <Link
                                                to="/login"
                                                className="w-full flex items-center justify-center px-6 py-3 sm:px-8 border border-gray-300 text-base font-medium rounded-xl text-indigo-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all duration-300"
                                            >
                                                Sign In
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                </div>
                {/* Decorative background */}
                <div className="absolute top-0 right-0 -mr-40 -mt-40 w-80 h-80 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-50 blur-3xl"></div>
            </div>

            {/* Stats Section */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden rounded-2xl border border-indigo-100">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 truncate">Verified Tutors</dt>
                                <dd className="mt-1 text-3xl font-semibold text-indigo-600">500+</dd>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden rounded-2xl border border-blue-100">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 truncate">Happy Students</dt>
                                <dd className="mt-1 text-3xl font-semibold text-blue-600">2,000+</dd>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden rounded-2xl border border-purple-100">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                                <dd className="mt-1 text-3xl font-semibold text-purple-600">95%</dd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How it Works Section */}
            <div className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Process</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            How It Works
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            Simple steps to start your learning journey
                        </p>
                    </div>

                    <div className="mt-12 sm:mt-16">
                        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-bold mb-4">
                                        1
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sign Up</h3>
                                    <p className="text-base text-gray-500">
                                        Create an account as a student or tutor. Quick and easy registration process.
                                    </p>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold mb-4">
                                        2
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Find a Match</h3>
                                    <p className="text-base text-gray-500">
                                        Browse verified tutors by subject, class, and location. View detailed profiles and ratings.
                                    </p>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold mb-4">
                                        3
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start Learning</h3>
                                    <p className="text-base text-gray-500">
                                        Book a session and begin your personalized learning journey with expert tutors.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Benefits</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Why Choose Tutnet?
                        </p>
                    </div>

                    <div className="mt-12 sm:mt-16">
                        <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="pt-6">
                                <div className="flow-root bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl px-6 pb-8 border border-indigo-100 hover:shadow-lg transition-shadow duration-300">
                                    <div className="-mt-6">
                                        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Verified Tutors</h3>
                                        <p className="mt-5 text-base text-gray-500">
                                            All tutors undergo a thorough verification process to ensure quality and safety for students.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <div className="flow-root bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl px-6 pb-8 border border-blue-100 hover:shadow-lg transition-shadow duration-300">
                                    <div className="-mt-6">
                                        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Personalized Learning</h3>
                                        <p className="mt-5 text-base text-gray-500">
                                            Get one-on-one attention tailored to your specific learning needs and pace.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <div className="flow-root bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl px-6 pb-8 border border-purple-100 hover:shadow-lg transition-shadow duration-300">
                                    <div className="-mt-6">
                                        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Local & Convenient</h3>
                                        <p className="mt-5 text-base text-gray-500">
                                            Find experienced tutors in your local area across West Hyderabad for easy home tuition.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Tutors Section */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Browse Tutors</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Find Your Perfect Tutor
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            Browse our verified tutors and start your learning journey today
                        </p>
                        {!user && (
                            <p className="mt-2 text-sm text-gray-500">
                                Sign up or sign in to book a session
                            </p>
                        )}
                    </div>

                    {loadingTutors ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <LoadingSkeleton type="card" count={6} />
                        </div>
                    ) : featuredTutors.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No tutors available at the moment. Check back later!</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {featuredTutors.map(tutor => (
                                    <TutorCard
                                        key={tutor._id}
                                        tutor={tutor}
                                        onBook={() => handleBookClick(tutor)}
                                    />
                                ))}
                            </div>
                            <div className="text-center">
                                <Link
                                    to="/find-tutors"
                                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/50"
                                >
                                    {user ? 'View All Tutors' : 'Sign Up to View All Tutors'}
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            {!user && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
                        <div className="lg:flex lg:items-center lg:justify-between">
                            <div className="text-center lg:text-left mb-8 lg:mb-0">
                                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                    <span className="block">Ready to get started?</span>
                                    <span className="block text-indigo-200">Join Tutnet today.</span>
                                </h2>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end lg:flex-shrink-0">
                                <div className="inline-flex rounded-xl shadow">
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-300"
                                    >
                                        Get started
                                    </Link>
                                </div>
                                <div className="inline-flex rounded-xl shadow">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-700 hover:bg-indigo-800 transition-colors duration-300"
                                    >
                                        Sign in
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {selectedTutor && user && (
                <BookingForm
                    tutorId={selectedTutor.userId?._id}
                    tutorName={selectedTutor.userId?.name}
                    onClose={() => setSelectedTutor(null)}
                    onSuccess={handleBookingSuccess}
                />
            )}
        </div>
    );
};

export default Home;
