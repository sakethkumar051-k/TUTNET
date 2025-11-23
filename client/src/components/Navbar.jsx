import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardLink = () => {
        if (user?.role === 'admin') return '/admin-dashboard';
        if (user?.role === 'tutor') return '/tutor-dashboard';
        return '/student-dashboard';
    };

    return (
        <nav className="bg-gray-50 border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Logo and Navigation */}
                    <div className="flex items-center space-x-4">
                        {/* Logo */}
                        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                            <img
                                src="/tutnet-logo.png"
                                alt="Tutnet Logo"
                                className="h-7"
                            />
                        </Link>

                        {/* Navigation Links - Show for all users */}
                        <div className="hidden md:flex items-center space-x-1">
                            <Link
                                to="/"
                                className="px-4 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                            >
                                Home
                            </Link>

                            {!user && (
                                <Link
                                    to="/register"
                                    className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1"
                                >
                                    Apply as Tutor
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </Link>
                            )}

                            <span className="px-4 py-1.5 text-sm font-medium text-gray-400 cursor-not-allowed flex items-center gap-2">
                                Courses
                                <span className="text-xs text-blue-500 font-semibold">Coming soon!</span>
                            </span>

                            <Link
                                to={user ? getDashboardLink() : "/login"}
                                className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                            >
                                Find tutors
                            </Link>

                            {user && (
                                <Link
                                    to={getDashboardLink()}
                                    className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right: User Actions */}
                    <div className="flex items-center space-x-3">
                        {user ? (
                            <>
                                <span className="hidden md:block text-sm text-gray-600 px-3">
                                    <span className="font-medium">{user.name}</span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 border border-gray-300 rounded-full transition-colors flex items-center justify-center"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors flex items-center justify-center"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-full transition-colors shadow-sm flex items-center justify-center"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
