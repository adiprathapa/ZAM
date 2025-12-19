import express from 'express';
import SystemConstant from '../models/SystemConstant.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const constants = await SystemConstant.find();
        // transform array into object { KEY: { params } } or just { KEY: [items] }
        // The frontend referenceData expects an object where keys are the constant keys.
        const constantMap = {};
        constants.forEach(c => {
            constantMap[c.key] = c.items;
        });
        res.json(constantMap);
    } catch (error) {
        console.error('Error fetching constants:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
