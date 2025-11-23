const SessionFeedback = require('../models/SessionFeedback');
const Booking = require('../models/Booking');
const CurrentTutor = require('../models/CurrentTutor');
const Attendance = require('../models/Attendance');

// @desc    Get session feedback
// @route   GET /api/session-feedback/booking/:bookingId
// @access  Private
const getSessionFeedback = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check authorization
        if (req.user.role === 'student' && booking.studentId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (req.user.role === 'tutor' && booking.tutorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let feedback = await SessionFeedback.findOne({ bookingId: req.params.bookingId })
            .populate('studentId', 'name email')
            .populate('tutorId', 'name email');

        if (!feedback) {
            // Create empty feedback if doesn't exist
            const currentTutor = await CurrentTutor.findOne({
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                subject: booking.subject,
                isActive: true
            });

            feedback = await SessionFeedback.create({
                bookingId: req.params.bookingId,
                currentTutorId: currentTutor?._id,
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                sessionDate: booking.sessionDate || booking.createdAt
            });

            await feedback.populate('studentId', 'name email');
            await feedback.populate('tutorId', 'name email');
        }

        res.json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Submit tutor feedback
// @route   POST /api/session-feedback/booking/:bookingId/tutor-feedback
// @access  Private (Tutor)
const submitTutorFeedback = async (req, res) => {
    try {
        const { tutorSummary, understandingScore, topicsCovered, nextSteps } = req.body;
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.tutorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let feedback = await SessionFeedback.findOne({ bookingId: req.params.bookingId });

        if (!feedback) {
            const currentTutor = await CurrentTutor.findOne({
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                subject: booking.subject,
                isActive: true
            });

            feedback = await SessionFeedback.create({
                bookingId: req.params.bookingId,
                currentTutorId: currentTutor?._id,
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                sessionDate: booking.sessionDate || booking.createdAt
            });
        }

        feedback.tutorSummary = tutorSummary;
        feedback.understandingScore = understandingScore;
        feedback.topicsCovered = topicsCovered || [];
        feedback.nextSteps = nextSteps;
        feedback.tutorSubmittedAt = new Date();
        await feedback.save();

        // Mark booking as having feedback
        booking.hasFeedback = true;
        await booking.save();

        res.json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Submit student feedback
// @route   POST /api/session-feedback/booking/:bookingId/student-feedback
// @access  Private (Student)
const submitStudentFeedback = async (req, res) => {
    try {
        const { studentRating, studentComment } = req.body;
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.studentId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let feedback = await SessionFeedback.findOne({ bookingId: req.params.bookingId });

        if (!feedback) {
            const currentTutor = await CurrentTutor.findOne({
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                subject: booking.subject,
                isActive: true
            });

            feedback = await SessionFeedback.create({
                bookingId: req.params.bookingId,
                currentTutorId: currentTutor?._id,
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                sessionDate: booking.sessionDate || booking.createdAt
            });
        }

        feedback.studentRating = studentRating;
        feedback.studentComment = studentComment;
        feedback.studentSubmittedAt = new Date();
        await feedback.save();

        res.json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add study material to session
// @route   POST /api/session-feedback/booking/:bookingId/study-material
// @access  Private (Tutor)
const addStudyMaterial = async (req, res) => {
    try {
        const { type, title, url, description } = req.body;
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.tutorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let feedback = await SessionFeedback.findOne({ bookingId: req.params.bookingId });

        if (!feedback) {
            const currentTutor = await CurrentTutor.findOne({
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                subject: booking.subject,
                isActive: true
            });

            feedback = await SessionFeedback.create({
                bookingId: req.params.bookingId,
                currentTutorId: currentTutor?._id,
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                sessionDate: booking.sessionDate || booking.createdAt
            });
        }

        feedback.studyMaterials.push({
            type,
            title,
            url,
            description,
            assignedAt: new Date()
        });

        await feedback.save();
        res.json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update study material
// @route   PUT /api/session-feedback/study-material/:feedbackId/:materialIndex
// @access  Private (Tutor)
const updateStudyMaterial = async (req, res) => {
    try {
        const feedback = await SessionFeedback.findById(req.params.feedbackId);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        if (feedback.tutorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const index = parseInt(req.params.materialIndex);
        if (index >= 0 && index < feedback.studyMaterials.length) {
            feedback.studyMaterials[index] = {
                ...feedback.studyMaterials[index].toObject(),
                ...req.body
            };
            await feedback.save();
        }

        res.json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add homework
// @route   POST /api/session-feedback/booking/:bookingId/homework
// @access  Private (Tutor)
const addHomework = async (req, res) => {
    try {
        const { description, dueDate } = req.body;
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.tutorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let feedback = await SessionFeedback.findOne({ bookingId: req.params.bookingId });

        if (!feedback) {
            const currentTutor = await CurrentTutor.findOne({
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                subject: booking.subject,
                isActive: true
            });

            feedback = await SessionFeedback.create({
                bookingId: req.params.bookingId,
                currentTutorId: currentTutor?._id,
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                sessionDate: booking.sessionDate || booking.createdAt
            });
        }

        feedback.homework.push({
            description,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            status: 'assigned',
            assignedAt: new Date()
        });

        await feedback.save();
        res.json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update homework status
// @route   PATCH /api/session-feedback/homework/:feedbackId/:homeworkIndex
// @access  Private
const updateHomeworkStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const feedback = await SessionFeedback.findById(req.params.feedbackId);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Check authorization
        if (req.user.role === 'student' && feedback.studentId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (req.user.role === 'tutor' && feedback.tutorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const index = parseInt(req.params.homeworkIndex);
        if (index >= 0 && index < feedback.homework.length) {
            feedback.homework[index].status = status;
            if (status === 'completed') {
                feedback.homework[index].completedAt = new Date();
            }
            await feedback.save();
        }

        res.json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark attendance for session
// @route   POST /api/session-feedback/booking/:bookingId/attendance
// @access  Private (Tutor)
const markAttendance = async (req, res) => {
    try {
        const { status, duration, notes } = req.body;
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.tutorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update booking attendance status
        booking.attendanceStatus = status;
        if (duration) booking.duration = duration;
        await booking.save();

        // Get or create SessionFeedback
        let feedback = await SessionFeedback.findOne({ bookingId: req.params.bookingId });
        if (!feedback) {
            const currentTutor = await CurrentTutor.findOne({
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                subject: booking.subject,
                isActive: true
            });

            feedback = await SessionFeedback.create({
                bookingId: req.params.bookingId,
                currentTutorId: currentTutor?._id,
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                sessionDate: booking.sessionDate || booking.createdAt
            });
        }

        // Update SessionFeedback with attendance
        feedback.attendanceStatus = status;
        feedback.duration = duration || 60;
        feedback.attendanceNotes = notes;
        await feedback.save();

        // Create/update attendance record
        const attendance = await Attendance.findOneAndUpdate(
            {
                bookingId: req.params.bookingId,
                sessionDate: booking.sessionDate || booking.createdAt
            },
            {
                bookingId: req.params.bookingId,
                studentId: booking.studentId,
                tutorId: booking.tutorId,
                sessionDate: booking.sessionDate || booking.createdAt,
                status: status === 'completed' ? 'present' : status === 'student_absent' ? 'absent' : 'present',
                duration: duration || 60,
                notes,
                markedBy: req.user.id
            },
            { upsert: true, new: true }
        );

        // Update CurrentTutor stats
        const currentTutor = await CurrentTutor.findOne({
            studentId: booking.studentId,
            tutorId: booking.tutorId,
            subject: booking.subject,
            isActive: true
        });

        if (currentTutor) {
            if (status === 'completed') {
                currentTutor.sessionsCompleted += 1;
            } else if (status === 'student_absent') {
                currentTutor.sessionsMissed += 1;
            }
            await currentTutor.save();
        }

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getSessionFeedback,
    submitTutorFeedback,
    submitStudentFeedback,
    addStudyMaterial,
    updateStudyMaterial,
    addHomework,
    updateHomeworkStatus,
    markAttendance
};

