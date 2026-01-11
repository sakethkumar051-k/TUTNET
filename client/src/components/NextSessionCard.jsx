import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const NextSessionCard = ({ session, onJoin }) => {
    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!session?.sessionDate) return;

        const updateTimer = () => {
            const now = new Date();
            const start = new Date(session.sessionDate);
            const diff = start - now;

            if (diff <= 0) {
                // Check if session is still within duration (e.g. 1 hour)
                const end = new Date(start.getTime() + (session.duration || 60) * 60000);
                if (now < end) {
                    setTimeLeft('Happening Now');
                } else {
                    setTimeLeft('Completed');
                }
            } else if (diff < 60 * 60 * 1000) {
                const mins = Math.ceil(diff / 60000);
                setTimeLeft(`Starts in ${mins} min`);
            } else if (diff < 24 * 60 * 60 * 1000) {
                const hours = Math.floor(diff / 3600000);
                setTimeLeft(`Starts in ${hours}h`);
            } else {
                setTimeLeft('Upcoming');
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [session]);

    if (!session) return null;

    const targetUser = user?.role === 'student' ? session.tutorId : session.studentId;
    const targetName = targetUser?.name || 'Unknown';
    const sessionTime = new Date(session.sessionDate).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs font-semibold tracking-wide uppercase">
                            Up Next
                        </span>
                        <span className="text-indigo-100 text-sm font-medium">
                            {timeLeft}
                        </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                        {session.subject} with {targetName.split(' ')[0]}
                    </h2>

                    <div className="flex items-center gap-4 text-indigo-100 text-sm">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {sessionTime} ({session.duration}m)
                        </span>
                    </div>
                </div>

                <div className="w-full sm:w-auto">
                    {(session.onlineLink || session.status === 'approved') ? (
                        <a
                            href={session.onlineLink || '#'}
                            onClick={(e) => {
                                if (session.onlineLink && onJoin) onJoin(session);
                                if (!session.onlineLink) e.preventDefault();
                            }}
                            target={session.onlineLink ? "_blank" : "_self"}
                            rel={session.onlineLink ? "noopener noreferrer" : ""}
                            className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${session.onlineLink
                                    ? 'bg-white text-indigo-600 hover:bg-indigo-50 hover:scale-105'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {session.onlineLink ? 'Join Session Now' : 'Link Pending'}
                        </a>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default NextSessionCard;
