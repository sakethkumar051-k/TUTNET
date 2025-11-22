import { useState, useEffect } from 'react';
import api from '../utils/api';
import TutorCard from './TutorCard';
import BookingForm from './BookingForm';

const TutorList = () => {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        subject: '',
        classGrade: '', // 'class' is a reserved word
        area: ''
    });
    const [selectedTutor, setSelectedTutor] = useState(null);

    const fetchTutors = async () => {
        setLoading(true);
        try {
            // Construct query params
            const params = new URLSearchParams();
            if (filters.subject) params.append('subject', filters.subject);
            if (filters.classGrade) params.append('class', filters.classGrade);
            if (filters.area) params.append('area', filters.area);

            const { data } = await api.get(`/tutors?${params.toString()}`);
            setTutors(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTutors();
    }, []); // Initial load

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTutors();
    };

    const handleClearFilters = () => {
        setFilters({
            subject: '',
            classGrade: '',
            area: ''
        });
        // Trigger immediate search with empty filters
        setLoading(true);
        api.get('/tutors')
            .then(({ data }) => setTutors(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const hasActiveFilters = filters.subject || filters.classGrade || filters.area;

    return (
        <div>
            {/* Search Filters */}
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
                <div className="mb-4 flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            {hasActiveFilters ? 'Filtered Tutors' : 'All Available Tutors'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {hasActiveFilters ? 'Use the form below to refine your search' : 'Browse all tutors or use filters to find specific matches'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => fetchTutors()}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
                <form onSubmit={handleSearch} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-4">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            id="subject"
                            value={filters.subject}
                            onChange={handleFilterChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="Math, Science..."
                        />
                    </div>
                    <div>
                        <label htmlFor="classGrade" className="block text-sm font-medium text-gray-700">Class</label>
                        <input
                            type="text"
                            name="classGrade"
                            id="classGrade"
                            value={filters.classGrade}
                            onChange={handleFilterChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="10th, 12th..."
                        />
                    </div>
                    <div>
                        <label htmlFor="area" className="block text-sm font-medium text-gray-700">Area</label>
                        <input
                            type="text"
                            name="area"
                            id="area"
                            value={filters.area}
                            onChange={handleFilterChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="Miyapur..."
                        />
                    </div>
                    <div className="flex items-end gap-2 sm:col-span-1">
                        <button
                            type="submit"
                            className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Search
                        </button>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Tutor List */}
            {loading ? (
                <div>Loading tutors...</div>
            ) : (
                <div className="grid gap-6">
                    {tutors.length === 0 ? (
                        <p>No tutors found matching your criteria.</p>
                    ) : (
                        tutors.map(tutor => (
                            <TutorCard
                                key={tutor._id}
                                tutor={tutor}
                                onBook={() => setSelectedTutor(tutor)}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Booking Modal */}
            {selectedTutor && (
                <BookingForm
                    tutorId={selectedTutor.userId?._id}
                    tutorName={selectedTutor.userId?.name}
                    onClose={() => setSelectedTutor(null)}
                    onSuccess={() => {
                        alert('Booking request sent successfully!');
                        // Optionally refresh something
                    }}
                />
            )}
        </div>
    );
};

export default TutorList;
