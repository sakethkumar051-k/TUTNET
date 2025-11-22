const express = require('express');
const router = express.Router();
const {
    getTutors,
    getTutorById,
    updateTutorProfile,
    getMyProfile,
    submitForApproval
} = require('../controllers/tutor.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', getTutors);
router.get('/me', protect, authorize('tutor'), getMyProfile);
router.get('/:id', getTutorById);
router.put('/profile', protect, authorize('tutor'), updateTutorProfile);
router.patch('/profile/submit', protect, authorize('tutor'), submitForApproval);

module.exports = router;
