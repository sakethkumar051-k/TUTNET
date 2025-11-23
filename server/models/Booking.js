const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    preferredSchedule: {
        type: String, // Simple string for MVP e.g. "2023-10-27 10:00 AM"
        required: true
    },
    sessionDate: {
        type: Date // Actual session date/time
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed', 'scheduled', 'student_absent', 'tutor_absent', 'rescheduled'],
        default: 'pending'
    },
    attendanceStatus: {
        type: String,
        enum: ['scheduled', 'completed', 'student_absent', 'tutor_absent', 'rescheduled'],
        default: 'scheduled'
    },
    hasReview: {
        type: Boolean,
        default: false
    },
    hasFeedback: {
        type: Boolean,
        default: false
    },
    currentTutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CurrentTutor'
    },
    adminApprovalRequired: {
        type: Boolean,
        default: true
    },
    duration: {
        type: Number, // in minutes
        default: 60
    },
    onlineLink: {
        type: String // For future online sessions
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
