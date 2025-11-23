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

    // Calculate weekly and monthly trends
    const getWeeklyTrend = () => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisWeek = attendance.filter(a => new Date(a.sessionDate) >= weekAgo);
        const lastWeek = attendance.filter(a => {
            const date = new Date(a.sessionDate);
            return date >= new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000) && date < weekAgo;
        });

        const thisWeekPresent = thisWeek.filter(a => a.status === 'present').length;
        const thisWeekTotal = thisWeek.length;
        const lastWeekPresent = lastWeek.filter(a => a.status === 'present').length;
        const lastWeekTotal = lastWeek.length;

        const thisWeekRate = thisWeekTotal > 0 ? (thisWeekPresent / thisWeekTotal * 100).toFixed(1) : 0;
        const lastWeekRate = lastWeekTotal > 0 ? (lastWeekPresent / lastWeekTotal * 100).toFixed(1) : 0;

        return {
            thisWeek: parseFloat(thisWeekRate),
            lastWeek: parseFloat(lastWeekRate),
            trend: parseFloat(thisWeekRate) - parseFloat(lastWeekRate)
        };
    };

    const weeklyTrend = getWeeklyTrend();

    // Group by month for monthly view
    const getMonthlyData = () => {
        const monthly = {};
        attendance.forEach(record => {
            const date = new Date(record.sessionDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthly[monthKey]) {
                monthly[monthKey] = { total: 0, present: 0, absent: 0, late: 0 };
            }
            monthly[monthKey].total++;
            if (record.status === 'present') monthly[monthKey].present++;
            else if (record.status === 'absent') monthly[monthKey].absent++;
            else if (record.status === 'late') monthly[monthKey].late++;
        });
        return monthly;
    };

    const monthlyData = getMonthlyData();

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 text-center hover:shadow-md transition-shadow">
                        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Total Sessions</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 text-center hover:shadow-md transition-shadow">
                        <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Present</p>
                        {stats.total > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                                {((stats.present / stats.total) * 100).toFixed(1)}%
                            </p>
                        )}
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 text-center hover:shadow-md transition-shadow">
                        <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Absent</p>
                        {stats.total > 0 && (
                            <p className="text-xs text-red-600 mt-1">
                                {((stats.absent / stats.total) * 100).toFixed(1)}%
                            </p>
                        )}
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 text-center hover:shadow-md transition-shadow">
                        <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Late</p>
                        {stats.total > 0 && (
                            <p className="text-xs text-yellow-600 mt-1">
                                {((stats.late / stats.total) * 100).toFixed(1)}%
                            </p>
                        )}
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 text-center hover:shadow-md transition-shadow bg-gradient-to-br from-indigo-50 to-purple-50">
                        <p className="text-3xl font-bold text-indigo-600">{stats.attendancePercentage}%</p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Attendance Rate</p>
                        {weeklyTrend.trend !== 0 && (
                            <p className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                                weeklyTrend.trend > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {weeklyTrend.trend > 0 ? '↑' : '↓'} {Math.abs(weeklyTrend.trend).toFixed(1)}%
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Weekly Trend */}
            {stats && attendance.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trend</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">This Week</p>
                            <p className="text-2xl font-bold text-blue-600">{weeklyTrend.thisWeek}%</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {attendance.filter(a => {
                                    const date = new Date(a.sessionDate);
                                    return date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                                }).filter(a => a.status === 'present').length} present
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Last Week</p>
                            <p className="text-2xl font-bold text-gray-600">{weeklyTrend.lastWeek}%</p>
                            <p className="text-xs text-gray-500 mt-1">Previous period</p>
                        </div>
                        <div className={`p-4 rounded-lg ${
                            weeklyTrend.trend > 0 ? 'bg-green-50' : weeklyTrend.trend < 0 ? 'bg-red-50' : 'bg-gray-50'
                        }`}>
                            <p className="text-sm text-gray-600 mb-1">Change</p>
                            <p className={`text-2xl font-bold ${
                                weeklyTrend.trend > 0 ? 'text-green-600' : weeklyTrend.trend < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                                {weeklyTrend.trend > 0 ? '+' : ''}{weeklyTrend.trend.toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {weeklyTrend.trend > 0 ? 'Improving' : weeklyTrend.trend < 0 ? 'Declining' : 'Stable'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Monthly Breakdown */}
            {Object.keys(monthlyData).length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
                    <div className="space-y-3">
                        {Object.entries(monthlyData)
                            .sort((a, b) => b[0].localeCompare(a[0]))
                            .slice(0, 6)
                            .map(([month, data]) => {
                                const rate = data.total > 0 ? (data.present / data.total * 100).toFixed(1) : 0;
                                const date = new Date(month + '-01');
                                return (
                                    <div key={month} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-gray-900">
                                                {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </p>
                                            <p className="text-lg font-bold text-indigo-600">{rate}%</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>Total: {data.total}</span>
                                            <span className="text-green-600">Present: {data.present}</span>
                                            <span className="text-red-600">Absent: {data.absent}</span>
                                            {data.late > 0 && <span className="text-yellow-600">Late: {data.late}</span>}
                                        </div>
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                                style={{ width: `${rate}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Attendance List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                    <p className="text-sm text-gray-500 mt-1">Complete history of all attendance records</p>
                </div>
                <div className="divide-y divide-gray-200">
                    {attendance.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500">
                            <p className="text-lg mb-2">No attendance records found</p>
                            <p className="text-sm">Attendance will appear here once sessions are marked</p>
                        </div>
                    ) : (
                        attendance.map((record) => (
                            <div key={record._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {user?.role === 'student' 
                                                    ? record.tutorId?.name 
                                                    : record.studentId?.name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                📅 {new Date(record.sessionDate).toLocaleDateString('en-US', { 
                                                    weekday: 'short', 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                ⏱️ {record.duration} minutes
                                            </span>
                                        </div>
                                        {record.notes && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                                <span className="font-medium">Notes: </span>{record.notes}
                                            </div>
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

