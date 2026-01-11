import { useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const RequestDemoModal = ({ tutor, onClose, onSuccess }) => {
    const { showSuccess, showError } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        preferredDate: '',
        preferredTime: '',
        mode: tutor.mode === 'both' ? 'online' : tutor.mode,
        message: '',
        subject: tutor.subjects?.[0] || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Combine date and time for preferredSchedule string
            const schedule = `${formData.preferredDate} ${formData.preferredTime}`;

            await api.post('/bookings', {
                tutorId: tutor.userId._id,
                subject: formData.subject,
                preferredSchedule: schedule,
                bookingType: 'demo',
                // For demo, we might not have sessionDate yet, so we rely on preferredSchedule
            });

            showSuccess('Demo request sent successfully!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            showError(err.response?.data?.message || 'Failed to request demo');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                                <span className="text-xl">🎓</span>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Request Demo Class
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Request a free demo session with {tutor.userId.name}.
                                </p>

                                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                                    {/* Subject Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                                            required
                                        >
                                            {tutor.subjects?.map((sub, idx) => (
                                                <option key={idx} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                                            <input
                                                type="date"
                                                name="preferredDate"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                value={formData.preferredDate}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Preferred Time</label>
                                            <input
                                                type="time"
                                                name="preferredTime"
                                                required
                                                value={formData.preferredTime}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Mode Selection if tutor supports both */}
                                    {tutor.mode === 'both' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Preferred Mode</label>
                                            <div className="mt-2 space-x-4">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="mode"
                                                        value="online"
                                                        checked={formData.mode === 'online'}
                                                        onChange={handleChange}
                                                        className="form-radio h-4 w-4 text-indigo-600"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Online</span>
                                                </label>
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="mode"
                                                        value="home"
                                                        checked={formData.mode === 'home'}
                                                        onChange={handleChange}
                                                        className="form-radio h-4 w-4 text-indigo-600"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Home Tuition</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Message (Optional)</label>
                                        <textarea
                                            name="message"
                                            rows={2}
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Any specific topics you want to cover?"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                                        >
                                            {submitting ? 'Sending Request...' : 'Send Request'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDemoModal;
