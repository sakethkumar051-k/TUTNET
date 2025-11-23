import { useState, useEffect } from 'react';
import api from '../utils/api';
import AdminAnalytics from '../components/AdminAnalytics';

const AdminDashboard = () => {
    const [pendingTutors, setPendingTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('approvals');

    const fetchPendingTutors = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/tutors/pending');
            setPendingTutors(data);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to fetch pending tutors' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingTutors();
    }, []);

    const handleApprove = async (tutorId) => {
        try {
            await api.patch(`/admin/tutors/${tutorId}/approve`);
            setMessage({ type: 'success', text: 'Tutor approved successfully' });
            fetchPendingTutors();
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to approve tutor' });
        }
    };

    const handleReject = async (tutorId) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        try {
            await api.patch(`/admin/tutors/${tutorId}/reject`, { reason });
            setMessage({ type: 'success', text: 'Tutor rejected successfully' });
            fetchPendingTutors();
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to reject tutor' });
        }
    };

    const tabs = [
        { id: 'approvals', label: 'Pending Approvals', icon: '✅' },
        { id: 'analytics', label: 'Analytics & Reports', icon: '📊' }
    ];

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Left Sidebar Navigation */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-16 bottom-0 z-40">
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                </div>
                <nav className="flex-1 overflow-y-auto p-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-indigo-50 text-indigo-600 font-semibold border-l-4 border-indigo-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            <span className="text-sm">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto ml-64">
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    {message.text && (
                        <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Tab Content */}
                    {activeTab === 'analytics' ? (
                        <AdminAnalytics />
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <button
                                    onClick={fetchPendingTutors}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </button>
                            </div>
                            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Pending Tutor Approvals
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {pendingTutors.length} tutor(s) waiting for approval
                        </p>
                    </div>

                    {loading ? (
                        <div className="px-4 py-5">Loading...</div>
                    ) : pendingTutors.length === 0 ? (
                        <div className="px-4 py-5 text-gray-500">No pending tutors</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {pendingTutors.map((tutor) => (
                                <li key={tutor._id} className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-indigo-600 truncate">
                                                    {tutor.userId?.name}
                                                </p>
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        Pending
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        Email: {tutor.userId?.email}
                                                    </p>
                                                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                        Phone: {tutor.userId?.phone}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Location: {tutor.userId?.location?.area}, {tutor.userId?.location?.city}
                                                </p>
                                                {tutor.subjects.length > 0 && (
                                                    <p className="text-sm text-gray-500">
                                                        Subjects: {tutor.subjects.join(', ')}
                                                    </p>
                                                )}
                                                {tutor.classes.length > 0 && (
                                                    <p className="text-sm text-gray-500">
                                                        Classes: {tutor.classes.join(', ')}
                                                    </p>
                                                )}
                                                {tutor.hourlyRate > 0 && (
                                                    <p className="text-sm text-gray-500">
                                                        Rate: ₹{tutor.hourlyRate}/hr
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0 flex space-x-2">
                                            <button
                                                onClick={() => handleApprove(tutor._id)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(tutor._id)}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
