const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    cancelBooking,
    approveBooking,
    rejectBooking,
    completeBooking,
    getTrialStatus
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

// Trial status check
router.get('/trial-status/:tutorId', authorize('student'), getTrialStatus);

// Allow both students and tutors to create bookings
router.post('/', authorize('student', 'tutor'), createBooking);
router.get('/mine', getMyBookings);
router.patch('/:id/cancel', authorize('student'), cancelBooking);
router.patch('/:id/approve', authorize('tutor'), approveBooking);
router.patch('/:id/reject', authorize('tutor'), rejectBooking);
router.patch('/:id/complete', authorize('tutor'), completeBooking);

module.exports = router;

