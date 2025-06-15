
import { DimensionalUpgrade } from './gameTypes';
import { Gem, Zap, ChevronsUp, Hourglass, Shield, Puzzle, Factory, Atom, Coins, Repeat } from 'lucide-react';

export const dimensionalUpgrades: DimensionalUpgrade[] = [
    // Production
    {
        id: 'global_production_i',
        name: 'Dimensional Attunement I',
        description: (level) => `Increase all production by ${level * 2}%.`,
        cost: (level) => 10 + Math.pow(level, 2) * 5,
        maxLevel: 25,
        effect: { type: 'allProductionMultiplier', value: (level) => 1 + level * 0.02 },
        icon: Gem,
    },
    {
        id: 'essence_flux_i',
        name: 'Flux Capacitor',
        description: (level) => `Increase Essence Flux generation by ${level * 5}%.`,
        cost: (level) => 20 + Math.pow(level, 2) * 10,
        maxLevel: 20,
        effect: { type: 'essenceFluxMultiplier', value: (level) => 1 + level * 0.05 },
        icon: Atom,
    },
    // QoL
    {
        id: 'offline_earnings_i',
        name: 'Temporal Anchor',
        description: (level) => `Increase offline earnings by ${level * 10}%.`,
        cost: (level) => 25 + Math.pow(level, 2) * 8,
        maxLevel: 15,
        effect: { type: 'offlineProductionMultiplier', value: (level) => 1 + level * 0.1 },
        icon: Hourglass,
    },
    {
        id: 'cost_reduction_i',
        name: 'Efficient Engineering',
        description: (level) => `Reduce the cost of all items and upgrades by ${level * 1}%.`,
        cost: (level) => 100 + Math.pow(level, 2) * 20,
        maxLevel: 10,
        effect: { type: 'costReductionMultiplier', value: (level) => 1 - level * 0.01 },
        icon: Factory,
    },
    // Prestige
    {
        id: 'aether_shard_gain_i',
        name: 'Aetheric Amplifier',
        description: (level) => `Gain ${level * 2}% more Aether Shards on prestige.`,
        cost: (level) => 50 + Math.pow(level, 2) * 15,
        maxLevel: 25,
        effect: { type: 'shardGainMultiplier', value: (level) => 1 + level * 0.02 },
        icon: ChevronsUp,
    },
    // Challenge
    {
        id: 'token_gain_i',
        name: 'Challenge Mastery',
        description: (level) => `Gain ${level * 5}% more Challenge Tokens from completing challenges.`,
        cost: (level) => 250 + Math.pow(level, 3),
        maxLevel: 10,
        effect: { type: 'challengeTokenGainMultiplier', value: (level) => 1 + level * 0.05 },
        icon: Repeat,
    }
];

export const dimensionalUpgradesMap = new Map(dimensionalUpgrades.map(u => [u.id, u]));
