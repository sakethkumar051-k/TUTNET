import { useState, useEffect } from 'react';
import api from '../utils/api';

const TutorProfileForm = () => {
    const [formData, setFormData] = useState({
        subjects: '',
        classes: '',
        hourlyRate: '',
        experienceYears: '',
        bio: '',
        availableSlots: ''
    });
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/tutors/me');
                setProfileData(data);
                setFormData({
                    subjects: data.subjects.join(', '),
                    classes: data.classes.join(', '),
                    hourlyRate: data.hourlyRate,
                    experienceYears: data.experienceYears,
                    bio: data.bio,
                    availableSlots: data.availableSlots.join(', ')
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
                subjects: formData.subjects.split(',').map(s => s.trim()),
                classes: formData.classes.split(',').map(s => s.trim()),
                availableSlots: formData.availableSlots.split(',').map(s => s.trim()),
                hourlyRate: Number(formData.hourlyRate),
                experienceYears: Number(formData.experienceYears)
            };

            const { data } = await api.put('/tutors/profile', payload);
            setProfileData(data);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
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

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subjects (comma separated)</label>
                        <input
                            type="text"
                            name="subjects"
                            value={formData.subjects}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Classes (comma separated)</label>
                        <input
                            type="text"
                            name="classes"
                            value={formData.classes}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
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
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea
                            name="bio"
                            rows={3}
                            value={formData.bio}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Available Slots (comma separated)</label>
                        <input
                            type="text"
                            name="availableSlots"
                            value={formData.availableSlots}
                            onChange={handleChange}
                            placeholder="e.g. Mon 10-12, Wed 14-16"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
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
