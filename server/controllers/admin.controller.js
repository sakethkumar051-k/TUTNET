const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const Booking = require('../models/Booking');

// @desc    Get all pending tutors
// @route   GET /api/admin/tutors/pending
// @access  Private/Admin
const getPendingTutors = async (req, res) => {
    try {
        const tutors = await TutorProfile.find({ approvalStatus: 'pending' })
            .populate('userId', 'name email phone location');
        res.json(tutors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve a tutor
// @route   PATCH /api/admin/tutors/:id/approve
// @access  Private/Admin
const approveTutor = async (req, res) => {
    try {
        const tutor = await TutorProfile.findById(req.params.id);

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        tutor.approvalStatus = 'approved';
        await tutor.save();

        res.json({ message: 'Tutor approved', tutor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reject a tutor
// @route   PATCH /api/admin/tutors/:id/reject
// @access  Private/Admin
const rejectTutor = async (req, res) => {
    try {
        const tutor = await TutorProfile.findById(req.params.id);

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        tutor.approvalStatus = 'rejected';
        tutor.rejectionReason = req.body.reason || 'No reason provided';
        await tutor.save();

        res.json({ message: 'Tutor rejected', tutor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all pending bookings
// @route   GET /api/admin/bookings/pending
// @access  Private/Admin
const getPendingBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'pending' })
            .populate('studentId', 'name email')
            .populate('tutorId', 'name email');
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve a booking
// @route   PATCH /api/admin/bookings/:id/approve
// @access  Private/Admin
const approveBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = 'approved';
        await booking.save();

        res.json({ message: 'Booking approved', booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reject a booking
// @route   PATCH /api/admin/bookings/:id/reject
// @access  Private/Admin
const rejectBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
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
    getPendingTutors,
    approveTutor,
    rejectTutor,
    getPendingBookings,
    approveBooking,
    rejectBooking,
};
