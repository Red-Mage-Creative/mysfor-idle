
import { Currency } from './gameTypes';

export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toFixed(1);
  const suffixes = ["", "K", "M", "B", "T"];
  const suffixNum = Math.floor(Math.log10(num) / 3);
  let shortValue;
  if (suffixNum === 0) {
    shortValue = num.toFixed(0);
  } else {
    shortValue = (num / Math.pow(1000, suffixNum)).toFixed(2);
  }
  return `${shortValue}${suffixes[suffixNum]}`;
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
