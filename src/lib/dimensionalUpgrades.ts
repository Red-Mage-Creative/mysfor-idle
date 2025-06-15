
import { DimensionalUpgrade } from './gameTypes';
import { Gem, Zap, ChevronsUp, Hourglass, Factory, Atom, Repeat, FlaskConical, Puzzle } from 'lucide-react';

export const dimensionalUpgrades: DimensionalUpgrade[] = [
    // Production
    {
        id: 'global_production_i',
        name: 'Dimensional Attunement',
        description: (level) => `Increase all production by ${level * 25}%.`,
        cost: (level) => Math.floor(10 * Math.pow(1.8, level)),
        maxLevel: 25,
        effect: { type: 'allProductionMultiplier', value: (level) => 1 + level * 0.25 },
        icon: Gem,
    },
    {
        id: 'mana_click_i',
        name: 'Mana Click Power',
        description: (level) => `Increase Mana per click by ${level * 100}%.`,
        cost: (level) => Math.floor(30 * Math.pow(2.1, level)),
        maxLevel: 25,
        effect: { type: 'manaClickMultiplier', value: (level) => 1 + level * 1.0 },
        icon: Zap,
    },
    {
        id: 'essence_flux_i',
        name: 'Flux Capacitor',
        description: (level) => `Increase Essence Flux generation by ${level * 50}%.`,
        cost: (level) => Math.floor(20 * Math.pow(1.9, level)),
        maxLevel: 20,
        effect: { type: 'essenceFluxMultiplier', value: (level) => 1 + level * 0.5 },
        icon: Atom,
    },
     {
        id: 'research_speed_i',
        name: 'Research Acceleration',
        description: (level) => `Increase Research Point generation by ${level * 50}%.`,
        cost: (level) => Math.floor(75 * Math.pow(2.3, level)),
        maxLevel: 20,
        effect: { type: 'researchPointsMultiplier', value: (level) => 1 + level * 0.5 },
        icon: FlaskConical,
    },
    // QoL
    {
        id: 'offline_earnings_i',
        name: 'Temporal Anchor',
        description: (level) => `Increase offline earnings by ${level * 100}%.`,
        cost: (level) => Math.floor(25 * Math.pow(2, level)),
        maxLevel: 15,
        effect: { type: 'offlineProductionMultiplier', value: (level) => 1 + level * 1.0 },
        icon: Hourglass,
    },
    {
        id: 'cost_reduction_i',
        name: 'Efficient Engineering',
        description: (level) => `Reduce the cost of all items and upgrades by ${Math.min(90, level * 5)}%.`,
        cost: (level) => Math.floor(100 * Math.pow(2.2, level)),
        maxLevel: 18,
        effect: { type: 'costReductionMultiplier', value: (level) => 1 - Math.min(0.9, level * 0.05) },
        icon: Factory,
    },
    // Prestige
    {
        id: 'aether_shard_gain_i',
        name: 'Aetheric Amplifier',
        description: (level) => `Gain ${level * 25}% more Aether Shards on prestige.`,
        cost: (level) => Math.floor(50 * Math.pow(2, level)),
        maxLevel: 25,
        effect: { type: 'shardGainMultiplier', value: (level) => 1 + level * 0.25 },
        icon: ChevronsUp,
    },
    {
        id: 'multi_prestige_i',
        name: 'Iterative Prestige',
        description: (level) => `Prestige multiple times at once. Current bonus: +${level} prestige levels.`,
        cost: (level) => Math.floor(1000 * Math.pow(10, level)),
        maxLevel: 10,
        effect: { type: 'multiPrestigeBonus', value: (level) => level },
        icon: Repeat,
    },
    // Challenge & Golems
    {
        id: 'token_gain_i',
        name: 'Challenge Mastery',
        description: (level) => `Gain ${level * 20}% more Challenge Tokens from completing challenges.`,
        cost: (level) => Math.floor(250 * Math.pow(2.5, level)),
        maxLevel: 10,
        effect: { type: 'challengeTokenGainMultiplier', value: (level) => 1 + level * 0.20 },
        icon: Repeat,
    },
    {
        id: 'golem_synergy_i',
        name: 'Golem Harmonization',
        description: (level) => `Increases the power of Golem Synergies by ${level * 25}%.`,
        cost: (level) => Math.floor(400 * Math.pow(3, level)),
        maxLevel: 10,
        effect: { type: 'golemSynergyMultiplier', value: (level) => 1 + level * 0.25 },
        icon: Puzzle,
    }
];

export const dimensionalUpgradesMap = new Map(dimensionalUpgrades.map(u => [u.id, u]));
