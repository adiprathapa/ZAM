import express from 'express';
import Analysis from '../models/Analysis.js';

const router = express.Router();

// GET all analyses (Filtered by Device ID)
router.get('/', async (req, res) => {
    try {
        const deviceId = req.headers['x-device-id'];
        if (!deviceId) return res.status(400).json({ message: 'Missing Device ID' });

        // Only return analyses belonging to this device
        const analyses = await Analysis.find({ deviceId }).sort({ createdAt: -1 });
        res.json(analyses);
    } catch (error) {
        console.error('Error fetching analyses:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST new analysis (Save Result with Device ID)
router.post('/', async (req, res) => {
    try {
        const deviceId = req.headers['x-device-id'];
        if (!deviceId) return res.status(400).json({ message: 'Missing Device ID' });

        const newAnalysis = new Analysis({
            ...req.body,
            deviceId // Tag with device ID
        });

        const savedAnalysis = await newAnalysis.save();
        res.status(201).json(savedAnalysis);
    } catch (error) {
        console.error('Error saving analysis:', error);
        res.status(400).json({ message: 'Invalid Data', error: error.message });
    }
});

// DELETE analysis (Security: Ownership Check)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deviceId = req.headers['x-device-id'];
        if (!deviceId) return res.status(400).json({ message: 'Missing Device ID' });

        // Secure Delete: Ensure ID matches AND Device ID matches
        const result = await Analysis.findOneAndDelete({ _id: id, deviceId });

        if (!result) {
            return res.status(404).json({ message: 'Analysis not found or permission denied' });
        }

        res.json({ message: 'Analysis deleted' });
    } catch (error) {
        console.error('Error deleting analysis:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
