import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const AttendanceTracker = () => {
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMarkModal, setShowMarkModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        fetchAttendance();
        fetchStats();
    }, []);

    const fetchAttendance = async () => {
        try {
            const { data } = await api.get('/attendance');
            setAttendance(data);
        } catch (err) {
            showError('Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/attendance/stats');
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const markAttendance = async (formData) => {
        try {
            await api.post('/attendance', formData);
            showSuccess('Attendance marked successfully');
            setShowMarkModal(false);
            fetchAttendance();
            fetchStats();
        } catch (err) {
            showError('Failed to mark attendance');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            present: 'bg-green-100 text-green-800',
            absent: 'bg-red-100 text-red-800',
            late: 'bg-yellow-100 text-yellow-800',
            excused: 'bg-blue-100 text-blue-800'
        };
        return colors[status] || colors.present;
    };

    if (loading) {
        return <div className="text-center py-8">Loading attendance...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-xs text-gray-500 mt-1">Total Sessions</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                        <p className="text-xs text-gray-500 mt-1">Present</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                        <p className="text-xs text-gray-500 mt-1">Absent</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                        <p className="text-xs text-gray-500 mt-1">Late</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-indigo-600">{stats.attendancePercentage}%</p>
                        <p className="text-xs text-gray-500 mt-1">Attendance Rate</p>
                    </div>
                </div>
            )}

            {/* Attendance List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {attendance.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                            <p>No attendance records found</p>
                        </div>
                    ) : (
                        attendance.map((record) => (
                            <div key={record._id} className="px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                            <p className="text-sm font-medium text-gray-900">
                                                {user?.role === 'student' 
                                                    ? record.tutorId?.name 
                                                    : record.studentId?.name}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            📅 {new Date(record.sessionDate).toLocaleDateString()} • 
                                            ⏱️ {record.duration} minutes
                                        </p>
                                        {record.notes && (
                                            <p className="text-xs text-gray-400 mt-1">{record.notes}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceTracker;

