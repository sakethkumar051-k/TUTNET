import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const SessionCalendar = ({ currentTutorId, tutorId, studentId, subject, onBookingCreated }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [existingBookings, setExistingBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();

    // Generate time slots (9 AM to 9 PM, hourly)
    const timeSlots = [];
    for (let hour = 9; hour <= 21; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    useEffect(() => {
        fetchExistingBookings();
    }, [selectedDate, tutorId, studentId]);

    const fetchExistingBookings = async () => {
        try {
            const { data } = await api.get('/bookings/mine');
            const dateStr = selectedDate.toISOString().split('T')[0];
            const bookingsForDate = data.filter(booking => {
                if (booking.sessionDate) {
                    return booking.sessionDate.split('T')[0] === dateStr;
                }
                // Fallback to preferredSchedule parsing
                return booking.preferredSchedule.includes(dateStr);
            });
            setExistingBookings(bookingsForDate);
            
            // Mark unavailable slots
            const bookedSlots = bookingsForDate.map(b => {
                if (b.sessionDate) {
                    return new Date(b.sessionDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                }
                return null;
            }).filter(Boolean);
            
            setAvailableSlots(timeSlots.filter(slot => !bookedSlots.includes(slot)));
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            setAvailableSlots(timeSlots);
        }
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedTime('');
    };

    const handleBooking = async () => {
        if (!selectedTime) {
            showError('Please select a time slot');
            return;
        }

        setLoading(true);
        try {
            const dateTime = new Date(selectedDate);
            const [hours, minutes] = selectedTime.split(':');
            dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const preferredSchedule = `${selectedDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            })} at ${selectedTime}`;

            const bookingData = {
                subject: subject,
                preferredSchedule: preferredSchedule,
                sessionDate: dateTime.toISOString()
            };

            // Set tutor and student IDs based on role
            if (user?.role === 'student') {
                bookingData.tutorId = tutorId;
            } else if (user?.role === 'tutor') {
                bookingData.studentId = studentId;
            }

            // Check if there's an existing current tutor relationship
            if (currentTutorId) {
                bookingData.currentTutorId = currentTutorId;
            }

            await api.post('/bookings', bookingData);
            showSuccess('Session booked successfully!');
            setSelectedTime('');
            fetchExistingBookings();
            onBookingCreated?.();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to book session');
        } finally {
            setLoading(false);
        }
    };

    // Get days in month
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && 
               month === today.getMonth() && 
               year === today.getFullYear();
    };

    const isSelected = (day) => {
        return day === selectedDate.getDate() && 
               month === selectedDate.getMonth() && 
               year === selectedDate.getFullYear();
    };

    const hasBooking = (day) => {
        const dateStr = new Date(year, month, day).toISOString().split('T')[0];
        return existingBookings.some(booking => {
            if (booking.sessionDate) {
                return booking.sessionDate.split('T')[0] === dateStr;
            }
            return booking.preferredSchedule.includes(dateStr);
        });
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(month + direction);
        setSelectedDate(newDate);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Book a Session</h3>
            
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-md"
                >
                    ←
                </button>
                <h4 className="text-lg font-semibold">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-md"
                >
                    →
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
                {days.map((day, index) => (
                    <button
                        key={index}
                        onClick={() => day && handleDateSelect(new Date(year, month, day))}
                        onKeyDown={(e) => {
                            if (day && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault();
                                handleDateSelect(new Date(year, month, day));
                            }
                        }}
                        disabled={!day}
                        aria-label={day ? `Select ${new Date(year, month, day).toLocaleDateString()}` : undefined}
                        className={`
                            p-2 text-sm rounded-md transition-all duration-200
                            ${!day ? 'cursor-default invisible' : 'hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500'}
                            ${day && isToday(day) ? 'bg-blue-100 font-semibold ring-2 ring-blue-300' : ''}
                            ${day && isSelected(day) ? 'bg-indigo-600 text-white shadow-md' : ''}
                            ${day && hasBooking(day) ? 'ring-2 ring-green-500' : ''}
                        `}
                    >
                        {day}
                        {day && hasBooking(day) && (
                            <span className="block w-1 h-1 bg-green-500 rounded-full mx-auto mt-1" />
                        )}
                    </button>
                ))}
            </div>

            {/* Time Selection */}
            {selectedDate && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Time
                    </label>
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                        {timeSlots.map(slot => {
                            const isBooked = existingBookings.some(booking => {
                                if (booking.sessionDate) {
                                    const bookingTime = new Date(booking.sessionDate).toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit', 
                                        hour12: false 
                                    });
                                    return bookingTime === slot;
                                }
                                return false;
                            });
                            
                            return (
                                <button
                                    key={slot}
                                    onClick={() => !isBooked && setSelectedTime(slot)}
                                    onKeyDown={(e) => {
                                        if (!isBooked && (e.key === 'Enter' || e.key === ' ')) {
                                            e.preventDefault();
                                            setSelectedTime(slot);
                                        }
                                    }}
                                    disabled={isBooked}
                                    aria-label={isBooked ? `${slot} - Booked` : `Select ${slot}`}
                                    className={`
                                        px-3 py-2 text-sm rounded-md border transition-all duration-200
                                        ${isBooked 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                                            : selectedTime === slot
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                                        }
                                    `}
                                >
                                    {slot}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Book Button */}
            {selectedDate && selectedTime && (
                <button
                    onClick={handleBooking}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleBooking();
                        }
                    }}
                    disabled={loading}
                    className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Booking...
                        </>
                    ) : (
                        <>
                            <span>📅</span>
                            <span>Book Session for {selectedDate.toLocaleDateString()} at {selectedTime}</span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default SessionCalendar;

