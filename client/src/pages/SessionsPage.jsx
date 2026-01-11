import { useState, useEffect } from 'react';
import BookingList from '../components/BookingList';
import TodaysSessions from '../components/TodaysSessions';
import SessionHistory from '../components/SessionHistory';
import SessionManagementDashboard from '../components/SessionManagementDashboard'; // The calendar view
import { useAuth } from '../context/AuthContext';

const SessionsPage = () => {
    const [view, setView] = useState('timeline'); // timeline, calendar, requests, history
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Your Sessions</h1>
                    <p className="text-gray-500 mt-1">Manage your schedule and bookings</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {[
                        { id: 'timeline', label: 'Timeline' },
                        { id: 'calendar', label: 'Calendar' },
                        { id: 'requests', label: 'Requests' },
                        { id: 'history', label: 'History' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === tab.id
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-[500px]">
                {view === 'timeline' && (
                    <div className="space-y-8">
                        {/* Timeline focuses on: Today's immediate actions */}
                        <section>
                            {/* <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1">Happening Today</h2> */}
                            <TodaysSessions />
                        </section>
                    </div>
                )}

                {view === 'calendar' && (
                    <SessionManagementDashboard />
                )}

                {view === 'requests' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Booking Requests</h2>
                            <p className="text-sm text-gray-500">
                                {user?.role === 'tutor'
                                    ? 'Approve or reject incoming session requests'
                                    : 'Track status of your requested sessions'}
                            </p>
                        </div>
                        <div className="p-0">
                            <BookingList role={user?.role} />
                        </div>
                    </div>
                )}

                {view === 'history' && (
                    <SessionHistory />
                )}
            </div>
        </div>
    );
};

export default SessionsPage;
