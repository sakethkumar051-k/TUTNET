import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import SessionCalendar from './SessionCalendar';
import SessionDetailsModal from './SessionDetailsModal';
import TodaysSessions from './TodaysSessions';

const SessionManagementDashboard = () => {
    const [searchParams] = useSearchParams();
    const [relationship, setRelationship] = useState(null);
    const [todaysSessions, setTodaysSessions] = useState([]);
    const [todaysNotes, setTodaysNotes] = useState([]);
    const [todaysFeedback, setTodaysFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);
    const { user } = useAuth();
    const { showError } = useToast();

    const tutorId = searchParams.get('tutorId');
    const studentId = searchParams.get('studentId');
    const currentTutorId = searchParams.get('currentTutorId');

    useEffect(() => {
        fetchRelationshipData();
        fetchTodaysData();
    }, [tutorId, studentId, currentTutorId]);

    const fetchRelationshipData = async () => {
        try {
            let relationshipData = null;
            
            if (currentTutorId) {
                // If we have currentTutorId, use it directly
                try {
                    const { data: analytics } = await api.get(`/current-tutors/analytics/${currentTutorId}`);
                    relationshipData = analytics.relationship;
                } catch (err) {
                    // Fallback: try to get relationship directly
                    const { data: tutors } = user?.role === 'student' 
                        ? await api.get('/current-tutors/student/my-tutors')
                        : await api.get('/current-tutors/tutor/my-students');
                    relationshipData = tutors.find(t => t._id === currentTutorId);
                }
            } else if (user?.role === 'student' && tutorId) {
                const { data: tutors } = await api.get('/current-tutors/student/my-tutors');
                const rel = tutors.find(t => t.tutorId._id === tutorId || t.tutorId?._id === tutorId);
                if (rel) {
                    relationshipData = rel;
                }
            } else if (user?.role === 'tutor' && studentId) {
                const { data: students } = await api.get('/current-tutors/tutor/my-students');
                const rel = students.find(s => s.studentId._id === studentId || s.studentId?._id === studentId);
                if (rel) {
                    relationshipData = rel;
                }
            }

            if (relationshipData) {
                setRelationship(relationshipData);
            }
        } catch (err) {
            console.error('Failed to fetch relationship data:', err);
            showError('Failed to fetch relationship data');
        } finally {
            setLoading(false);
        }
    };

    const fetchTodaysData = async () => {
        try {
            // Fetch today's sessions
            const { data: sessions } = await api.get('/current-tutors/today');
            const today = new Date().toISOString().split('T')[0];
            const todays = sessions.filter(s => {
                if (s.sessionDate) {
                    return s.sessionDate.split('T')[0] === today;
                }
                return s.preferredSchedule.includes(today);
            });
            setTodaysSessions(todays);

            // Fetch today's notes and feedback
            const notes = [];
            const feedbacks = [];

            for (const session of todays) {
                try {
                    const { data: feedback } = await api.get(`/session-feedback/booking/${session._id}`);
                    if (feedback) {
                        if (feedback.tutorSummary) {
                            notes.push({
                                session,
                                summary: feedback.tutorSummary,
                                topics: feedback.topicsCovered || [],
                                understanding: feedback.understandingScore
                            });
                        }
                        if (feedback.studentRating || feedback.tutorSummary) {
                            feedbacks.push({
                                session,
                                tutorFeedback: feedback.tutorSummary,
                                studentRating: feedback.studentRating,
                                studentComment: feedback.studentComment,
                                understandingScore: feedback.understandingScore
                            });
                        }
                    }
                } catch (err) {
                    // Feedback might not exist yet
                }
            }

            setTodaysNotes(notes);
            setTodaysFeedback(feedbacks);
        } catch (err) {
            console.error('Failed to fetch today\'s data:', err);
        }
    };

    const handleBookingCreated = () => {
        fetchTodaysData();
        fetchRelationshipData();
    };

    if (loading) {
        return <div className="text-center py-8">Loading dashboard...</div>;
    }

    if (!relationship) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No relationship found. Please establish a relationship first.</p>
            </div>
        );
    }

    const otherUser = user?.role === 'student' 
        ? relationship.tutorId 
        : relationship.studentId;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Session Management
                </h2>
                <p className="text-gray-600">
                    {user?.role === 'student' 
                        ? `With ${relationship.tutorId?.name || otherUser?.name} - ${relationship.subject}`
                        : `With ${relationship.studentId?.name || otherUser?.name} - ${relationship.subject}`}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Calendar & Today's Sessions */}
                <div className="space-y-6">
                    {/* Calendar */}
                    <SessionCalendar
                        currentTutorId={relationship._id}
                        tutorId={relationship.tutorId?._id || tutorId}
                        studentId={relationship.studentId?._id || studentId}
                        subject={relationship.subject}
                        onBookingCreated={handleBookingCreated}
                    />

                    {/* Today's Sessions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Sessions</h3>
                        {todaysSessions.length === 0 ? (
                            <p className="text-gray-500 text-sm">No sessions scheduled for today</p>
                        ) : (
                            <div className="space-y-3">
                                {todaysSessions.map(session => (
                                    <div
                                        key={session._id}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => setSelectedSession(session)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {session.preferredSchedule}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {session.subject}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                session.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {session.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Today's Notes & Feedback */}
                <div className="space-y-6">
                    {/* Today's Discussion Notes */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Discussion Notes</h3>
                        {todaysNotes.length === 0 ? (
                            <p className="text-gray-500 text-sm">No notes for today's sessions yet</p>
                        ) : (
                            <div className="space-y-4">
                                {todaysNotes.map((note, index) => (
                                    <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-gray-700">
                                                {note.session.preferredSchedule}
                                            </p>
                                            {note.understanding && (
                                                <span className="text-xs text-gray-500">
                                                    Understanding: {note.understanding}/5
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{note.summary}</p>
                                        {note.topics.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {note.topics.map((topic, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs"
                                                    >
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Today's Feedback */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Feedback</h3>
                        {todaysFeedback.length === 0 ? (
                            <p className="text-gray-500 text-sm">No feedback for today's sessions yet</p>
                        ) : (
                            <div className="space-y-4">
                                {todaysFeedback.map((feedback, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            {feedback.session.preferredSchedule}
                                        </p>
                                        {feedback.tutorFeedback && (
                                            <div className="mb-3">
                                                <p className="text-xs text-gray-500 mb-1">Tutor Summary:</p>
                                                <p className="text-sm text-gray-700">{feedback.tutorFeedback}</p>
                                                {feedback.understandingScore && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Understanding Score: {feedback.understandingScore}/5
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {feedback.studentRating && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Student Rating:</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">⭐</span>
                                                    <span className="text-sm font-medium">{feedback.studentRating}/5</span>
                                                </div>
                                                {feedback.studentComment && (
                                                    <p className="text-sm text-gray-600 mt-1">{feedback.studentComment}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Session Details Modal */}
            {selectedSession && (
                <SessionDetailsModal
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                    onUpdate={() => {
                        fetchTodaysData();
                        fetchRelationshipData();
                    }}
                />
            )}
        </div>
    );
};

export default SessionManagementDashboard;

