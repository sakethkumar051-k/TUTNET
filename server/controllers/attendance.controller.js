const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === 'student') {
            filter.studentId = req.user.id;
        } else if (req.user.role === 'tutor') {
            filter.tutorId = req.user.id;
        }

        const attendance = await Attendance.find(filter)
            .populate('bookingId')
            .populate('studentId', 'name email')
            .populate('tutorId', 'name email')
            .sort({ sessionDate: -1 });

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Tutor/Admin)
const markAttendance = async (req, res) => {
    try {
        const { bookingId, sessionDate, status, duration, notes } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if attendance already marked for this session
        const existing = await Attendance.findOne({
            bookingId,
            sessionDate: new Date(sessionDate)
        });

        if (existing) {
            return res.status(400).json({ message: 'Attendance already marked for this session' });
        }

        const attendance = await Attendance.create({
            bookingId,
            studentId: booking.studentId,
            tutorId: booking.tutorId,
            sessionDate: new Date(sessionDate),
            status: status || 'present',
            duration: duration || 60,
            notes,
            markedBy: req.user.id
        });

        const populated = await Attendance.findById(attendance._id)
            .populate('bookingId')
            .populate('studentId', 'name email')
            .populate('tutorId', 'name email');

        res.status(201).json(populated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private (Tutor/Admin)
const updateAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        // Check authorization
        if (attendance.tutorId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updated = await Attendance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('bookingId')
         .populate('studentId', 'name email')
         .populate('tutorId', 'name email');

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get student attendance
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getStudentAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ studentId: req.params.studentId })
            .populate('bookingId')
            .populate('tutorId', 'name email')
            .sort({ sessionDate: -1 });

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get tutor attendance records
// @route   GET /api/attendance/tutor
// @access  Private (Tutor)
const getTutorAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ tutorId: req.user.id })
            .populate('bookingId')
            .populate('studentId', 'name email')
            .sort({ sessionDate: -1 });

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private
const getAttendanceStats = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === 'student') {
            filter.studentId = req.user.id;
        } else if (req.user.role === 'tutor') {
            filter.tutorId = req.user.id;
        }

        const attendance = await Attendance.find(filter);

        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'present').length;
        const absent = attendance.filter(a => a.status === 'absent').length;
        const late = attendance.filter(a => a.status === 'late').length;
        const excused = attendance.filter(a => a.status === 'excused').length;

        const attendancePercentage = total > 0 ? ((present + excused) / total * 100).toFixed(1) : 0;

        res.json({
            total,
            present,
            absent,
            late,
            excused,
            attendancePercentage: parseFloat(attendancePercentage)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAttendance,
    markAttendance,
    updateAttendance,
    getStudentAttendance,
    getTutorAttendance,
    getAttendanceStats
};

