// ZAM V2 Data Service (Frontend)
// Fetches all data (Industries, Companies, Constants) from the Backend API
export { SEED_INDUSTRIES, SEED_CONSTANTS } from '../data/seedData';

import { SEED_INDUSTRIES, SEED_CONSTANTS } from '../data/seedData';

// Cache for live data
let cachedConstants = null;
let cachedIndustries = null;

// Async API Fetchers

export const fetchConstants = async () => {
    if (cachedConstants) return cachedConstants;

    try {
        const response = await fetch('/api/constants');
        if (!response.ok) throw new Error('Failed to fetch constants');
        cachedConstants = await response.json();
        return cachedConstants;
    } catch (error) {
        console.warn('Using seed constants due to load delay/error');
        return SEED_CONSTANTS;
    }
};

export const fetchIndustries = async () => {
    if (cachedIndustries) return cachedIndustries;

    try {
        const response = await fetch('/api/industries');
        if (!response.ok) throw new Error('Failed to fetch industries');
        const data = await response.json();

        cachedIndustries = data.map(ind => ({
            value: ind.key,
            label: ind.name,
            ...ind
        }));
        return cachedIndustries;
    } catch (error) {
        console.warn('Using seed industries due to load delay/error');
        return SEED_INDUSTRIES.map(ind => ({
            value: ind.key,
            label: ind.name,
            ...ind
        }));
    }
};

export const fetchComparables = async (industryKey) => {
    try {
        const url = industryKey
            ? `/api/comparables?industry=${industryKey}`
            : '/api/comparables';

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch comparables');
        return await response.json();
    } catch (error) {
        console.error('Error fetching comparables:', error);
        return [];
    }
};
