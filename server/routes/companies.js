import express from 'express';
import Company from '../models/Company.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { industry } = req.query;
        let query = {};
        if (industry) {
            query.industry = industry;
        }
        const companies = await Company.find(query);
        res.json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
