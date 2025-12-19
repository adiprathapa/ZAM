import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import industryRoutes from './routes/industries.js';
import companyRoutes from './routes/companies.js';
import constantRoutes from './routes/constants.js';
import analysisRoutes from './routes/analyses.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zam';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection (Cached for Serverless)
let lastConnectError = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return;

    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });
        console.log('✅ MongoDB Connected');
        lastConnectError = null;
    } catch (err) {
        lastConnectError = `${err.name}: ${err.message}`;
        console.error('❌ MongoDB Connection Error:', err);
    }
};

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Routes
app.use('/api/industries', industryRoutes);
app.use('/api/comparables', companyRoutes);
app.use('/api/constants', constantRoutes);
app.use('/api/analyses', analysisRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState,
        hasUri: !!process.env.MONGODB_URI,
        error: lastConnectError,
        env: process.env.NODE_ENV
    });
});

// Root Route
app.get('/', (req, res) => {
    res.send('✅ ZAM API Server is Running. Frontend is hosted on GitHub Pages.');
});

// Start Server (only if not on Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

export default app;
