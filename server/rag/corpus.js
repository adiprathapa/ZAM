import { INDUSTRY_DATA, COMPANY_DATA, CONSTANTS_DATA } from '../seed/data.js';

function pct(value) {
    return `${Math.round(value * 100)}%`;
}

function usd(value) {
    return `$${value.toLocaleString()}`;
}

function industryChunks() {
    return INDUSTRY_DATA.map((ind) => ({
        docId: `industry:${ind.key}`,
        type: 'industry_benchmark',
        source: `Industry benchmark: ${ind.name}`,
        industryKey: ind.key,
        text: [
            `Industry: ${ind.name} (${ind.key}). ${ind.description}.`,
            `Benchmark average annual contract value (ACV): ${usd(ind.metrics.avgAcv)}.`,
            `Typical annual churn rate: ${pct(ind.metrics.churnRate)}.`,
            `Typical annual growth rate: ${pct(ind.metrics.growthRate)}.`,
            ind.naicsCodes?.length ? `NAICS codes: ${ind.naicsCodes.join(', ')}.` : ''
        ].filter(Boolean).join(' ')
    }));
}

function companyChunks() {
    return COMPANY_DATA.map((co) => ({
        docId: `company:${co.ticker}:${co.name}`.toLowerCase().replace(/\s+/g, '_'),
        type: 'comparable_company',
        source: `Comparable company: ${co.name} (${co.ticker})`,
        industryKey: co.industry,
        text: [
            `Comparable company: ${co.name} (${co.ticker}), industry ${co.industry}.`,
            `${co.description}`,
            `Annual revenue: ${usd(co.metrics.revenue)}.`,
            `Revenue growth: ${pct(co.metrics.growth)}.`,
            `Customers: ${co.metrics.customers.toLocaleString()}.`,
            `Average contract value (ACV): ${usd(co.metrics.acv)}.`,
            `Revenue model: ${co.model}.`
        ].join(' ')
    }));
}

function geographyChunk() {
    const geo = CONSTANTS_DATA.find((c) => c.key === 'GEOGRAPHIES');
    if (!geo) return [];
    const lines = geo.items
        .map((g) => `${g.label} (${g.value}) applies a reach factor of ${g.factor} to the global universe`)
        .join('; ');
    return [{
        docId: 'methodology:geography_factors',
        type: 'methodology',
        source: 'ZAM methodology: geographic reach factors',
        industryKey: null,
        text: `Geographic reach factors used to scale the addressable universe from global to a target region: ${lines}.`
    }];
}

function methodologyChunks() {
    return [
        {
            docId: 'methodology:top_down',
            type: 'methodology',
            source: 'ZAM methodology: top-down market sizing',
            industryKey: null,
            text: [
                'ZAM sizes markets top-down.',
                'TAM (Total Addressable Market) = total addressable users multiplied by average annual contract value.',
                'SAM (Serviceable Available Market) defaults to 25% of TAM, reflecting typical segmentation and reachable share.',
                'SOM (Serviceable Obtainable Market) defaults to a 2% market share capture target over 3 to 5 years, applied to SAM.'
            ].join(' ')
        },
        {
            docId: 'methodology:universe_estimation',
            type: 'methodology',
            source: 'ZAM methodology: addressable universe estimation',
            industryKey: null,
            text: [
                'The addressable universe starts from a base of roughly 200 million businesses globally for B2B, or roughly 2 billion online consumers for B2C.',
                'It is then scaled by the geographic reach factor and by company size targeting.',
                'For B2B targeting companies under 50 employees the pool is scaled to about 60% (small business), over 1000 employees to about 5% (enterprise), and mid-market in between to about 35%.'
            ].join(' ')
        }
    ];
}

export function buildCorpus() {
    return [
        ...methodologyChunks(),
        ...geographyChunk(),
        ...industryChunks(),
        ...companyChunks()
    ];
}
