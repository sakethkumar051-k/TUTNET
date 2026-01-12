const express = require('express');
const router = express.Router();
const {
    getTutors,
    getTutorById,
    updateTutorProfile,
    getMyProfile,
    submitForApproval,
    checkProfileComplete
} = require('../controllers/tutor.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Specific routes must come before parameterized routes
router.get('/', getTutors);
router.get('/me', protect, authorize('tutor'), getMyProfile);
router.get('/my-profile', protect, authorize('tutor'), getMyProfile); // Alias for frontend compatibility
// Allow profile/complete for any authenticated user (role might not be set yet during onboarding)
router.get('/profile/complete', protect, checkProfileComplete);
router.put('/profile', protect, authorize('tutor'), updateTutorProfile);
router.patch('/profile/submit', protect, authorize('tutor'), submitForApproval);
// Parameterized route must be last
router.get('/:id', getTutorById);

module.exports = router;
