export const COLLECTOR_TIERS = [
  'Universe/Galaxy Collector',
  'World Collector',
  'Mega Collector',
  'Exalted Collector',
  'Renowned Collector',
  'Expert Collector',
  'Seasoned Collector',
] as const;

export const MARKET_FILTER_TIERS = ['All', ...COLLECTOR_TIERS] as const;

export type CollectorTier = (typeof COLLECTOR_TIERS)[number];
