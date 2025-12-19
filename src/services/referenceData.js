// ZAM V2 Data Service (Frontend)
// Fetches all data (Industries, Companies, Constants) from the Backend API

// Cache for constants so we don't refetch on every render
let cachedConstants = null;

// Async API Fetchers

export const fetchConstants = async () => {
    if (cachedConstants) return cachedConstants;

    try {
        const response = await fetch('/api/constants');
        if (!response.ok) throw new Error('Failed to fetch constants');
        cachedConstants = await response.json();
        return cachedConstants;
    } catch (error) {
        console.error('Error fetching constants:', error);
        return {}; // Return empty object on failure
    }
};

export const fetchIndustries = async () => {
    try {
        const response = await fetch('/api/industries');
        if (!response.ok) throw new Error('Failed to fetch industries');
        const data = await response.json();

        // Map backend format if needed, or pass through
        return data.map(ind => ({
            value: ind.key,
            label: ind.name,
            ...ind
        }));
    } catch (error) {
        console.error('Error fetching industries:', error);
        return [];
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
