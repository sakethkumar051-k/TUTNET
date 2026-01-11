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
        type: String,
        required: true
    },
    sessionDate: {
        type: Date
    },
    // UNIFIED MODEL: Category determines if this is a trial or regular session
    bookingCategory: {
        type: String,
        enum: ['trial', 'session'],
        required: true,
        default: 'session'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    attendanceStatus: {
        type: String,
        enum: ['pending', 'present', 'absent'],
        default: 'pending'
    },

    // TRIAL-SPECIFIC FIELDS (only used when bookingCategory === 'trial')
    trialOutcome: {
        type: String,
        enum: ['pending', 'converted', 'not_interested', 'no_show'],
        default: 'pending'
    },
    trialExpiresAt: {
        type: Date
        // Set to createdAt + 48 hours for auto-expiry
    },

    // SESSION-SPECIFIC FIELDS
    isPaid: {
        type: Boolean,
        default: false
    },

    // Legacy field (deprecated, will be removed after migration)
    bookingType: {
        type: String,
        enum: ['demo', 'regular']
    },

    currentTutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for performance
bookingSchema.index({ studentId: 1, status: 1 });
bookingSchema.index({ tutorId: 1, status: 1 });
bookingSchema.index({ bookingCategory: 1, status: 1 });
bookingSchema.index({ trialExpiresAt: 1 }); // For auto-expiry queries

// Virtual to check if trial is expired
bookingSchema.virtual('isExpired').get(function () {
    if (this.bookingCategory === 'trial' && this.trialExpiresAt) {
        return new Date() > this.trialExpiresAt && this.status === 'pending';
    }
    return false;
});

// Helper method to check if student can request trial with this tutor
bookingSchema.statics.canRequestTrial = async function (studentId, tutorId) {
    // Check if student already has a trial (any status) with this tutor
    const existingTrial = await this.findOne({
        studentId,
        tutorId,
        bookingCategory: 'trial'
    });

    return !existingTrial; // Can request if no existing trial found
};

// Helper method to count active trials for a student
bookingSchema.statics.countActiveTrials = async function (studentId) {
    return await this.countDocuments({
        studentId,
        bookingCategory: 'trial',
        status: { $in: ['pending', 'approved'] }
    });
};

module.exports = mongoose.model('Booking', bookingSchema);
