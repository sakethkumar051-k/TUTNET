import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

const MyCurrentStudents = () => {
    const [currentStudents, setCurrentStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showError } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentStudents();
    }, []);

    const fetchCurrentStudents = async () => {
        try {
            const { data } = await api.get('/current-tutors/tutor/my-students');
            setCurrentStudents(data);
        } catch (err) {
            showError('Failed to fetch current students');
        } finally {
            setLoading(false);
        }
    };

    const calculateAttendancePercentage = (student) => {
        const total = student.totalSessionsBooked;
        const attended = student.sessionsCompleted;
        return total > 0 ? ((attended / total) * 100).toFixed(1) : 0;
    };

    if (loading) {
        return <LoadingSkeleton type="card" count={3} />;
    }

    return (
        <div className="space-y-6">
            {currentStudents.length === 0 ? (
                <EmptyState
                    icon="👨‍🎓"
                    title="No current students"
                    description="Students will appear here after you approve their booking requests."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentStudents.map((student) => {
                        const relationship = student;
                        const studentInfo = student.studentId;
                        const attendancePercentage = calculateAttendancePercentage(relationship);

                        return (
                            <div
                                key={relationship._id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {studentInfo.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        📚 {relationship.subject}
                                        {relationship.classGrade && ` • Class ${relationship.classGrade}`}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        📍 {studentInfo.location?.area}, {studentInfo.location?.city}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Started: {new Date(relationship.relationshipStartDate).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Statistics */}
                                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Total Sessions</p>
                                        <p className="text-lg font-bold text-gray-900">{relationship.totalSessionsBooked}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Completed</p>
                                        <p className="text-lg font-bold text-green-600">{relationship.sessionsCompleted}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Missed</p>
                                        <p className="text-lg font-bold text-red-600">{relationship.sessionsMissed}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Attendance</p>
                                        <p className="text-lg font-bold text-indigo-600">{attendancePercentage}%</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/tutor-dashboard?tab=progress&studentId=${relationship.studentId._id}`)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                navigate(`/tutor-dashboard?tab=progress&studentId=${relationship.studentId._id}`);
                                            }
                                        }}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        aria-label="View student progress"
                                    >
                                        📊 View Progress
                                    </button>
                                    <button
                                        onClick={() => navigate(`/tutor-dashboard?tab=sessions&studentId=${relationship.studentId._id}&currentTutorId=${relationship._id}`)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                navigate(`/tutor-dashboard?tab=sessions&studentId=${relationship.studentId._id}&currentTutorId=${relationship._id}`);
                                            }
                                        }}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                        aria-label="Manage sessions with student"
                                    >
                                        📅 Manage Sessions
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyCurrentStudents;

