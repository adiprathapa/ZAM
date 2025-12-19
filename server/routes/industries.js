import express from 'express';
import Industry from '../models/Industry.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const industries = await Industry.find();
        res.json(industries);
    } catch (error) {
        console.error('Error fetching industries:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
