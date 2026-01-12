const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');

// @desc    Get all approved tutors with filters
// @route   GET /api/tutors
// @access  Public
const getTutors = async (req, res) => {
    try {
        const { subject, class: studentClass, area, minRate, maxRate, limit } = req.query;

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
        let tutorsQuery = TutorProfile.find(query).populate('userId', 'name email phone location isActive');

        // Apply limit if provided
        if (limit) {
            tutorsQuery = tutorsQuery.limit(parseInt(limit));
        }

        let tutors = await tutorsQuery;

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

        // Add rating information to response
        const tutorsWithRating = tutors.map(tutor => ({
            ...tutor.toObject(),
            averageRating: tutor.averageRating || 0,
            reviewCount: tutor.totalReviews || 0
        }));

        res.json(tutorsWithRating);
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

// @desc    Check if tutor profile is complete
// @route   GET /api/tutors/profile/complete
// @access  Private (Any authenticated user - role might not be set during onboarding)
const checkProfileComplete = async (req, res) => {
    try {
        console.log('Checking profile completeness for user:', req.user.id);
        const user = await User.findById(req.user.id);
        
        if (!user) {
            console.log('User not found:', req.user.id);
            return res.status(200).json({ 
                isComplete: false, 
                missingFields: ['user'],
                message: 'User not found',
                profile: null
            });
        }

        console.log('User role:', user.role);

        // If user is not a tutor, they don't need tutor profile completion
        if (user.role !== 'tutor') {
            console.log('User is not a tutor, returning complete=true');
            return res.status(200).json({ 
                isComplete: true, // Students don't need tutor profile
                missingFields: [],
                message: 'User is not a tutor',
                profile: null
            });
        }

        const tutor = await TutorProfile.findOne({ userId: req.user.id });
        console.log('Tutor profile found:', !!tutor);

        // If profile doesn't exist yet, return incomplete status (not 404)
        if (!tutor) {
            return res.status(200).json({ 
                isComplete: false, 
                missingFields: ['profile', 'subjects', 'classes', 'hourlyRate', 'experienceYears', 'bio', 'mode', 'languages'],
                message: 'Tutor profile not found. Please complete your profile.',
                profile: null
            });
        }

        // Required fields for business development
        const requiredFields = {
            subjects: tutor.subjects && tutor.subjects.length > 0,
            classes: tutor.classes && tutor.classes.length > 0,
            hourlyRate: tutor.hourlyRate > 0,
            experienceYears: tutor.experienceYears !== undefined && tutor.experienceYears >= 0,
            bio: tutor.bio && tutor.bio.trim().length >= 50,
            mode: tutor.mode,
            languages: tutor.languages && tutor.languages.length > 0,
            phone: user.phone && user.phone.trim().length > 0,
            location: user.location && user.location.area && user.location.area.trim().length > 0
        };

        const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);
        const isComplete = missingFields.length === 0;

        res.status(200).json({
            isComplete,
            missingFields,
            profile: tutor
        });
    } catch (error) {
        console.error('Error in checkProfileComplete:', error);
        // Always return 200 with incomplete status on error, never 404 or 500
        res.status(200).json({ 
            isComplete: false, 
            missingFields: [],
            message: 'Error checking profile completeness',
            profile: null
        });
    }
};

// @desc    Update tutor profile
// @route   PUT /api/tutors/profile
// @access  Private (Tutor only)
// @desc    Update tutor profile
// @route   PUT /api/tutors/profile
// @access  Private (Tutor only)
const updateTutorProfile = async (req, res) => {
    try {
        const { subjects, classes, hourlyRate, experienceYears, bio, availableSlots, mode, languages, profilePicture, education, qualifications } = req.body;

        const tutor = await TutorProfile.findOne({ userId: req.user.id });

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor profile not found' });
        }

        let requiresApproval = false;

        // IMPORTANT: Only require approval for changes AFTER the profile has been approved once
        // Initial profile setup does NOT require approval - just save the data
        const wasApproved = tutor.approvalStatus === 'approved';

        // Check for critical changes that require re-approval (ONLY if profile was previously approved)
        if (wasApproved) {
            // 1. Profile Picture
            if (profilePicture !== undefined) {
                // Fetch user to check current picture
                const user = await User.findById(req.user.id);
                if (user.profilePicture !== profilePicture) {
                    requiresApproval = true;
                    user.profilePicture = profilePicture;
                    await user.save();
                }
            }

            // Helper to compare arrays (simple sort and stringify)
            const arraysEqual = (a, b) => {
                if (!a || !b) return a === b;
                return JSON.stringify(a.sort()) === JSON.stringify(b.sort());
            };

            // 2. Subjects - only require approval if profile was approved
            if (subjects && !arraysEqual(tutor.subjects, subjects)) {
                requiresApproval = true;
                tutor.subjects = subjects;
            }

            // 3. Classes - only require approval if profile was approved
            if (classes && !arraysEqual(tutor.classes, classes)) {
                requiresApproval = true;
                tutor.classes = classes;
            }
        } else {
            // Initial setup or pending profile - update all fields without approval requirement
            if (profilePicture !== undefined) {
                const user = await User.findById(req.user.id);
                user.profilePicture = profilePicture;
                await user.save();
            }
            if (subjects) tutor.subjects = subjects;
            if (classes) tutor.classes = classes;
        }

        // Update non-critical fields (always update, no approval needed)
        if (hourlyRate !== undefined) tutor.hourlyRate = hourlyRate;
        if (experienceYears !== undefined) tutor.experienceYears = experienceYears;
        if (bio) tutor.bio = bio;
        if (availableSlots) tutor.availableSlots = availableSlots;
        if (mode) tutor.mode = mode;
        if (languages) tutor.languages = languages;
        if (education) tutor.education = education;
        if (qualifications) tutor.qualifications = qualifications;

        // Only reset approval status if profile was approved and critical fields changed
        if (requiresApproval && wasApproved) {
            tutor.approvalStatus = 'pending';
        }

        await tutor.save();

        res.json({
            ...tutor.toObject(),
            _requiresApproval: requiresApproval // Flag to tell frontend if status changed
        });
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
    submitForApproval,
    checkProfileComplete
};
