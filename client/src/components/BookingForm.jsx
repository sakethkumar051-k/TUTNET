import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const BookingForm = ({ tutorId, tutorName, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        subject: '',
        preferredSchedule: '',
    });
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useToast();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/bookings', {
                tutorId,
                ...formData
            });
            showSuccess('Booking request sent successfully!');
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            showError(err.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Book {tutorName}</h3>
                    <form className="mt-2 text-left" onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
                                Subject
                            </label>
                            <input
                                type="text"
                                name="subject"
                                id="subject"
                                required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="e.g., Mathematics, Physics"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="preferredSchedule">
                                Preferred Schedule
                            </label>
                            <input
                                type="text"
                                name="preferredSchedule"
                                id="preferredSchedule"
                                required
                                placeholder="e.g. Mon 10am, Wed 3pm"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.preferredSchedule}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex items-center justify-between mt-6 gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Booking...' : 'Confirm'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingForm;

