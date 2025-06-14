import { PrestigeUpgrade } from './gameTypes';
import { Book, Gem, Star, Zap, Hourglass, Atom, Sparkles, Rabbit, Bot, BrainCircuit } from 'lucide-react';

export const prestigeUpgrades: PrestigeUpgrade[] = [
  {
    id: 'arcane_wisdom',
    name: 'Arcane Wisdom',
    description: level => `+${level * 100}% Mana per click.`,
    cost: level => Math.floor(1 * Math.pow(1.8, level)),
    maxLevel: 10,
    effect: {
      type: 'manaClickMultiplier',
      value: level => 1 + level * 1.0,
    },
    icon: Book,
  },
  {
    id: 'timeless_automation',
    name: 'Timeless Automation',
    description: level => `+${level * 50}% to all resource generation.`,
    cost: level => Math.floor(2 * Math.pow(2.0, level)),
    maxLevel: 10,
    effect: {
      type: 'allProductionMultiplier',
      value: level => 1 + level * 0.5,
    },
    icon: Star,
  },
  {
    id: 'dimensional_mastery',
    name: 'Dimensional Mastery',
    description: level => `All resource generation is multiplied by ${Math.pow(3, level).toLocaleString()}x.`,
    cost: level => Math.floor(10 * Math.pow(4, level)),
    maxLevel: 25,
    effect: {
      type: 'allProductionMultiplier',
      value: level => Math.pow(3, level),
    },
    icon: Zap,
  },
  {
    id: 'mana_singularity',
    name: 'Mana Singularity',
    description: level => `All resource generation is multiplied by an additional ${Math.pow(10, level).toLocaleString()}x.`,
    cost: level => Math.floor(100 * Math.pow(100, level)),
    maxLevel: 5,
    effect: {
      type: 'allProductionMultiplier',
      value: level => Math.pow(10, level),
    },
    icon: Atom,
  },
  {
    id: 'reality_forge',
    name: 'Reality Forge',
    description: level => `All resource generation is multiplied by another ${Math.pow(5, level).toLocaleString()}x.`,
    cost: level => Math.floor(500 * Math.pow(250, level)),
    maxLevel: 8,
    effect: {
      type: 'allProductionMultiplier',
      value: level => Math.pow(5, level),
    },
    icon: Sparkles,
  },
  {
    id: 'quantum_efficiency',
    name: 'Quantum Efficiency',
    description: level => `Reduces all non-Aether Shard costs by ${level * 20}%.`,
    cost: level => Math.floor(1000 * Math.pow(100, level)),
    maxLevel: 4, // 80% max reduction
    effect: {
      type: 'costReductionMultiplier',
      value: level => 1 - level * 0.20,
    },
    icon: Atom,
  },
  {
    id: 'automated_procurement',
    name: 'Automated Procurement',
    description: () => 'Unlocks a toggle to automatically buy affordable items.',
    cost: () => 500,
    maxLevel: 1,
    effect: {
      type: 'unlockAutoBuyItems',
      value: () => 1,
    },
    icon: Bot,
  },
  {
    id: 'intelligent_routing',
    name: 'Intelligent Routing',
    description: () => 'Unlocks a toggle to automatically buy affordable Item & Workshop upgrades.',
    cost: () => 2500,
    maxLevel: 1,
    effect: {
      type: 'unlockAutoBuyUpgrades',
      value: () => 1,
    },
    icon: BrainCircuit,
  },
  {
    id: 'temporal_flux',
    name: 'Temporal Flux',
    description: level => `+${level * 25}% offline earnings.`,
    cost: level => Math.floor(8 * Math.pow(2.2, level)),
    maxLevel: 10,
    effect: {
      type: 'offlineProductionMultiplier',
      value: level => 1 + level * 0.25,
    },
    icon: Hourglass,
  },
  {
    id: 'temporal_acceleration',
    name: 'Temporal Acceleration',
    description: level => `Offline time passes ${Math.pow(2, level).toLocaleString()}x faster.`,
    cost: level => Math.floor(50 * Math.pow(10, level)),
    maxLevel: 10,
    effect: {
      type: 'offlineProductionMultiplier',
      value: level => Math.pow(2, level),
    },
    icon: Rabbit,
  },
  {
    id: 'aetheric_attunement',
    name: 'Aetheric Attunement',
    description: level => `+${level * 20}% Aether Shards gained from prestige.`,
    cost: level => Math.floor(5 * Math.pow(2.5, level)),
    maxLevel: 5,
    effect: {
      type: 'shardGainMultiplier',
      value: level => 1 + level * 0.2,
    },
    icon: Gem,
  },
];
