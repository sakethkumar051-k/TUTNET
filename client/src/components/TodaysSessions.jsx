import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import SessionDetailsModal from './SessionDetailsModal';

const TodaysSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);
    const { user } = useAuth();
    const { showError } = useToast();

    useEffect(() => {
        fetchTodaysSessions();
        // Refresh every 5 minutes
        const interval = setInterval(fetchTodaysSessions, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchTodaysSessions = async () => {
        try {
            const { data } = await api.get('/current-tutors/today');
            setSessions(data);
        } catch (err) {
            showError('Failed to fetch today\'s sessions');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            scheduled: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            student_absent: 'bg-red-100 text-red-800',
            tutor_absent: 'bg-orange-100 text-orange-800',
            rescheduled: 'bg-yellow-100 text-yellow-800'
        };
        return colors[status] || colors.scheduled;
    };

    if (loading) {
        return <div className="text-center py-8">Loading today's sessions...</div>;
    }

    const title = user?.role === 'student' ? "Today's Classes" : "Today's Sessions";

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
                
                {sessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No sessions scheduled for today</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sessions.map((session) => (
                            <div
                                key={session._id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900">
                                                {user?.role === 'student' 
                                                    ? session.tutorId?.name 
                                                    : session.studentId?.name}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.attendanceStatus || session.status)}`}>
                                                {session.attendanceStatus || session.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            📚 {session.subject}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            ⏰ {session.preferredSchedule}
                                            {session.sessionDate && (
                                                <span className="ml-2">
                                                    ({new Date(session.sessionDate).toLocaleTimeString()})
                                                </span>
                                            )}
                                        </p>
                                        {session.duration && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Duration: {session.duration} minutes
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        <button
                                            onClick={() => setSelectedSession(session)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                                        >
                                            View Details
                                        </button>
                                        {session.onlineLink && (
                                            <a
                                                href={session.onlineLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium text-center"
                                            >
                                                Join Session
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Session Details Modal */}
            {selectedSession && (
                <SessionDetailsModal
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                    onUpdate={fetchTodaysSessions}
                />
            )}
        </div>
    );
};

export default TodaysSessions;

