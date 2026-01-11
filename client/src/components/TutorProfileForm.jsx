import { useState, useEffect } from 'react';
import api from '../utils/api';

const TutorProfileForm = () => {
    const [formData, setFormData] = useState({
        subjects: '',
        classes: '',
        hourlyRate: '',
        experienceYears: '',
        bio: '',
        availableSlots: '',
        profilePicture: '',
        mode: 'home',
        languages: ''
    });
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch both tutor profile and user details (for profile pic)
                const [profileRes, userRes] = await Promise.all([
                    api.get('/tutors/me'),
                    api.get('/users/me')
                ]);

                const data = profileRes.data;
                const userData = userRes.data;

                setProfileData(data);
                setFormData({
                    subjects: data.subjects?.join(', ') || '',
                    classes: data.classes?.join(', ') || '',
                    hourlyRate: data.hourlyRate || '',
                    experienceYears: data.experienceYears || '',
                    bio: data.bio || '',
                    availableSlots: data.availableSlots?.join(', ') || '',
                    profilePicture: userData.profilePicture || '',
                    mode: data.mode || 'home',
                    languages: data.languages?.join(', ') || ''
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                ...formData,
                subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s),
                classes: formData.classes.split(',').map(s => s.trim()).filter(s => s),
                availableSlots: formData.availableSlots.split(',').map(s => s.trim()).filter(s => s),
                languages: formData.languages.split(',').map(s => s.trim()).filter(s => s),
                hourlyRate: Number(formData.hourlyRate),
                experienceYears: Number(formData.experienceYears)
            };

            const { data } = await api.put('/tutors/profile', payload);
            setProfileData(data); // Update local state with new data including status

            if (data.approvalStatus === 'pending') {
                setMessage({ type: 'success', text: 'Critical changes saved! Your profile is pending admin approval again.' });
            } else {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitForApproval = async () => {
        if (!window.confirm('Submit your profile for admin approval?')) return;

        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const { data } = await api.patch('/tutors/profile/submit');
            setProfileData(data);
            setMessage({ type: 'success', text: 'Profile submitted for approval! An admin will review it soon.' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to submit for approval' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading profile...</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-50 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-50 text-red-800 border-red-200';
            case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-50 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Approval Status Banner */}
            {profileData && (
                <div className={`p-4 rounded-md border ${getStatusColor(profileData.approvalStatus)}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium">
                                Profile Status: <span className="uppercase">{profileData.approvalStatus}</span>
                            </h3>
                            {profileData.approvalStatus === 'pending' && (
                                <p className="text-sm mt-1">Your profile is awaiting admin approval.</p>
                            )}
                            {profileData.approvalStatus === 'approved' && (
                                <p className="text-sm mt-1">Your profile is approved and visible to students!</p>
                            )}
                            {profileData.approvalStatus === 'rejected' && (
                                <div className="text-sm mt-1">
                                    <p className="font-medium">Your profile was rejected.</p>
                                    {profileData.rejectionReason && (
                                        <p className="mt-1">Reason: {profileData.rejectionReason}</p>
                                    )}
                                    <p className="mt-1">Please update your profile and submit again.</p>
                                </div>
                            )}
                        </div>
                        {profileData.approvalStatus !== 'pending' && (
                            <button
                                onClick={handleSubmitForApproval}
                                disabled={submitting}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit for Approval'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                {message.text && (
                    <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Note: Changing <span className="font-semibold">Profile Picture, Subjects, or Classes</span> will require Admin Approval again. Other fields update immediately.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* NEW: Profile Picture */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
                        <div className="mt-1 flex items-center gap-4">
                            {formData.profilePicture ? (
                                <img src={formData.profilePicture} alt="Preview" className="h-12 w-12 rounded-full object-cover border border-gray-200" />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                    <span className="text-xs">No Img</span>
                                </div>
                            )}
                            <input
                                type="text"
                                name="profilePicture"
                                value={formData.profilePicture}
                                onChange={handleChange}
                                placeholder="https://example.com/my-photo.jpg"
                                className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Enter a direct URL to your image for now.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subjects (comma separated)</label>
                            <input
                                type="text"
                                name="subjects"
                                value={formData.subjects}
                                onChange={handleChange}
                                placeholder="Math, Physics, Chemistry"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Classes/Grades (comma separated)</label>
                            <input
                                type="text"
                                name="classes"
                                value={formData.classes}
                                onChange={handleChange}
                                placeholder="Class 10, Class 12, Undergraduate"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hourly Rate (₹)</label>
                            <input
                                type="number"
                                name="hourlyRate"
                                value={formData.hourlyRate}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                            <input
                                type="number"
                                name="experienceYears"
                                value={formData.experienceYears}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        {/* NEW: Mode */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teaching Mode</label>
                            <select
                                name="mode"
                                value={formData.mode}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="home">Home Tuition</option>
                                <option value="online">Online</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                    </div>

                    {/* NEW: Languages */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Languages Spoken (comma separated)</label>
                        <input
                            type="text"
                            name="languages"
                            value={formData.languages}
                            onChange={handleChange}
                            placeholder="English, Telugu, Hindi"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bio / Teaching Style</label>
                        <textarea
                            name="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Describe your teaching style, experience, and what makes you a great tutor..."
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Available Slots (Generic)</label>
                        <input
                            type="text"
                            name="availableSlots"
                            value={formData.availableSlots}
                            onChange={handleChange}
                            placeholder="e.g. Mon-Fri 6PM-9PM, Weekends 10AM-2PM"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-5">
                    <button
                        type="submit"
                        disabled={saving}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TutorProfileForm;
