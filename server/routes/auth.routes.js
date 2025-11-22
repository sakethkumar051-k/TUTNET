const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    verifyAdminSecret,
    forgotPassword,
    resetPassword
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/verify-admin', protect, verifyAdminSecret);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
