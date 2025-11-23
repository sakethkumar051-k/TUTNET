import TutorList from '../components/TutorList';

const FindTutors = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Tutors</h1>
                    <p className="text-gray-600">Browse and search for qualified tutors in your area</p>
                </div>
                <TutorList />
            </div>
        </div>
    );
};

export default FindTutors;

