const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://tutnet-ffxb.vercel.app',
        /\.vercel\.app$/  // Allow all Vercel preview deployments
    ],
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint (defined early, before routes)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Tutnet API is running',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Tutor Connect API is running');
});

// Database Connection (non-blocking - server will start even if DB fails)
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        console.log('Server will continue without database connection');
    });

// Routes (wrapped in try-catch to prevent server crash)
try {
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/admin', require('./routes/admin.routes'));
    app.use('/api/tutors', require('./routes/tutor.routes'));
    app.use('/api/bookings', require('./routes/booking.routes'));
    app.use('/api/reviews', require('./routes/review.routes'));
    app.use('/api/study-materials', require('./routes/studyMaterial.routes'));
    app.use('/api/favorites', require('./routes/favorite.routes'));
    app.use('/api/progress-reports', require('./routes/progressReport.routes'));
    app.use('/api/attendance', require('./routes/attendance.routes'));
    console.log('All routes loaded successfully');
} catch (error) {
    console.error('Error loading routes:', error);
    // Server will still start, but routes won't work
}

// 404 Handler for undefined routes
app.use((req, res, next) => {
    // Check if it's a method mismatch (e.g., GET on a POST-only route)
    const methodMismatch = {
        '/api/auth/login': 'POST',
        '/api/auth/register': 'POST',
        '/api/auth/forgot-password': 'POST',
        '/api/auth/reset-password': 'POST',
        '/api/auth/verify-admin': 'POST',
        '/api/bookings': 'POST',
        '/api/reviews': 'POST'
    };

    const correctMethod = methodMismatch[req.path];
    const methodHint = correctMethod && req.method !== correctMethod 
        ? ` This endpoint requires ${correctMethod} method, but you used ${req.method}.` 
        : '';

    res.status(404).json({
        message: `Route ${req.method} ${req.path} not found.${methodHint}`,
        hint: correctMethod 
            ? `Try using ${correctMethod} method instead of ${req.method}`
            : 'Check the API documentation for the correct endpoint and method',
        availableEndpoints: [
            'GET /',
            'GET /api/health',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/auth/me (requires auth)',
            'GET /api/tutors',
            'GET /api/tutors/:id'
        ]
    });
});

// Error Handler (must be last)
app.use(require('./middleware/error.middleware').errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});
