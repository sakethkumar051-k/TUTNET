import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CompleteProfile = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, user: loginUser } = useAuth();

    // Form state
    const [role, setRole] = useState('');
    const [formData, setFormData] = useState({
        phone: '',
        location: {
            area: '',
            city: 'Hyderabad'
        },
        classGrade: '', // For students
        subjects: '' // For tutors (comma separated)
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        // If user is already logged in and has required fields, redirect to dashboard
        if (loginUser && loginUser.phone && loginUser.location?.area) {
            if (loginUser.role === 'tutor') {
                navigate('/tutor-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        }

        const urlToken = searchParams.get('token');
        if (!urlToken) {
            // If no token in URL and not logged in, go to login
            if (!loginUser) {
                navigate('/login');
            }
            return;
        }
        setToken(urlToken);
    }, [searchParams, navigate, loginUser]);

    const handleChange = (e) => {
        if (e.target.name === 'area') {
            setFormData({
                ...formData,
                location: { ...formData.location, area: e.target.value }
            });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!role) {
            setError('Please select a role (Student or Tutor)');
            return;
        }

        if (!formData.phone || !formData.location.area) {
            setError('Please fill in phone and location');
            return;
        }

        if (role === 'student' && !formData.classGrade) {
            setError('Please select your class/grade');
            return;
        }

        if (role === 'tutor' && !formData.subjects) {
            setError('Please enter at least one subject');
            return;
        }

        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

            // Format subjects for tutor
            const subjectsArray = role === 'tutor'
                ? formData.subjects.split(',').map(s => s.trim()).filter(s => s)
                : [];

            // Call update profile endpoint
            const response = await axios.put(
                `${apiUrl}/auth/profile`,
                {
                    role,
                    phone: formData.phone,
                    location: formData.location,
                    classGrade: role === 'student' ? formData.classGrade : undefined,
                    subjects: role === 'tutor' ? subjectsArray : undefined
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // IMPORTANT: Use the NEW token returned from the server
            // This token contains the updated role
            const newToken = response.data.token;

            if (newToken) {
                // Pass the new token to login
                login(newToken);

                // Redirect based on role
                if (role === 'tutor') {
                    navigate('/tutor-dashboard');
                } else {
                    navigate('/student-dashboard');
                }
            } else {
                throw new Error('No token returned from update');
            }
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
                    <p className="mt-2 text-gray-600">Please provide a few more details to get started.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('student')}
                                className={`py-3 px-4 rounded-xl border-2 transition-all ${role === 'student'
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                                    : 'border-gray-200 hover:border-indigo-200 text-gray-600'
                                    }`}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('tutor')}
                                className={`py-3 px-4 rounded-xl border-2 transition-all ${role === 'tutor'
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                                    : 'border-gray-200 hover:border-indigo-200 text-gray-600'
                                    }`}
                            >
                                Tutor
                            </button>
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            name="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area / Locality</label>
                        <input
                            name="area"
                            type="text"
                            placeholder="e.g. Banjara Hills"
                            required
                            value={formData.location.area}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Student Specific: Class/Grade */}
                    {role === 'student' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class / Grade</label>
                            <select
                                name="classGrade"
                                required
                                value={formData.classGrade}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                            >
                                <option value="">Select your class</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i} value={`Class ${i + 1}`}>Class {i + 1}</option>
                                ))}
                                <option value="Bachelors">Bachelors / Undergrad</option>
                                <option value="Masters">Masters / Postgrad</option>
                            </select>
                        </div>
                    )}

                    {/* Tutor Specific: Subjects */}
                    {role === 'tutor' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subjects you teach</label>
                            <input
                                name="subjects"
                                type="text"
                                placeholder="Math, Physics, Chemistry (comma separated)"
                                required
                                value={formData.subjects}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Separate multiple subjects with commas</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Profile...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
