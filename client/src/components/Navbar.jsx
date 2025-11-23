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
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Logo and Navigation */}
                    <div className="flex items-center space-x-8">
                        {/* Logo */}
                        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                            <img
                                src="/tutnet-logo.png"
                                alt="Tutnet Logo"
                                className="h-8"
                            />
                        </Link>

                        {/* Navigation Links - Only show when not logged in */}
                        {!user && (
                            <div className="hidden md:flex items-center space-x-6">
                                <Link
                                    to="/"
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                                >
                                    Apply as Tutor
                                </Link>
                                <Link
                                    to="/student-dashboard"
                                    className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                                >
                                    Find tutors
                                </Link>
                            </div>
                        )}

                        {/* When logged in, show dashboard link on left */}
                        {user && (
                            <div className="hidden md:flex items-center space-x-6">
                                <Link
                                    to={getDashboardLink()}
                                    className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right: User Actions */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="hidden md:block text-sm text-gray-700">
                                    Welcome, <span className="font-semibold">{user.name}</span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-full transition-colors shadow-md"
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
