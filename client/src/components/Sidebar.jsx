import { Link } from 'react-router-dom';

const Sidebar = ({ user, activeTab, onTabChange }) => {
    const studentNav = [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'sessions', label: 'Sessions', icon: '📅' }, // Unified sessions & bookings
        { id: 'tutors', label: 'My Tutors', icon: '👨‍🏫' }, // Relationships & Search
        { id: 'resources', label: 'Resources', icon: '📚' }, // Materials & Reviews
        { id: 'profile', label: 'Profile', icon: '👤' }, // Settings & Progress
    ];

    const tutorNav = [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'sessions', label: 'Sessions', icon: '📅' }, // Unified sessions & bookings
        { id: 'students', label: 'My Students', icon: '👨‍🎓' }, // Relationships
        { id: 'resources', label: 'Resources', icon: '📚' }, // Materials & Reviews
        { id: 'profile', label: 'Profile', icon: '👤' }, // Settings & Profile Edit
    ];

    const navItems = user?.role === 'student' ? studentNav : tutorNav;

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
            <div className="p-6 border-b border-gray-200">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        TutNet
                    </span>
                </Link>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                    {user?.name}
                </p>
                <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {user?.role}
                    </span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeTab === item.id
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 icon-grayscale'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-indigo-900 mb-1">Need Help?</h4>
                    <p className="text-xs text-indigo-700 mb-3">Check our guide or contact support.</p>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                        View Documentation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
