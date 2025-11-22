import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Tutnet</h3>
                        <p className="text-gray-400 text-sm">
                            Connecting students with the best home tutors in West Hyderabad.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/" className="hover:text-white">Home</Link></li>
                            <li><Link to="/login" className="hover:text-white">Login</Link></li>
                            <li><Link to="/register" className="hover:text-white">Register</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>Email: support@tutnet.com</li>
                            <li>Phone: +91 123 456 7890</li>
                            <li>Location: Hyderabad, India</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} Tutnet. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
