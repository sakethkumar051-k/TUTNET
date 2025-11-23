import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import ReviewForm from './ReviewForm';

const BookingList = ({ role }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const { showSuccess, showError } = useToast();

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
            showSuccess('Booking approved successfully!');
        } catch (err) {
            console.error(err);
            showError('Failed to approve booking');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this booking?')) return;
        try {
            await api.patch(`/bookings/${id}/reject`);
            fetchBookings();
            showSuccess('Booking rejected');
        } catch (err) {
            console.error(err);
            showError('Failed to reject booking');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/admin/bookings/${id}/${status === 'approved' ? 'approve' : 'reject'}`);
            fetchBookings();
            showSuccess(`Booking ${status}`);
        } catch (err) {
            console.error(err);
            showError('Failed to update status');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await api.patch(`/bookings/${id}/cancel`);
            fetchBookings();
            showSuccess('Booking cancelled');
        } catch (err) {
            console.error(err);
            showError('Failed to cancel booking');
        }
    };

    const openReviewModal = (booking) => {
        setSelectedBooking(booking);
        setReviewModalOpen(true);
    };

    const closeReviewModal = () => {
        setReviewModalOpen(false);
        setSelectedBooking(null);
        fetchBookings();
    };

    if (loading) return <div className="text-center py-8">Loading bookings...</div>;
    if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

    return (
        <>
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
                                                            booking.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
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
                                            {/* Student Actions */}
                                            {role === 'student' && (
                                                <>
                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleCancel(booking._id)}
                                                            className="text-red-600 hover:text-red-900 font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                    {booking.status === 'completed' && !booking.hasReview && (
                                                        <button
                                                            onClick={() => openReviewModal(booking)}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                                                        >
                                                            Leave Review
                                                        </button>
                                                    )}
                                                    {booking.status === 'completed' && booking.hasReview && (
                                                        <span className="text-green-600 text-xs">
                                                            ✓ Reviewed
                                                        </span>
                                                    )}
                                                </>
                                            )}

                                            {/* Tutor Actions */}
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

            {/* Review Modal */}
            {reviewModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Leave a Review</h2>
                            <button
                                onClick={closeReviewModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            <ReviewForm
                                bookingId={selectedBooking._id}
                                tutorId={selectedBooking.tutorId?._id}
                                tutorName={selectedBooking.tutorId?.name}
                                onSuccess={closeReviewModal}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookingList;

