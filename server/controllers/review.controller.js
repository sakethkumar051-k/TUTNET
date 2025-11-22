const Review = require('../models/Review');
const Booking = require('../models/Booking');
const TutorProfile = require('../models/TutorProfile');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Student)
const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Ensure user owns the booking
        if (booking.studentId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Ensure booking is completed
        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed bookings' });
        }

        // Check if review already exists
        const reviewExists = await Review.findOne({ bookingId });
        if (reviewExists) {
            return res.status(400).json({ message: 'Review already exists for this booking' });
        }

        const review = await Review.create({
            bookingId,
            studentId: req.user.id,
            tutorId: booking.tutorId,
            rating,
            comment
        });

        // Update tutor average rating
        const tutorProfile = await TutorProfile.findOne({ userId: booking.tutorId });
        if (tutorProfile) {
            const reviews = await Review.find({ tutorId: booking.tutorId });
            tutorProfile.totalReviews = reviews.length;
            tutorProfile.averageRating =
                reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
            await tutorProfile.save();
        }

        res.status(201).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get reviews for a tutor
// @route   GET /api/reviews/tutor/:tutorId
// @access  Public
const getTutorReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ tutorId: req.params.tutorId })
            .populate('studentId', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createReview,
    getTutorReviews
};
