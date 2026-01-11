import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [], requireOnboarding = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // 1. If not logged in, send to login
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // 2. If user is logged in but needs onboarding (e.g. no phone/role)
    // We check this by seeing if they have a role other than 'student' (default) OR if they lack specific fields
    // NOTE: This logic depends on how your backend flags new users.
    // If you strictly want to force /complete-profile, you might need a flag on the user object.
    // For now, let's assume if they are accessing dashboard, they should be 'complete'.

    // 3. Role-based protection
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard if they try to access a wrong role page
        if (user.role === 'tutor') return <Navigate to="/tutor-dashboard" replace />;
        if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
        return <Navigate to="/student-dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
