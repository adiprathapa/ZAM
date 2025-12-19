export const INDUSTRY_DATA = [
    {
        key: 'saas_horizontal',
        name: 'SaaS (Horizontal)',
        description: 'General purpose software (CRM, HR, Productivity)',
        metrics: { avgAcv: 25000, churnRate: 0.10, growthRate: 0.15 },
        naicsCodes: ['511210']
    },
    {
        key: 'saas_vertical',
        name: 'SaaS (Vertical)',
        description: 'Industry-specific software (Construction, Healthcare, Legal)',
        metrics: { avgAcv: 45000, churnRate: 0.08, growthRate: 0.12 },
        naicsCodes: ['511210']
    },
    {
        key: 'fintech',
        name: 'Fintech & Payments',
        description: 'Financial technology, payment processing',
        metrics: { avgAcv: 15000, churnRate: 0.15, growthRate: 0.22 },
        naicsCodes: ['522320']
    },
    {
        key: 'ecommerce',
        name: 'E-commerce & Retail',
        description: 'Online retail and marketplaces',
        metrics: { avgAcv: 120, churnRate: 0.40, growthRate: 0.10 },
        naicsCodes: ['454110']
    },
    {
        key: 'digital_health',
        name: 'Digital Health',
        description: 'Health tech, telemedicine, patient engagement',
        metrics: { avgAcv: 8500, churnRate: 0.12, growthRate: 0.18 },
        naicsCodes: ['621999']
    }
];

export const COMPANY_DATA = [
    {
        name: "Salesforce",
        ticker: "CRM",
        industry: "saas_horizontal",
        description: "Cloud-based CRM including Sales Cloud, Service Cloud, Marketing Cloud.",
        metrics: { revenue: 34800000000, growth: 0.11, customers: 150000, acv: 232000 },
        model: "subscription"
    },
    {
        name: "HubSpot",
        ticker: "HUBS",
        industry: "saas_horizontal",
        description: "Inbound marketing, sales, and service software for small and medium businesses.",
        metrics: { revenue: 2170000000, growth: 0.25, customers: 205000, acv: 11500 },
        model: "subscription"
    },
    {
        name: "Shopify",
        ticker: "SHOP",
        industry: "ecommerce",
        description: "Commerce platform allowing merchants to set up online stores.",
        metrics: { revenue: 7100000000, growth: 0.26, customers: 2000000, acv: 3550 },
        model: "subscription + usage"
    },
    {
        name: "Stripe",
        ticker: "PRIVATE",
        industry: "fintech",
        description: "Financial infrastructure platform for the internet.",
        metrics: { revenue: 14000000000, growth: 0.18, customers: 3000000, acv: 4600 },
        model: "usage"
    },
    {
        name: "Veeva Systems",
        ticker: "VEEV",
        industry: "saas_vertical",
        description: "Cloud-based software for the global life sciences industry.",
        metrics: { revenue: 2400000000, growth: 0.16, customers: 1400, acv: 1700000 },
        model: "subscription"
    }
];

export const CONSTANTS_DATA = [
    {
        key: 'PRICING_MODELS',
        items: [
            { value: 'subscription', label: 'Subscription / SaaS' },
            { value: 'usage', label: 'Usage-Based / Transactional' },
            { value: 'one_time', label: 'One-Time License / Purchase' },
            { value: 'marketplace', label: 'Marketplace Commission' }
        ]
    },
    {
        key: 'CUSTOMER_TYPES',
        items: [
            { value: 'b2b', label: 'B2B (Business to Business)' },
            { value: 'b2c', label: 'B2C (Business to Consumer)' },
            { value: 'b2b2c', label: 'B2B2C' },
            { value: 'marketplace', label: 'Marketplace (Two-sided)' }
        ]
    },
    {
        key: 'GEOGRAPHIES',
        items: [
            { value: 'global', label: 'Global', factor: 1.0 },
            { value: 'na', label: 'North America', factor: 0.35 },
            { value: 'eu', label: 'Europe', factor: 0.25 },
            { value: 'apac', label: 'Asia Pacific', factor: 0.30 },
            { value: 'latam', label: 'Latin America', factor: 0.05 },
            { value: 'mea', label: 'Middle East & Africa', factor: 0.05 }
        ]
    },
    {
        key: 'MARKET_MATURITY',
        items: [
            { value: 'emerging', label: 'Emerging (High Growth, High Risk)' },
            { value: 'growth', label: 'Growth (Proven, Competitive)' },
            { value: 'mature', label: 'Mature (Stable, Saturation)' },
            { value: 'declining', label: 'Declining (Consolidation)' }
        ]
    }
];
