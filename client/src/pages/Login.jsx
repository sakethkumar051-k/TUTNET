import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = await login(formData);

            // Verify role matches
            if (userData.role !== role) {
                setError(`This account is registered as ${userData.role}, not ${role}`);
                setLoading(false);
                return;
            }

            // Navigate based on role
            if (role === 'tutor') {
                navigate('/tutor-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-md w-full">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-semibold text-gray-900 tracking-tight">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-base text-gray-600">
                        Sign in to continue to Tutnet
                    </p>
                </div>

                {/* Role Switcher */}
                <div className="mb-8">
                    <div className="relative bg-white rounded-2xl p-1 shadow-sm border border-gray-200">
                        <div className="grid grid-cols-2 gap-1">
                            <button
                                type="button"
                                onClick={() => setRole('student')}
                                className={`relative z-10 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${role === 'student'
                                        ? 'text-white'
                                        : 'text-gray-700 hover:text-gray-900'
                                    }`}
                            >
                                I'm a Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('tutor')}
                                className={`relative z-10 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${role === 'tutor'
                                        ? 'text-white'
                                        : 'text-gray-700 hover:text-gray-900'
                                    }`}
                            >
                                I'm a Tutor
                            </button>
                        </div>
                        {/* Sliding background */}
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl shadow-lg transition-all duration-300 ease-out ${role === 'tutor' ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'
                                }`}
                        />
                    </div>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-shake">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-red-800 font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
