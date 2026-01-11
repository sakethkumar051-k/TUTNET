const Booking = require('../models/Booking');
const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');
const CurrentTutor = require('../models/CurrentTutor');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Student or Tutor)
const createBooking = async (req, res) => {
    try {
        // DEBUG LOGGING
        console.log('=== BOOKING REQUEST RECEIVED ===');
        console.log('User:', req.user);
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
        console.log('Headers:', req.headers.authorization);

        const { tutorId, studentId, subject, preferredSchedule, sessionDate, currentTutorId, bookingCategory, bookingType } = req.body;

        // CRITICAL: Check if user is authenticated
        if (!req.user || !req.user.id) {
            console.log('ERROR: No user found in request');
            return res.status(401).json({ message: 'Authentication required. Please log in.' });
        }

        // Handle legacy bookingType → bookingCategory mapping
        let finalCategory = bookingCategory;
        if (!finalCategory && bookingType) {
            finalCategory = bookingType === 'demo' ? 'trial' : 'session';
        }
        if (!finalCategory) {
            finalCategory = 'session'; // Default
        }

        let finalTutorId, finalStudentId;

        // Determine tutor and student IDs based on user role
        if (req.user.role === 'student') {
            // Student booking a tutor
            finalStudentId = req.user.id;
            finalTutorId = tutorId;

            if (!finalTutorId) {
                return res.status(400).json({ message: 'Tutor ID is required' });
            }

            // Check if tutor exists
            const tutor = await User.findById(finalTutorId);
            if (!tutor || tutor.role !== 'tutor') {
                return res.status(404).json({ message: 'Tutor not found' });
            }

            // Check if tutor has a profile (relaxed check - don't require approval status)
            const tutorProfile = await TutorProfile.findOne({ userId: finalTutorId });
            if (!tutorProfile) {
                return res.status(400).json({ message: 'Tutor profile not found. Please contact the tutor to set up their profile.' });
            }

            // Optional: Warn if tutor is not approved, but allow booking
            if (tutorProfile.approvalStatus !== 'approved') {
                console.log(`Warning: Booking created for tutor ${finalTutorId} with approval status: ${tutorProfile.approvalStatus}`);
            }

            // TRIAL-SPECIFIC VALIDATION
            if (finalCategory === 'trial') {
                // Check active trial limit (max 2-3)
                const activeTrialCount = await Booking.countActiveTrials(finalStudentId);
                const maxActiveTrials = 3; // Configurable

                if (activeTrialCount >= maxActiveTrials) {
                    return res.status(400).json({
                        message: `You already have ${activeTrialCount} active trial bookings. Please complete or cancel existing trials before requesting more.`,
                        code: 'MAX_TRIALS_EXCEEDED'
                    });
                }

                // Check if student can request trial with this tutor (max 2 per tutor rule)
                const canRequest = await Booking.canRequestTrial(finalStudentId, finalTutorId);
                if (!canRequest) {
                    return res.status(400).json({
                        message: 'You already have 2 trial bookings with this tutor. Book a regular session instead!',
                        code: 'TRIAL_LIMIT_REACHED'
                    });
                }
            }

        } else if (req.user.role === 'tutor') {
            // Tutor booking for a student (must be a current student)
            finalTutorId = req.user.id;
            finalStudentId = studentId;

            if (!finalStudentId) {
                return res.status(400).json({ message: 'Student ID is required' });
            }

            // Verify this is a current student
            if (currentTutorId) {
                const currentTutor = await CurrentTutor.findById(currentTutorId);
                if (!currentTutor || currentTutor.tutorId.toString() !== finalTutorId ||
                    currentTutor.studentId.toString() !== finalStudentId) {
                    return res.status(403).json({ message: 'Not authorized to book for this student' });
                }
            } else {
                // Check if there's an active relationship
                const currentTutor = await CurrentTutor.findOne({
                    tutorId: finalTutorId,
                    studentId: finalStudentId,
                    isActive: true
                });
                if (!currentTutor) {
                    return res.status(403).json({ message: 'No active relationship with this student' });
                }
            }

            // Check if student exists
            const student = await User.findById(finalStudentId);
            if (!student || student.role !== 'student') {
                return res.status(404).json({ message: 'Student not found' });
            }
        } else {
            return res.status(403).json({ message: 'Only students and tutors can create bookings' });
        }

        // Parse session date
        let parsedSessionDate = null;
        if (sessionDate) {
            parsedSessionDate = new Date(sessionDate);
        } else if (preferredSchedule) {
            try {
                const dateMatch = preferredSchedule.match(/\d{4}-\d{2}-\d{2}/);
                if (dateMatch) {
                    parsedSessionDate = new Date(dateMatch[0]);
                }
            } catch (e) {
                // If parsing fails, leave as null
            }
        }

        // Calculate trial expiry (48 hours for pending trials)
        let trialExpiresAt = null;
        if (finalCategory === 'trial') {
            trialExpiresAt = new Date();
            trialExpiresAt.setHours(trialExpiresAt.getHours() + 48);
        }

        // IMPORTANT: Only find/create CurrentTutor relationship for REGULAR sessions, NOT trials
        let currentTutor = null;
        if (finalCategory === 'session') {
            // Only create permanent tutor relationship for regular bookings
            if (currentTutorId) {
                currentTutor = await CurrentTutor.findById(currentTutorId);
            } else {
                currentTutor = await CurrentTutor.findOne({
                    studentId: finalStudentId,
                    tutorId: finalTutorId,
                    subject: subject,
                    isActive: true
                });
            }
        }
        // For trials: currentTutor remains null, no permanent relationship created

        const booking = await Booking.create({
            studentId: finalStudentId,
            tutorId: finalTutorId,
            subject: subject || (currentTutor ? currentTutor.subject : 'General'),
            preferredSchedule,
            sessionDate: parsedSessionDate,
            status: req.user.role === 'tutor' ? 'approved' : 'pending', // Tutors can auto-approve
            currentTutorId: currentTutor?._id,
            bookingCategory: finalCategory,
            trialExpiresAt: trialExpiresAt,
            // Keep legacy field for migration compatibility
            bookingType: finalCategory === 'trial' ? 'demo' : 'regular'
        });

        // If tutor created booking AND it's a regular session, update relationship stats
        if (req.user.role === 'tutor' && currentTutor && finalCategory === 'session') {
            currentTutor.totalSessionsBooked += 1;
            if (currentTutor.status === 'new') {
                currentTutor.status = 'active';
            }
            await currentTutor.save();
        }

        const populatedBooking = await Booking.findById(booking._id)
            .populate('studentId', 'name email')
            .populate('tutorId', 'name email');

        res.status(201).json(populatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get my bookings
// @route   GET /api/bookings/mine
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'student') {
            query.studentId = req.user.id;
        } else if (req.user.role === 'tutor') {
            query.tutorId = req.user.id;
        } else {
            return res.status(400).json({ message: 'Invalid role for this route' });
        }

        const bookings = await Booking.find(query)
            .populate('studentId', 'name email')
            .populate('tutorId', 'name email')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Student)
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Ensure user owns the booking
        if (booking.studentId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (booking.status === 'completed' || booking.status === 'rejected') {
            return res.status(400).json({ message: 'Cannot cancel completed or rejected booking' });
        }

        booking.status = 'cancelled';
        booking.attendanceStatus = 'cancelled';
        await booking.save();

        // Update CurrentTutor stats if relationship exists
        if (booking.currentTutorId) {
            const currentTutor = await CurrentTutor.findById(booking.currentTutorId);
            if (currentTutor) {
                currentTutor.sessionsCancelled += 1;
                await currentTutor.save();
            }
        }

        res.json({ message: 'Booking cancelled', booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve a booking (Tutor)
// @route   PATCH /api/bookings/:id/approve
// @access  Private (Tutor)
const approveBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Ensure tutor owns the booking
        if (booking.tutorId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be approved' });
        }

        booking.status = 'approved';
        booking.attendanceStatus = 'scheduled';

        // Parse session date if not set
        if (!booking.sessionDate) {
            try {
                const dateMatch = booking.preferredSchedule.match(/\d{4}-\d{2}-\d{2}/);
                if (dateMatch) {
                    booking.sessionDate = new Date(dateMatch[0]);
                }
            } catch (e) {
                // If parsing fails, use current date
                booking.sessionDate = new Date();
            }
        }

        await booking.save();

        // CRITICAL: Only create CurrentTutor relationship for REGULAR bookings, NOT trials
        let currentTutor = null;
        if (booking.bookingCategory === 'session') {
            // Create or update CurrentTutor relationship for regular bookings only
            const tutorProfile = await TutorProfile.findOne({ userId: booking.tutorId });
            currentTutor = await CurrentTutor.findOne({
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                subject: booking.subject,
                isActive: true
            });

            if (!currentTutor) {
                // Create new relationship
                currentTutor = await CurrentTutor.create({
                    studentId: booking.studentId,
                    tutorId: booking.tutorId,
                    subject: booking.subject,
                    classGrade: tutorProfile?.classes?.[0] || '',
                    relationshipStartDate: new Date(),
                    status: 'new',
                    totalSessionsBooked: 1,
                    isActive: true
                });
            } else {
                // Update existing relationship
                currentTutor.totalSessionsBooked += 1;
                if (currentTutor.status === 'new' && currentTutor.totalSessionsBooked > 0) {
                    currentTutor.status = 'active';
                }
                await currentTutor.save();
            }

            // Link booking to current tutor
            booking.currentTutorId = currentTutor._id;
            await booking.save();
        }
        // For trials: currentTutor remains null, no permanent relationship created

        const populatedBooking = await Booking.findById(booking._id)
            .populate('studentId', 'name email')
            .populate('tutorId', 'name email');

        res.json({ message: 'Booking approved', booking: populatedBooking });
    } catch (error) {
        console.error('Error in approveBooking:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Reject a booking (Tutor)
// @route   PATCH /api/bookings/:id/reject
// @access  Private (Tutor)
const rejectBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Ensure tutor owns the booking
        if (booking.tutorId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be rejected' });
        }

        booking.status = 'rejected';
        await booking.save();

        res.json({ message: 'Booking rejected', booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Complete a booking (Tutor)
// @route   PATCH /api/bookings/:id/complete
// @access  Private (Tutor)
const completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Ensure tutor owns the booking
        if (booking.tutorId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'approved' && booking.status !== 'scheduled') {
            return res.status(400).json({ message: 'Only approved or scheduled bookings can be marked as completed' });
        }

        booking.status = 'completed';
        booking.attendanceStatus = 'completed';
        await booking.save();

        // Update CurrentTutor stats
        if (booking.currentTutorId) {
            const currentTutor = await CurrentTutor.findById(booking.currentTutorId);
            if (currentTutor) {
                currentTutor.sessionsCompleted += 1;
                // Update status based on completion
                if (currentTutor.sessionsCompleted >= 10 && currentTutor.sessionsCompleted < 20) {
                    currentTutor.status = 'near_completion';
                }
                await currentTutor.save();
            }
        }

        res.json({ message: 'Booking marked as completed', booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get trial status between student and tutor
// @route   GET /api/bookings/trial-status/:tutorId
// @access  Private (Student)
const getTrialStatus = async (req, res) => {
    try {
        const { tutorId } = req.params;
        const studentId = req.user.id;

        // Find any trial bookings between this student and tutor
        const trials = await Booking.find({
            studentId,
            tutorId,
            bookingCategory: 'trial'
        }).sort({ createdAt: -1 });

        if (trials.length === 0) {
            return res.json({
                status: null,
                count: 0,
                hasTriedTutor: false
            });
        }

        const latestTrial = trials[0];

        return res.json({
            status: latestTrial.status,
            count: trials.length,
            maxReached: trials.length >= 2,
            hasTriedTutor: true,
            latestTrial: {
                _id: latestTrial._id,
                status: latestTrial.status,
                subject: latestTrial.subject,
                preferredSchedule: latestTrial.preferredSchedule,
                createdAt: latestTrial.createdAt
            }
        });
    } catch (error) {
        console.error('Error fetching trial status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    cancelBooking,
    approveBooking,
    rejectBooking,
    completeBooking,
    getTrialStatus
};
