const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Attendance = require('../models/Attendance');
const ProgressReport = require('../models/ProgressReport');

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

// @desc    Get analytics dashboard data
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTutors = await User.countDocuments({ role: 'tutor' });
        const approvedTutors = await TutorProfile.countDocuments({ approvalStatus: 'approved' });
        const pendingTutors = await TutorProfile.countDocuments({ approvalStatus: 'pending' });

        const totalBookings = await Booking.countDocuments();
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });

        const totalReviews = await Review.countDocuments();
        const avgRating = await Review.aggregate([
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);

        const totalAttendance = await Attendance.countDocuments();
        const presentAttendance = await Attendance.countDocuments({ status: 'present' });
        const attendanceRate = totalAttendance > 0 
            ? ((presentAttendance / totalAttendance) * 100).toFixed(1) 
            : 0;

        // Recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentBookings = await Booking.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            users: {
                total: totalUsers,
                students: totalStudents,
                tutors: totalTutors,
                approvedTutors,
                pendingTutors,
                recent: recentUsers
            },
            bookings: {
                total: totalBookings,
                completed: completedBookings,
                pending: pendingBookings,
                recent: recentBookings
            },
            reviews: {
                total: totalReviews,
                averageRating: avgRating[0]?.avgRating?.toFixed(1) || 0
            },
            attendance: {
                total: totalAttendance,
                present: presentAttendance,
                rate: parseFloat(attendanceRate)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Generate report
// @route   GET /api/admin/reports
// @access  Private/Admin
const generateReport = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        let report = {};

        switch (type) {
            case 'users':
                report = {
                    total: await User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                    students: await User.countDocuments({ role: 'student', createdAt: { $gte: start, $lte: end } }),
                    tutors: await User.countDocuments({ role: 'tutor', createdAt: { $gte: start, $lte: end } }),
                    users: await User.find({ createdAt: { $gte: start, $lte: end } })
                        .select('name email role createdAt')
                        .sort({ createdAt: -1 })
                };
                break;
            case 'bookings':
                report = {
                    total: await Booking.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                    byStatus: {
                        pending: await Booking.countDocuments({ status: 'pending', createdAt: { $gte: start, $lte: end } }),
                        approved: await Booking.countDocuments({ status: 'approved', createdAt: { $gte: start, $lte: end } }),
                        completed: await Booking.countDocuments({ status: 'completed', createdAt: { $gte: start, $lte: end } }),
                        cancelled: await Booking.countDocuments({ status: 'cancelled', createdAt: { $gte: start, $lte: end } })
                    },
                    bookings: await Booking.find({ createdAt: { $gte: start, $lte: end } })
                        .populate('studentId', 'name email')
                        .populate('tutorId', 'name email')
                        .sort({ createdAt: -1 })
                };
                break;
            case 'tutors':
                report = {
                    total: await TutorProfile.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                    byStatus: {
                        approved: await TutorProfile.countDocuments({ approvalStatus: 'approved', createdAt: { $gte: start, $lte: end } }),
                        pending: await TutorProfile.countDocuments({ approvalStatus: 'pending', createdAt: { $gte: start, $lte: end } }),
                        rejected: await TutorProfile.countDocuments({ approvalStatus: 'rejected', createdAt: { $gte: start, $lte: end } })
                    },
                    tutors: await TutorProfile.find({ createdAt: { $gte: start, $lte: end } })
                        .populate('userId', 'name email')
                        .sort({ createdAt: -1 })
                };
                break;
            default:
                report = {
                    users: await User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                    bookings: await Booking.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                    tutors: await TutorProfile.countDocuments({ createdAt: { $gte: start, $lte: end } })
                };
        }

        report.generatedAt = new Date();
        report.period = { start, end };

        res.json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user activity
// @route   GET /api/admin/activity
// @access  Private/Admin
const getUserActivity = async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        // Get recent bookings
        const recentBookings = await Booking.find()
            .populate('studentId', 'name email')
            .populate('tutorId', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Get recent reviews
        const recentReviews = await Review.find()
            .populate('studentId', 'name email')
            .populate('tutorId', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Get recent users
        const recentUsers = await User.find()
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            bookings: recentBookings,
            reviews: recentReviews,
            users: recentUsers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send mass communication
// @route   POST /api/admin/mass-communication
// @access  Private/Admin
const sendMassCommunication = async (req, res) => {
    try {
        const { recipients, subject, message, type } = req.body;

        if (!recipients || !message) {
            return res.status(400).json({ message: 'Recipients and message are required' });
        }

        let users = [];
        if (recipients === 'all') {
            users = await User.find({ isActive: true });
        } else if (recipients === 'students') {
            users = await User.find({ role: 'student', isActive: true });
        } else if (recipients === 'tutors') {
            users = await User.find({ role: 'tutor', isActive: true });
        } else if (Array.isArray(recipients)) {
            users = await User.find({ _id: { $in: recipients }, isActive: true });
        }

        // In a real implementation, you would send emails/notifications here
        // For now, we'll just return the list of recipients

        res.json({
            message: 'Mass communication sent',
            recipientsCount: users.length,
            recipients: users.map(u => ({ id: u._id, name: u.name, email: u.email })),
            subject,
            message,
            type: type || 'email'
        });
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
    getAnalytics,
    generateReport,
    getUserActivity,
    sendMassCommunication
};
