/**
 * ZAM Calculation Engine
 * 
 * Provides deterministic logic for Market Sizing (TAM/SAM/SOM).
 * Uses industry benchmarks to intelligently estimate starting values.
 */

// Multipliers for company size segments (Census proxy)
const SIZE_MULTIPLIERS = {
    10: 100000,   // Startup/SMB
    50: 25000,    // Mid-Market
    500: 5000     // Enterprise
};

// Geographic Reach Factors (Global = 100%, Regional < 100%)
const GEO_FACTORS = {
    global: 1.0,
    na: 0.35,
    eu: 0.25,
    apac: 0.30,
    latam: 0.05,
    mea: 0.05
};

/**
 * Calculate Top-Down Market Size based on Wizard Inputs + Industry Data
 * 
 * @param {Object} inputs - Form data from Wizard
 * @param {Object} industryData - Data fetched from Backend API
 */
export function calculateTopDown(inputs, industryData) {
    // 1. Determine Base Price (ACV)
    // Use user input if provided, otherwise fallback to industry benchmark
    const userPrice = parseFloat(inputs.price) || parseFloat(inputs.acv);
    const benchmarkPrice = industryData?.metrics?.avgAcv || 1000;
    const avgPrice = userPrice > 0 ? userPrice : benchmarkPrice;

    // 2. Estimate Total Addressable Users (Proxy)
    // Logic: Start with a base generic business count (~200M globally), 
    // filter by geography, then filter by company size target.
    const globalBizBase = 200000000;
    const geoFactor = GEO_FACTORS[inputs.geography] || 1.0;

    // Refine by B2B vs B2C
    let baseUniverse = inputs.customerType === 'b2c'
        ? 2000000000 // ~2B online consumers
        : globalBizBase;

    // Refine by Company Size (if B2B)
    if (inputs.customerType.includes('b2b') && inputs.maxEmployees) {
        // Crude heuristic: smaller target = larger pool
        const maxEmp = parseInt(inputs.maxEmployees);
        if (maxEmp < 50) baseUniverse *= 0.6; // Small biz is 60% of market count
        else if (maxEmp > 1000) baseUniverse *= 0.05; // Enterprise is top 5%
        else baseUniverse *= 0.35; // Mid-market
    }

    const totalAddressableUsers = Math.floor(baseUniverse * geoFactor);

    // 3. TAM (Total Addressable Market)
    const tam = totalAddressableUsers * avgPrice;

    // 4. SAM (Serviceable Available Market)
    // Default logic: Industry standard growth rate limits immediate reach
    // or use a standard segmentation filter (e.g. 25% of TAM)
    const segmentReach = 0.25; // Default 25% serviceable
    const sam = tam * segmentReach;

    // 5. SOM (Serviceable Obtainable Market)
    // Default: capture 1-5% market share in 3-5 years
    const marketShare = 0.02; // 2% target
    const som = sam * marketShare;

    // Return calculation result package with explanation
    return {
        metrics: {
            tam,
            sam,
            som
        },
        assumptions: {
            avgPrice,
            totalAddressableUsers,
            marketReach: segmentReach * 100,
            marketShare: marketShare * 100
        },
        logic: [
            `Used base annual value of $${avgPrice.toLocaleString()} (Source: ${userPrice ? 'User Input' : 'Industry Benchmark'})`,
            `Estimated ${totalAddressableUsers.toLocaleString()} potential customers in ${inputs.geography.toUpperCase()}.`,
            `Targeting ${inputs.customerType.toUpperCase()} segment.`,
            `SAM assumed at ${(segmentReach * 100)}% of total market based on typical segmentation.`,
            `SOM target set at ${(marketShare * 100)}% market share.`
        ]
    };
}

/**
 * Format large currency numbers (e.g. $1.5B)
 */
export const formatCurrency = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${Math.round(value).toLocaleString()}`;
};
