
import { Bot, Cog, BrainCircuit } from 'lucide-react';
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
];

export const golemMap = new Map(allGolems.map(g => [g.id, g]));
export const MAX_ACTIVE_GOLEMS = 3;
