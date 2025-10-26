interface PercentileRange {
  min: number;
  max: number;
  percentile: number;
  tierName: string;
}

const percentileRanges: PercentileRange[] = [
  { min: 0, max: 49, percentile: 99, tierName: 'Rising Star' },
  { min: 50, max: 99, percentile: 90, tierName: 'Pathfinder' },
  { min: 100, max: 199, percentile: 80, tierName: 'Explorer' },
  { min: 200, max: 299, percentile: 70, tierName: 'Achiever' },
  { min: 300, max: 399, percentile: 60, tierName: 'Pioneer' },
  { min: 400, max: 499, percentile: 50, tierName: 'Innovator' },
  { min: 500, max: 699, percentile: 40, tierName: 'Champion' },
  { min: 700, max: 899, percentile: 30, tierName: 'Luminary' },
  { min: 900, max: 1199, percentile: 20, tierName: 'Visionary' },
  { min: 1200, max: 1499, percentile: 10, tierName: 'Legend' },
  { min: 1500, max: Infinity, percentile: 1, tierName: 'Apex' }
];

// Validate that ranges are continuous and non-overlapping
const validateRanges = () => {
  for (let i = 0; i < percentileRanges.length - 1; i++) {
    const currentRange = percentileRanges[i];
    const nextRange = percentileRanges[i + 1];
    
    if (currentRange.max + 1 !== nextRange.min) {
      console.error(`Gap or overlap detected between ranges:`, 
        currentRange, nextRange);
    }
    
    if (currentRange.percentile <= nextRange.percentile) {
      console.error(`Invalid percentile progression:`,
        currentRange, nextRange);
    }
  }
};

// Run validation in development
if (__DEV__) {
  validateRanges();
}

export const getMotivationalMessage = (xp: number): string => {
  const range = percentileRanges.find(range => xp >= range.min && xp <= range.max);
  
  if (__DEV__ && !range) {
    console.warn(`No range found for XP value: ${xp}`);
  }
  
  const topLine = `Top ${range?.percentile || 99}% of Self-Improvers Worldwide`;
  const bottomLine = `XP ${xp} - ${range?.tierName || 'Rising Star'}`;
  return `${topLine}\n${bottomLine}`;
};

export const getPercentile = (xp: number): number => {
  const range = percentileRanges.find(range => xp >= range.min && xp <= range.max);
  
  if (__DEV__ && !range) {
    console.warn(`No range found for XP value: ${xp}`);
  }
  
  return range?.percentile || 99;
};

export const getTierName = (xp: number): string => {
  const range = percentileRanges.find(range => xp >= range.min && xp <= range.max);
  return range?.tierName || 'Rising Star';
}; 