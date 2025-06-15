import { Bot, Cog, BrainCircuit, Droplet, Hammer, Scale, Sparkles, Shuffle } from 'lucide-react';
import { Golem } from './gameTypes';

export const allGolems: Golem[] = [
    {
        id: 'mana_golem',
        name: 'Mana Golem',
        description: 'Humming with energy, but drains your machinery.',
        cost: 100,
        effects: [
            { type: 'generationMultiplier', target: 'mana', value: 1.5 },
            { type: 'flatGeneration', target: 'cogwheelGears', value: -3 }, // Drains 3 gears/sec
        ],
        icon: Bot,
        tier: 1,
    },
    {
        id: 'iron_golem',
        name: 'Iron Golem',
        description: 'Boosts production at the cost of increased complexity.',
        cost: 100,
        effects: [
            { type: 'generationMultiplier', target: 'cogwheelGears', value: 1.4 },
            { type: 'costMultiplier', target: 'all', value: 1.2 }, // +20% to all costs
        ],
        icon: Cog,
        tier: 1,
        conflictsWith: ['forge_golem'],
    },
    {
        id: 'scholar_golem',
        name: 'Scholar Golem',
        description: 'Accelerates research, but its insights are costly.',
        cost: 250,
        effects: [
            { type: 'generationMultiplier', target: 'researchPoints', value: 1.6 },
            { type: 'costMultiplier', target: 'all', value: 1.15 }, // +15% to all costs
        ],
        icon: BrainCircuit,
        tier: 1,
    },
    {
        id: 'vampire_golem',
        name: 'Vampire Golem',
        description: 'Feasts on your lesser resources to supercharge your mana production.',
        cost: 500,
        effects: [
            { type: 'generationMultiplier', target: 'mana', value: 3 }, // +200% mana
            { type: 'generationMultiplier', target: 'cogwheelGears', value: 0.1 }, // -90% gears
            { type: 'generationMultiplier', target: 'researchPoints', value: 0.1 }, // -90% research
        ],
        icon: Droplet,
        tier: 2,
        unlocksAtPrestige: 1,
        conflictsWith: ['equilibrium_golem'],
    },
    {
        id: 'forge_golem',
        name: 'Forge Golem',
        description: 'A master artisan. It makes everything cheaper, but its meticulous work slows down production.',
        cost: 750,
        effects: [
            { type: 'costMultiplier', target: 'all', value: 0.8 }, // -20% all costs
            { type: 'generationMultiplier', target: 'mana', value: 0.75 }, // -25% mana gen
            { type: 'generationMultiplier', target: 'cogwheelGears', value: 0.75 }, // -25% gear gen
        ],
        icon: Hammer,
        tier: 2,
        unlocksAtPrestige: 1,
        conflictsWith: ['iron_golem'],
    },
    {
        id: 'equilibrium_golem',
        name: 'Equilibrium Golem',
        description: 'Harmonizes your production, making everything cheaper at the cost of speed.',
        cost: 1200,
        effects: [
            { type: 'generationMultiplier', target: 'mana', value: 0.7 },
            { type: 'generationMultiplier', target: 'cogwheelGears', value: 0.7 },
            { type: 'generationMultiplier', target: 'researchPoints', value: 0.7 },
            { type: 'costMultiplier', target: 'all', value: 0.85 },
        ],
        icon: Scale,
        tier: 3,
        unlocksAtPrestige: 3,
        conflictsWith: ['vampire_golem'],
    },
    {
        id: 'gremlin_golem',
        name: 'Gremlin Golem',
        description: 'This mischievous creature significantly boosts gear production but disables your auto-buyers.',
        cost: 1800,
        effects: [
            { type: 'generationMultiplier', target: 'cogwheelGears', value: 2.5 }, // +150% gears
            { type: 'disableFeature', feature: 'autoBuyItems' },
            { type: 'disableFeature', feature: 'autoBuyUpgrades' },
        ],
        icon: BrainCircuit, //TODO: Find a better icon
        tier: 3,
        unlocksAtPrestige: 3,
    },
    {
        id: 'chaos_golem',
        name: 'Chaos Golem',
        description: 'An unstable entity whose influence shifts unpredictably over time. Its effect changes every 60 seconds.',
        cost: 2000,
        effects: [
            {
                type: 'randomEffect',
                effects: [
                    { type: 'generationMultiplier', target: 'mana', value: 1.75 },
                    { type: 'generationMultiplier', target: 'cogwheelGears', value: 2.0 },
                    { type: 'generationMultiplier', target: 'researchPoints', value: 2.0 },
                    { type: 'costMultiplier', target: 'all', value: 1.5 },
                    { type: 'generationMultiplier', target: 'mana', value: 0.5 },
                    { type: 'costMultiplier', target: 'all', value: 0.75 },
                ]
            }
        ],
        icon: Shuffle,
        tier: 4,
        unlocksAtPrestige: 5,
    },
    {
        id: 'ascendant_golem',
        name: 'Ascendant Golem',
        description: 'A being of pure Aether, it enhances your ability to transcend reality but consumes essence.',
        cost: 2500,
        effects: [
            { type: 'shardGainMultiplier', value: 1.25 }, // +25% shard gain
            { type: 'generationMultiplier', target: 'essenceFlux', value: 0.5 }, // -50% essence generation
        ],
        icon: Sparkles,
        tier: 4,
        unlocksAtPrestige: 5,
    },
];

export const golemMap = new Map(allGolems.map(g => [g.id, g]));
export const MAX_ACTIVE_GOLEMS = 5;
