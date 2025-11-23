import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import TutorCard from './TutorCard';
import BookingForm from './BookingForm';
import TutorSearch from './TutorSearch';

const TutorList = () => {
    const [tutors, setTutors] = useState([]);
    const [filteredTutors, setFilteredTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const { showSuccess } = useToast();

    const fetchTutors = async (filters = {}) => {
        setLoading(true);
        try {
            // Construct query params
            const params = new URLSearchParams();
            if (filters.subject) params.append('subject', filters.subject);
            if (filters.class) params.append('class', filters.class);
            if (filters.area) params.append('area', filters.area);
            if (filters.minRate) params.append('minRate', filters.minRate);
            if (filters.maxRate) params.append('maxRate', filters.maxRate);

            const { data } = await api.get(`/tutors?${params.toString()}`);
            setTutors(data);
            setFilteredTutors(data);
        } catch (err) {
            console.error('Error fetching tutors:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTutors();
    }, []);

    const handleSearch = (filters) => {
        fetchTutors(filters);
    };

    const handleBookingSuccess = () => {
        showSuccess('Booking request sent successfully!');
        setSelectedTutor(null);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <TutorSearch onSearch={handleSearch} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-96"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Search Component */}
            <TutorSearch onSearch={handleSearch} />

            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-700">
                    <span className="font-semibold">{filteredTutors.length}</span> tutor{filteredTutors.length !== 1 ? 's' : ''} found
                </p>
            </div>

            {/* Tutor Grid */}
            {filteredTutors.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tutors found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTutors.map(tutor => (
                        <TutorCard
                            key={tutor._id}
                            tutor={tutor}
                            onBook={() => setSelectedTutor(tutor)}
                        />
                    ))}
                </div>
            )}

            {/* Booking Modal */}
            {selectedTutor && (
                <BookingForm
                    tutorId={selectedTutor.userId?._id}
                    tutorName={selectedTutor.userId?.name}
                    onClose={() => setSelectedTutor(null)}
                    onSuccess={handleBookingSuccess}
                />
            )}
        </div>
    );
};

export default TutorList;
