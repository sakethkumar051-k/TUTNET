const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');

// @desc    Get all approved tutors with filters
// @route   GET /api/tutors
// @access  Public
const getTutors = async (req, res) => {
    try {
        const { subject, class: studentClass, area, minRate, maxRate } = req.query;

        let query = {
            approvalStatus: 'approved'
        };

        // Filter by subject
        if (subject) {
            query.subjects = { $in: [new RegExp(subject, 'i')] };
        }

        // Filter by class
        if (studentClass) {
            query.classes = { $in: [new RegExp(studentClass, 'i')] };
        }

        // Filter by rate
        if (minRate || maxRate) {
            query.hourlyRate = {};
            if (minRate) query.hourlyRate.$gte = Number(minRate);
            if (maxRate) query.hourlyRate.$lte = Number(maxRate);
        }

        // Find tutors matching profile criteria
        let tutors = await TutorProfile.find(query).populate('userId', 'name email phone location isActive');

        // Filter by area (which is in the User model)
        if (area) {
            tutors = tutors.filter(tutor =>
                tutor.userId &&
                tutor.userId.location &&
                tutor.userId.location.area &&
                tutor.userId.location.area.toLowerCase().includes(area.toLowerCase())
            );
        }

        // Filter by isActive
        tutors = tutors.filter(tutor => tutor.userId && tutor.userId.isActive);

        res.json(tutors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get tutor profile by ID
// @route   GET /api/tutors/:id
// @access  Public
const getTutorById = async (req, res) => {
    try {
        const tutor = await TutorProfile.findById(req.params.id).populate('userId', 'name email phone location');

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        res.json(tutor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get current tutor profile
// @route   GET /api/tutors/me
// @access  Private (Tutor only)
const getMyProfile = async (req, res) => {
    try {
        const tutor = await TutorProfile.findOne({ userId: req.user.id });

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor profile not found' });
        }

        res.json(tutor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update tutor profile
// @route   PUT /api/tutors/profile
// @access  Private (Tutor only)
const updateTutorProfile = async (req, res) => {
    try {
        const { subjects, classes, hourlyRate, experienceYears, bio, availableSlots } = req.body;

        const tutor = await TutorProfile.findOne({ userId: req.user.id });

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor profile not found' });
        }

        tutor.subjects = subjects || tutor.subjects;
        tutor.classes = classes || tutor.classes;
        tutor.hourlyRate = hourlyRate || tutor.hourlyRate;
        tutor.experienceYears = experienceYears || tutor.experienceYears;
        tutor.bio = bio || tutor.bio;
        tutor.availableSlots = availableSlots || tutor.availableSlots;

        await tutor.save();

        res.json(tutor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Submit profile for approval
// @route   PATCH /api/tutors/profile/submit
// @access  Private (Tutor only)
const submitForApproval = async (req, res) => {
    try {
        const tutor = await TutorProfile.findOne({ userId: req.user.id });

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor profile not found' });
        }

        tutor.approvalStatus = 'pending';
        tutor.rejectionReason = undefined; // Clear any previous rejection reason
        await tutor.save();

        res.json(tutor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getTutors,
    getTutorById,
    updateTutorProfile,
    getMyProfile,
    submitForApproval
};
