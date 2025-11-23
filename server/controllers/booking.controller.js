const Booking = require('../models/Booking');
const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');
const CurrentTutor = require('../models/CurrentTutor');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Student)
const createBooking = async (req, res) => {
    try {
        const { tutorId, subject, preferredSchedule } = req.body;

        // Check if tutor exists
        const tutor = await User.findById(tutorId);
        if (!tutor || tutor.role !== 'tutor') {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        // Check if tutor is approved
        const tutorProfile = await TutorProfile.findOne({ userId: tutorId });
        if (!tutorProfile || tutorProfile.approvalStatus !== 'approved') {
            return res.status(400).json({ message: 'Tutor is not available for booking' });
        }

        // Parse session date from preferredSchedule if it's a date string
        let sessionDate = null;
        try {
            // Try to parse date from preferredSchedule
            const dateMatch = preferredSchedule.match(/\d{4}-\d{2}-\d{2}/);
            if (dateMatch) {
                sessionDate = new Date(dateMatch[0]);
            }
        } catch (e) {
            // If parsing fails, leave as null
        }

        const booking = await Booking.create({
            studentId: req.user.id,
            tutorId,
            subject,
            preferredSchedule,
            sessionDate: sessionDate,
            status: 'pending'
        });

        res.status(201).json(booking);
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

        // Create or update CurrentTutor relationship
        const tutorProfile = await TutorProfile.findOne({ userId: booking.tutorId });
        let currentTutor = await CurrentTutor.findOne({
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

        const populatedBooking = await Booking.findById(booking._id)
            .populate('studentId', 'name email')
            .populate('tutorId', 'name email');

        res.json({ message: 'Booking approved', booking: populatedBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
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

module.exports = {
    createBooking,
    getMyBookings,
    cancelBooking,
    approveBooking,
    rejectBooking,
    completeBooking
};
