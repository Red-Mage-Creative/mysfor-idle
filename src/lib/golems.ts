
import { Bot, Cog, BrainCircuit, Droplet, Hammer } from 'lucide-react';
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
    },
];

export const golemMap = new Map(allGolems.map(g => [g.id, g]));
export const MAX_ACTIVE_GOLEMS = 3;
