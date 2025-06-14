
import { Currency } from './gameTypes';

export const formatNumber = (num: number): string => {
  if (num < 1000) {
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(2).replace(/\.?0+$/, ''); // Clean up trailing zeros
  }

  const suffixes = [
    "", "K", "M", "B", "T", // Thousand, Million, Billion, Trillion
    "Qa", "Qi", "Sx", "Sp", // Quadrillion, Quintillion, Sextillion, Septillion
    "Oc", "No", "Dc", "UDc"  // Octillion, Nonillion, Decillion, Undecillion
  ];

  const suffixNum = Math.floor(Math.log10(num) / 3);

  // Fallback to scientific notation for numbers beyond our suffixes
  if (suffixNum >= suffixes.length) {
    return num.toExponential(2);
  }

  const shortValue = (num / Math.pow(1000, suffixNum)).toFixed(2);
  return `${shortValue}${suffixes[suffixNum]}`;
};

export const formatMultiplier = (value: number): string => {
    if (value <= 1) return 'No bonus';
    return `x${formatNumber(value)}`;
};

export const currencyName = (currency: Currency): string => {
  switch (currency) {
    case 'mana': return 'Mana';
    case 'cogwheelGears': return 'Cogwheel Gears';
    case 'essenceFlux': return 'Essence Flux';
    case 'researchPoints': return 'Research Points';
    case 'aetherShards': return 'Aether Shards';
    default: return '';
  }
};
