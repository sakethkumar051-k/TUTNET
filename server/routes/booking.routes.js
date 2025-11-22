const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    cancelBooking,
    approveBooking,
    rejectBooking
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.post('/', authorize('student'), createBooking);
router.get('/mine', getMyBookings);
router.patch('/:id/cancel', authorize('student'), cancelBooking);
router.patch('/:id/approve', authorize('tutor'), approveBooking);
router.patch('/:id/reject', authorize('tutor'), rejectBooking);

module.exports = router;
