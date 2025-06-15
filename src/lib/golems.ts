
import { Bot, Cog, BrainCircuit } from 'lucide-react';
import { Golem } from './gameTypes';

export const allGolems: Golem[] = [
    {
        id: 'mana_golem',
        name: 'Mana Golem',
        description: 'A construct humming with raw magical energy.',
        cost: 100,
        effects: [
            { target: 'mana', multiplier: 1.5 }, // +50% mana gen
            { target: 'cogwheelGears', multiplier: 0.8 }, // -20% gear gen
        ],
        icon: Bot,
    },
    {
        id: 'iron_golem',
        name: 'Iron Golem',
        description: 'A sturdy automaton of interlocking gears and plates.',
        cost: 100,
        effects: [
            { target: 'cogwheelGears', multiplier: 1.4 }, // +40% gear gen
            { target: 'mana', multiplier: 0.85 }, // -15% mana gen
        ],
        icon: Cog,
    },
    {
        id: 'scholar_golem',
        name: 'Scholar Golem',
        description: 'A crystalline mind that endlessly processes arcane data.',
        cost: 250,
        effects: [
            { target: 'researchPoints', multiplier: 1.6 }, // +60% research gen
            { target: 'essenceFlux', multiplier: 0.75 }, // -25% essence gen
        ],
        icon: BrainCircuit,
    },
];

export const golemMap = new Map(allGolems.map(g => [g.id, g]));
export const MAX_ACTIVE_GOLEMS = 3;

