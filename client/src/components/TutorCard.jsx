const TutorCard = ({ tutor, onBook }) => {
    // Calculate average rating
    const averageRating = tutor.averageRating || 0;
    const reviewCount = tutor.reviewCount || 0;

    // Get subject colors
    const getSubjectColor = (index) => {
        const colors = [
            'bg-blue-100 text-blue-800',
            'bg-green-100 text-green-800',
            'bg-purple-100 text-purple-800',
            'bg-pink-100 text-pink-800',
            'bg-yellow-100 text-yellow-800'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <div className="flex items-start justify-between text-white">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">
                            {tutor.userId?.name}
                        </h3>
                        <p className="text-indigo-100 text-sm flex items-center gap-1">
                            📍 {tutor.userId?.location?.area}, {tutor.userId?.location?.city || 'Hyderabad'}
                        </p>
                    </div>

                    {/* Rating Badge */}
                    {reviewCount > 0 && (
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                            <div className="flex items-center gap-1">
                                <span className="text-yellow-300 text-lg">★</span>
                                <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
                            </div>
                            <p className="text-xs text-indigo-100">{reviewCount} reviews</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Subjects */}
                <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Subjects</p>
                    <div className="flex flex-wrap gap-2">
                        {tutor.subjects?.slice(0, 4).map((subject, index) => (
                            <span
                                key={index}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getSubjectColor(index)}`}
                            >
                                {subject}
                            </span>
                        ))}
                        {tutor.subjects?.length > 4 && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                +{tutor.subjects.length - 4} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Classes */}
                <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Classes</p>
                    <p className="text-sm text-gray-600">{tutor.classes?.join(', ')}</p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Hourly Rate</p>
                        <p className="text-lg font-bold text-indigo-600">₹{tutor.hourlyRate}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Experience</p>
                        <p className="text-lg font-bold text-gray-900">{tutor.experienceYears} years</p>
                    </div>
                </div>

                {/* Bio */}
                {tutor.bio && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-1">About</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{tutor.bio}</p>
                    </div>
                )}

                {/* Book Button */}
                <button
                    onClick={() => onBook(tutor)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                    Book Now
                </button>
            </div>
        </div>
    );
};

export default TutorCard;
