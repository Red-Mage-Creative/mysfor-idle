
import { PrestigeUpgrade } from './gameTypes';
import { Book, Gem, Star } from 'lucide-react';

export const prestigeUpgrades: PrestigeUpgrade[] = [
  {
    id: 'arcane_wisdom',
    name: 'Arcane Wisdom',
    description: level => `+${level * 25}% Mana per click.`,
    cost: level => Math.floor(1 * Math.pow(2.2, level)),
    maxLevel: 10,
    effect: {
      type: 'manaClickMultiplier',
      value: level => 1 + level * 0.25,
    },
    icon: Book,
  },
  {
    id: 'timeless_automation',
    name: 'Timeless Automation',
    description: level => `+${level * 10}% to all resource generation.`,
    cost: level => Math.floor(2 * Math.pow(2.5, level)),
    maxLevel: 10,
    effect: {
      type: 'allProductionMultiplier',
      value: level => 1 + level * 0.1,
    },
    icon: Star,
  },
  {
    id: 'aetheric_attunement',
    name: 'Aetheric Attunement',
    description: level => `+${level * 5}% Aether Shards gained from prestige.`,
    cost: level => Math.floor(5 * Math.pow(3, level)),
    maxLevel: 5,
    effect: {
      type: 'shardGainMultiplier',
      value: level => 1 + level * 0.05,
    },
    icon: Gem,
  }
];
