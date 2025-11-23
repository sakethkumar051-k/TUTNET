import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TutorDashboard from './pages/TutorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Footer from './components/Footer';

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastProvider>
                    <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/admin-login" element={<AdminLogin />} />
                            <Route 
                                path="/tutor-dashboard" 
                                element={
                                    <ProtectedRoute requiredRole="tutor">
                                        <TutorDashboard />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/student-dashboard" 
                                element={
                                    <ProtectedRoute requiredRole="student">
                                        <StudentDashboard />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/admin-dashboard" 
                                element={
                                    <ProtectedRoute requiredRole="admin">
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } 
                            />
                        </Routes>
                        <Footer />
                    </div>
                </ToastProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
