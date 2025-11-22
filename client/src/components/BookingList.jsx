import { useState, useEffect } from 'react';
import api from '../utils/api';

const BookingList = ({ role }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/mine');
            setBookings(data);
        } catch (err) {
            setError('Failed to fetch bookings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.patch(`/bookings/${id}/approve`);
            fetchBookings();
            alert('Booking approved successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to approve booking');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this booking?')) return;
        try {
            await api.patch(`/bookings/${id}/reject`);
            fetchBookings();
            alert('Booking rejected');
        } catch (err) {
            console.error(err);
            alert('Failed to reject booking');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/admin/bookings/${id}/${status === 'approved' ? 'approve' : 'reject'}`);
            fetchBookings();
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await api.patch(`/bookings/${id}/cancel`);
            fetchBookings();
        } catch (err) {
            console.error(err);
            alert('Failed to cancel booking');
        }
    }

    if (loading) return <div>Loading bookings...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
                {bookings.length === 0 ? (
                    <li className="px-4 py-4 sm:px-6 text-gray-500">No bookings found.</li>
                ) : (
                    bookings.map((booking) => (
                        <li key={booking._id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                        {booking.subject}
                                    </p>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                            {booking.status}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            {role === 'tutor' ? `Student: ${booking.studentId?.name}` : `Tutor: ${booking.tutorId?.name}`}
                                        </p>
                                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                            Schedule: {booking.preferredSchedule}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-sm sm:mt-0">
                                        {role === 'student' && booking.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancel(booking._id)}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {role === 'tutor' && booking.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(booking._id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleReject(booking._id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default BookingList;
