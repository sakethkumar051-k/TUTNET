const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: [
            // Student notifications
            'booking_approved',
            'booking_rejected',
            'demo_accepted',
            'demo_rejected',
            'session_reminder',
            'session_starting_soon',
            'session_completed',
            'progress_report_added',
            'tutor_unavailable',
            'booking_cancelled',

            // Tutor notifications
            'new_booking_request',
            'new_trial_request',
            'new_review',
            'payment_received',
            'student_cancellation',

            // Admin notifications
            'new_tutor_registration',
            'tutor_pending_approval',
            'system_alert',

            // Legacy types (keep for backwards compatibility)
            'booking',
            'review',
            'approval',
            'message',
            'reminder',
            'system'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String  // URL to navigate to on click
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, isDeleted: 1 });
notificationSchema.index({ createdAt: -1 });

// Auto-delete old notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Notification', notificationSchema);
