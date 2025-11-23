import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import TutorCard from './TutorCard';
import BookingForm from './BookingForm';
import TutorSearch from './TutorSearch';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

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
                <LoadingSkeleton type="card" count={6} />
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
                <EmptyState
                    icon="🔍"
                    title="No tutors found"
                    description="Try adjusting your search filters or check back later for new tutors."
                />
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
