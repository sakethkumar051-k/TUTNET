import { useState } from 'react';
import TutorList from '../components/TutorList';
import BookingList from '../components/BookingList';

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('find-tutors');

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Student Dashboard</h1>

                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('find-tutors')}
                            className={`${activeTab === 'find-tutors'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Find Tutors
                        </button>
                        <button
                            onClick={() => setActiveTab('my-bookings')}
                            className={`${activeTab === 'my-bookings'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            My Bookings
                        </button>
                    </nav>
                </div>

                {activeTab === 'find-tutors' ? (
                    <TutorList />
                ) : (
                    <BookingList role="student" />
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
