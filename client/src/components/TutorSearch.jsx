import { useState } from 'react';

const TutorSearch = ({ onSearch }) => {
    const [filters, setFilters] = useState({
        subject: '',
        class: '',
        area: '',
        minRate: '',
        maxRate: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(filters);
    };

    const handleClear = () => {
        const clearedFilters = {
            subject: '',
            class: '',
            area: '',
            minRate: '',
            maxRate: ''
        };
        setFilters(clearedFilters);
        onSearch(clearedFilters);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🔍 Search Tutors
            </h3>

            <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={filters.subject}
                            onChange={handleChange}
                            placeholder="e.g., Mathematics"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Class */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Class
                        </label>
                        <input
                            type="text"
                            name="class"
                            value={filters.class}
                            onChange={handleChange}
                            placeholder="e.g., Class 10"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Area */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Area
                        </label>
                        <input
                            type="text"
                            name="area"
                            value={filters.area}
                            onChange={handleChange}
                            placeholder="e.g., West Hyderabad"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Min Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Rate (₹/hour)
                        </label>
                        <input
                            type="number"
                            name="minRate"
                            value={filters.minRate}
                            onChange={handleChange}
                            placeholder="Min"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Max Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Rate (₹/hour)
                        </label>
                        <input
                            type="number"
                            name="maxRate"
                            value={filters.maxRate}
                            onChange={handleChange}
                            placeholder="Max"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                    >
                        🔍 Search
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleClear();
                            }
                        }}
                        className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        aria-label="Clear all filters"
                    >
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TutorSearch;
