const Booking = require('../models/Booking');
const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');

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

        const booking = await Booking.create({
            studentId: req.user.id,
            tutorId,
            subject,
            preferredSchedule,
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
        await booking.save();

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
        await booking.save();

        res.json({ message: 'Booking approved', booking });
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

module.exports = {
    createBooking,
    getMyBookings,
    cancelBooking,
    approveBooking,
    rejectBooking
};
