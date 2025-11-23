import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import ReviewForm from './ReviewForm';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';
import ConfirmationModal from './ConfirmationModal';
import SessionDetailsModal from './SessionDetailsModal';

const BookingList = ({ role }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [sessionDetailsModalOpen, setSessionDetailsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ open: false, action: null, bookingId: null, openSessionModal: false });
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

    const handleReject = (id) => {
        setConfirmModal({
            open: true,
            action: async () => {
                try {
                    await api.patch(`/bookings/${id}/reject`);
                    fetchBookings();
                    showSuccess('Booking rejected');
                } catch (err) {
                    console.error(err);
                    showError('Failed to reject booking');
                }
            },
            bookingId: id,
            title: 'Reject Booking',
            message: 'Are you sure you want to reject this booking? This action cannot be undone.',
            confirmText: 'Reject',
            confirmColor: 'red'
        });
    };

    const handleComplete = (id) => {
        const booking = bookings.find(b => b._id === id);
        setConfirmModal({
            open: true,
            action: async () => {
                try {
                    const { data: updatedBooking } = await api.patch(`/bookings/${id}/complete`);
                    await fetchBookings();
                    showSuccess('Booking marked as completed!');
                    // Open session details modal after marking complete with updated booking
                    setSelectedBooking({ ...booking, ...updatedBooking, status: 'completed' });
                    setSessionDetailsModalOpen(true);
                } catch (err) {
                    console.error(err);
                    showError('Failed to complete booking');
                }
            },
            bookingId: id,
            title: 'Mark as Completed',
            message: 'Mark this booking as completed? You can then add attendance, feedback, and assign homework.',
            confirmText: 'Mark Complete',
            confirmColor: 'blue',
            openSessionModal: true
        });
    };

    const openSessionDetails = (booking) => {
        setSelectedBooking(booking);
        setSessionDetailsModalOpen(true);
    };

    const closeSessionDetails = () => {
        setSessionDetailsModalOpen(false);
        setSelectedBooking(null);
        fetchBookings();
    };

    const handleCancel = (id) => {
        setConfirmModal({
            open: true,
            action: async () => {
                try {
                    await api.patch(`/bookings/${id}/cancel`);
                    fetchBookings();
                    showSuccess('Booking cancelled');
                } catch (err) {
                    console.error(err);
                    showError('Failed to cancel booking');
                }
            },
            bookingId: id,
            title: 'Cancel Booking',
            message: 'Are you sure you want to cancel this booking?',
            confirmText: 'Cancel Booking',
            confirmColor: 'red'
        });
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

    if (loading) return <LoadingSkeleton type="list" count={5} />;
    if (error) return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                <p className="text-red-800">{error}</p>
            </div>
        </div>
    );

    return (
        <>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {bookings.length === 0 ? (
                        <li className="px-4 py-4 sm:px-6">
                            <EmptyState
                                icon="📅"
                                title="No bookings found"
                                description={role === 'student' 
                                    ? "You haven't made any bookings yet. Start by finding a tutor!"
                                    : "You don't have any booking requests yet."}
                            />
                        </li>
                    ) : (
                        bookings.map((booking) => (
                            <li key={booking._id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-indigo-600 truncate">
                                            {booking.subject}
                                        </p>
                                        <div className="ml-2 flex-shrink-0">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            booking.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex flex-col gap-1">
                                            <p className="flex items-center text-sm text-gray-700 font-medium">
                                                {role === 'tutor' ? `Student: ${booking.studentId?.name}` : `Tutor: ${booking.tutorId?.name}`}
                                            </p>
                                            <p className="flex items-center text-sm text-gray-500">
                                                📅 {booking.preferredSchedule}
                                            </p>
                                            <p className="flex items-center text-xs text-gray-400">
                                                Created: {new Date(booking.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="mt-3 sm:mt-0 flex flex-wrap items-center gap-2">
                                            {/* Student Actions */}
                                            {role === 'student' && (
                                                <>
                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleCancel(booking._id)}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                    {booking.status === 'completed' && !booking.hasReview && (
                                                        <button
                                                            onClick={() => openReviewModal(booking)}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                                        >
                                                            ⭐ Leave Review
                                                        </button>
                                                    )}
                                                    {booking.status === 'completed' && booking.hasReview && (
                                                        <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-green-700 bg-green-50 border border-green-200">
                                                            ✓ Reviewed
                                                        </span>
                                                    )}
                                                </>
                                            )}

                                            {/* Tutor Actions */}
                                            {role === 'tutor' && (
                                                <>
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(booking._id)}
                                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                                            >
                                                                ✓ Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(booking._id)}
                                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 border border-gray-300"
                                                            >
                                                                ✕ Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {booking.status === 'approved' && (
                                                        <button
                                                            onClick={() => handleComplete(booking._id)}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            ✓ Mark Complete
                                                        </button>
                                                    )}
                                                    {(booking.status === 'completed' || booking.status === 'approved') && (
                                                        <button
                                                            onClick={() => openSessionDetails(booking)}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                                        >
                                                            📝 {booking.status === 'completed' ? 'Edit Session' : 'View Session'}
                                                        </button>
                                                    )}
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

            {/* Confirmation Modal */}
            {confirmModal.open && (
                <ConfirmationModal
                    title={confirmModal.title}
                    message={confirmModal.message}
                    confirmText={confirmModal.confirmText}
                    cancelText="Cancel"
                    confirmColor={confirmModal.confirmColor || 'red'}
                    onConfirm={() => {
                        confirmModal.action();
                        setConfirmModal({ open: false, action: null, bookingId: null, openSessionModal: false });
                    }}
                    onCancel={() => setConfirmModal({ open: false, action: null, bookingId: null, openSessionModal: false })}
                />
            )}

            {/* Session Details Modal */}
            {sessionDetailsModalOpen && selectedBooking && selectedBooking._id && (
                <SessionDetailsModal
                    session={selectedBooking}
                    onClose={closeSessionDetails}
                    onUpdate={() => {
                        fetchBookings();
                    }}
                />
            )}
        </>
    );
};

export default BookingList;

