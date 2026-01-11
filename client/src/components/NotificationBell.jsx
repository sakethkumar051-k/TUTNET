import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUnreadCount();
        // Poll every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await api.get('/notifications/unread-count');
            setUnreadCount(data.count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/notifications?limit=10');
            setNotifications(data.notifications);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            fetchUnreadCount();
            fetchNotifications();
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setUnreadCount(0);
            fetchNotifications();
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
        setShowDropdown(false);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking_approved':
            case 'demo_accepted':
                return <span className="text-green-500 text-lg">✓</span>;
            case 'booking_rejected':
                return <span className="text-red-500 text-lg">✕</span>;
            case 'session_reminder':
                return <span className="text-blue-500 text-lg">⏰</span>;
            case 'session_completed':
                return <span className="text-purple-500 text-lg">✔</span>;
            default:
                return <span className="text-gray-500 text-lg">•</span>;
        }
    };

    const formatRelativeTime = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="relative">
            <button
                onClick={() => {
                    setShowDropdown(!showDropdown);
                    if (!showDropdown) fetchNotifications();
                }}
                className="relative p-2 hover:bg-gray-100 rounded-full transition"
            >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-40">
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {notifications.some(n => !n.isRead) && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-indigo-600 hover:text-indigo-800"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${!notification.isRead ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 pt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                                                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatRelativeTime(notification.createdAt)}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t text-center">
                                <button
                                    onClick={() => {
                                        navigate('/notifications');
                                        setShowDropdown(false);
                                    }}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
