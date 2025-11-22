const mongoose = require('mongoose');

const tutorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    subjects: [{
        type: String,
        trim: true
    }],
    classes: [{
        type: String,
        trim: true
    }],
    hourlyRate: {
        type: Number,
        required: true
    },
    experienceYears: {
        type: Number,
        default: 0
    },
    bio: {
        type: String,
        trim: true
    },
    availableSlots: {
        type: [String], // Simple array of strings for now e.g., "Mon 10-12", "Wed 14-16"
        default: []
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);
