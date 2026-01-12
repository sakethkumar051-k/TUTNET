import TutorList from '../components/TutorList';

const FindTutors = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Find the Right Tutor for You</h1>
                    <p className="text-gray-600 text-base">Browse verified tutors based on subject, class, and location</p>
                </div>
                <TutorList />
            </div>
        </div>
    );
};

export default FindTutors;

