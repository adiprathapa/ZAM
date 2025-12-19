// ZAM V2 Data Service (Frontend)
// Fetches all data (Industries, Companies, Constants) from the Backend API

// SEED DATA (Fallbacks for Instant Loading)
const SEED_INDUSTRIES = [
    { key: 'saas_horizontal', name: 'SaaS (Horizontal)', metrics: { avgAcv: 25000, churnRate: 0.10, growthRate: 0.15 } },
    { key: 'saas_vertical', name: 'SaaS (Vertical)', metrics: { avgAcv: 45000, churnRate: 0.08, growthRate: 0.12 } },
    { key: 'fintech', name: 'Fintech & Payments', metrics: { avgAcv: 15000, churnRate: 0.15, growthRate: 0.22 } },
    { key: 'ecommerce', name: 'E-commerce & Retail', metrics: { avgAcv: 120, churnRate: 0.40, growthRate: 0.10 } },
    { key: 'digital_health', name: 'Digital Health', metrics: { avgAcv: 8500, churnRate: 0.12, growthRate: 0.18 } }
];

const SEED_CONSTANTS = {
    CUSTOMER_TYPES: [
        { value: 'b2b', label: 'B2B (Business to Business)' },
        { value: 'b2c', label: 'B2C (Business to Consumer)' },
        { value: 'b2b2c', label: 'B2B2C' },
        { value: 'marketplace', label: 'Marketplace (Two-sided)' }
    ],
    GEOGRAPHIES: [
        { value: 'global', label: 'Global', factor: 1.0 },
        { value: 'na', label: 'North America', factor: 0.35 },
        { value: 'eu', label: 'Europe', factor: 0.25 },
        { value: 'apac', label: 'Asia Pacific', factor: 0.30 },
        { value: 'latam', label: 'Latin America', factor: 0.05 },
        { value: 'mea', label: 'Middle East & Africa', factor: 0.05 }
    ]
};

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
