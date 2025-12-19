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
let cachedDb = null;

const connectDB = async () => {
    if (cachedDb) return cachedDb;

    try {
        const db = await mongoose.connect(MONGODB_URI);
        cachedDb = db;
        console.log('✅ MongoDB Connected');
        return db;
    } catch (err) {
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
app.get('/health', (req, res) => {
    res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
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
