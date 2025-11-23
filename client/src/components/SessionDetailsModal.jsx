import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const SessionDetailsModal = ({ session, onClose, onUpdate }) => {
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();

    // Form states
    const [tutorFeedback, setTutorFeedback] = useState({
        tutorSummary: '',
        understandingScore: 3,
        topicsCovered: '',
        nextSteps: ''
    });
    const [studentFeedback, setStudentFeedback] = useState({
        studentRating: 3,
        studentComment: ''
    });
    const [studyMaterial, setStudyMaterial] = useState({
        type: 'topic',
        title: '',
        url: '',
        description: ''
    });
    const [homework, setHomework] = useState({
        description: '',
        dueDate: ''
    });
    const [attendance, setAttendance] = useState({
        status: 'completed',
        duration: 60,
        notes: ''
    });

    useEffect(() => {
        fetchFeedback();
    }, [session]);

    const fetchFeedback = async () => {
        try {
            const { data } = await api.get(`/session-feedback/booking/${session._id}`);
            setFeedback(data);
            if (data.tutorSummary) {
                setTutorFeedback({
                    tutorSummary: data.tutorSummary || '',
                    understandingScore: data.understandingScore || 3,
                    topicsCovered: (data.topicsCovered || []).join(', '),
                    nextSteps: data.nextSteps || ''
                });
            }
            if (data.studentRating) {
                setStudentFeedback({
                    studentRating: data.studentRating || 3,
                    studentComment: data.studentComment || ''
                });
            }
        } catch (err) {
            // Feedback might not exist yet
            setFeedback(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitTutorFeedback = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/session-feedback/booking/${session._id}/tutor-feedback`, {
                ...tutorFeedback,
                topicsCovered: tutorFeedback.topicsCovered.split(',').map(t => t.trim()).filter(t => t)
            });
            showSuccess('Feedback submitted successfully');
            fetchFeedback();
            onUpdate?.();
        } catch (err) {
            showError('Failed to submit feedback');
        }
    };

    const handleSubmitStudentFeedback = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/session-feedback/booking/${session._id}/student-feedback`, studentFeedback);
            showSuccess('Feedback submitted successfully');
            fetchFeedback();
            onUpdate?.();
        } catch (err) {
            showError('Failed to submit feedback');
        }
    };

    const handleAddStudyMaterial = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/session-feedback/booking/${session._id}/study-material`, studyMaterial);
            showSuccess('Study material added');
            setStudyMaterial({ type: 'topic', title: '', url: '', description: '' });
            fetchFeedback();
        } catch (err) {
            showError('Failed to add study material');
        }
    };

    const handleAddHomework = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/session-feedback/booking/${session._id}/homework`, homework);
            showSuccess('Homework assigned');
            setHomework({ description: '', dueDate: '' });
            fetchFeedback();
        } catch (err) {
            showError('Failed to assign homework');
        }
    };

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/session-feedback/booking/${session._id}/attendance`, attendance);
            showSuccess('Attendance marked');
            fetchFeedback();
            onUpdate?.();
        } catch (err) {
            showError('Failed to mark attendance');
        }
    };

    const handleUpdateHomeworkStatus = async (feedbackId, homeworkIndex, status) => {
        try {
            await api.patch(`/session-feedback/homework/${feedbackId}/${homeworkIndex}`, { status });
            showSuccess('Homework status updated');
            fetchFeedback();
        } catch (err) {
            showError('Failed to update homework status');
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6">Loading...</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Session Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 px-6">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'details', label: 'Details', icon: '📋' },
                            { id: 'feedback', label: 'Feedback', icon: '💬' },
                            { id: 'materials', label: 'Materials', icon: '📚' },
                            { id: 'homework', label: 'Homework', icon: '📝' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Subject</p>
                                    <p className="text-lg text-gray-900">{session.subject}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Schedule</p>
                                    <p className="text-lg text-gray-900">{session.preferredSchedule}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        {user?.role === 'student' ? 'Tutor' : 'Student'}
                                    </p>
                                    <p className="text-lg text-gray-900">
                                        {user?.role === 'student' 
                                            ? session.tutorId?.name 
                                            : session.studentId?.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p className="text-lg text-gray-900 capitalize">
                                        {session.attendanceStatus || session.status}
                                    </p>
                                </div>
                            </div>

                            {/* Mark Attendance (Tutor only) */}
                            {user?.role === 'tutor' && session.status === 'approved' && (
                                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                                    <h3 className="font-semibold mb-3">Mark Attendance</h3>
                                    <form onSubmit={handleMarkAttendance} className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <select
                                                value={attendance.status}
                                                onChange={(e) => setAttendance({ ...attendance, status: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                required
                                            >
                                                <option value="completed">Completed</option>
                                                <option value="student_absent">Student Absent</option>
                                                <option value="tutor_absent">Tutor Absent</option>
                                                <option value="rescheduled">Rescheduled</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Duration (minutes)
                                            </label>
                                            <input
                                                type="number"
                                                value={attendance.duration}
                                                onChange={(e) => setAttendance({ ...attendance, duration: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                min="1"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Notes
                                            </label>
                                            <textarea
                                                value={attendance.notes}
                                                onChange={(e) => setAttendance({ ...attendance, notes: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                rows="3"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                        >
                                            Mark Attendance
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Feedback Tab */}
                    {activeTab === 'feedback' && (
                        <div className="space-y-6">
                            {/* Tutor Feedback */}
                            {user?.role === 'tutor' && (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h3 className="font-semibold mb-3">Session Summary (Tutor)</h3>
                                    {feedback?.tutorSummary ? (
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-700">{feedback.tutorSummary}</p>
                                            {feedback.understandingScore && (
                                                <p className="text-sm">
                                                    Understanding: {feedback.understandingScore}/5
                                                </p>
                                            )}
                                            {feedback.topicsCovered && feedback.topicsCovered.length > 0 && (
                                                <p className="text-sm">
                                                    Topics: {feedback.topicsCovered.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmitTutorFeedback} className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Session Summary
                                                </label>
                                                <textarea
                                                    value={tutorFeedback.tutorSummary}
                                                    onChange={(e) => setTutorFeedback({ ...tutorFeedback, tutorSummary: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    rows="3"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Understanding Score (1-5)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    value={tutorFeedback.understandingScore}
                                                    onChange={(e) => setTutorFeedback({ ...tutorFeedback, understandingScore: parseInt(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Topics Covered (comma-separated)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={tutorFeedback.topicsCovered}
                                                    onChange={(e) => setTutorFeedback({ ...tutorFeedback, topicsCovered: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    placeholder="Algebra, Geometry, etc."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Next Steps
                                                </label>
                                                <textarea
                                                    value={tutorFeedback.nextSteps}
                                                    onChange={(e) => setTutorFeedback({ ...tutorFeedback, nextSteps: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    rows="2"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                Submit Feedback
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Student Feedback */}
                            {user?.role === 'student' && (
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <h3 className="font-semibold mb-3">Your Feedback</h3>
                                    {feedback?.studentRating ? (
                                        <div className="space-y-2">
                                            <p className="text-sm">
                                                Rating: {feedback.studentRating}/5 ⭐
                                            </p>
                                            {feedback.studentComment && (
                                                <p className="text-sm text-gray-700">{feedback.studentComment}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmitStudentFeedback} className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Rating (1-5)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    value={studentFeedback.studentRating}
                                                    onChange={(e) => setStudentFeedback({ ...studentFeedback, studentRating: parseInt(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Comment (optional)
                                                </label>
                                                <textarea
                                                    value={studentFeedback.studentComment}
                                                    onChange={(e) => setStudentFeedback({ ...studentFeedback, studentComment: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    rows="3"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                            >
                                                Submit Feedback
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Materials Tab */}
                    {activeTab === 'materials' && (
                        <div className="space-y-4">
                            {user?.role === 'tutor' && (
                                <div className="p-4 bg-indigo-50 rounded-lg mb-4">
                                    <h3 className="font-semibold mb-3">Add Study Material</h3>
                                    <form onSubmit={handleAddStudyMaterial} className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Type
                                            </label>
                                            <select
                                                value={studyMaterial.type}
                                                onChange={(e) => setStudyMaterial({ ...studyMaterial, type: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                required
                                            >
                                                <option value="topic">Topic</option>
                                                <option value="link">Link</option>
                                                <option value="file">File Reference</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={studyMaterial.title}
                                                onChange={(e) => setStudyMaterial({ ...studyMaterial, title: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                required
                                            />
                                        </div>
                                        {studyMaterial.type === 'link' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    URL
                                                </label>
                                                <input
                                                    type="url"
                                                    value={studyMaterial.url}
                                                    onChange={(e) => setStudyMaterial({ ...studyMaterial, url: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={studyMaterial.description}
                                                onChange={(e) => setStudyMaterial({ ...studyMaterial, description: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                rows="2"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                        >
                                            Add Material
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Display Materials */}
                            <div>
                                <h3 className="font-semibold mb-3">Study Materials</h3>
                                {feedback?.studyMaterials && feedback.studyMaterials.length > 0 ? (
                                    <div className="space-y-2">
                                        {feedback.studyMaterials.map((material, index) => (
                                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium">{material.title}</p>
                                                        <p className="text-sm text-gray-600">{material.description}</p>
                                                        {material.url && (
                                                            <a
                                                                href={material.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-indigo-600 hover:underline"
                                                            >
                                                                Open Link →
                                                            </a>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(material.assignedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No study materials added yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Homework Tab */}
                    {activeTab === 'homework' && (
                        <div className="space-y-4">
                            {user?.role === 'tutor' && (
                                <div className="p-4 bg-yellow-50 rounded-lg mb-4">
                                    <h3 className="font-semibold mb-3">Assign Homework</h3>
                                    <form onSubmit={handleAddHomework} className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={homework.description}
                                                onChange={(e) => setHomework({ ...homework, description: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                rows="3"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Due Date (optional)
                                            </label>
                                            <input
                                                type="date"
                                                value={homework.dueDate}
                                                onChange={(e) => setHomework({ ...homework, dueDate: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                                        >
                                            Assign Homework
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Display Homework */}
                            <div>
                                <h3 className="font-semibold mb-3">Homework</h3>
                                {feedback?.homework && feedback.homework.length > 0 ? (
                                    <div className="space-y-3">
                                        {feedback.homework.map((hw, index) => {
                                            const statusColors = {
                                                assigned: 'bg-yellow-100 text-yellow-800',
                                                in_progress: 'bg-blue-100 text-blue-800',
                                                completed: 'bg-green-100 text-green-800'
                                            };
                                            return (
                                                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <p className="font-medium flex-1">{hw.description}</p>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[hw.status]}`}>
                                                            {hw.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    {hw.dueDate && (
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            Due: {new Date(hw.dueDate).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {user?.role === 'student' && hw.status !== 'completed' && (
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={() => handleUpdateHomeworkStatus(feedback._id, index, 'in_progress')}
                                                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                                            >
                                                                Mark In Progress
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateHomeworkStatus(feedback._id, index, 'completed')}
                                                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                                            >
                                                                Mark Completed
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No homework assigned yet</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionDetailsModal;

