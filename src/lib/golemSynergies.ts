
import { GolemSynergy } from './gameTypes';

export const allSynergies: GolemSynergy[] = [
    {
        id: 'scholarly_forging',
        name: 'Scholarly Forging',
        description: 'The Scholar Golem\'s insights refine the Forge Golem\'s methods, making everything even cheaper.',
        golemIds: ['scholar_golem', 'forge_golem'],
        effect: { type: 'costMultiplier', target: 'all', value: 0.95 }, // Additional 5% cost reduction
    },
    {
        id: 'productive_growth',
        name: 'Productive Growth',
        description: 'The Mana Golem fuels the Iron Golem, boosting both mana and gear production.',
        golemIds: ['mana_golem', 'iron_golem'],
        effect: { type: 'generationMultiplier', target: 'mana', value: 1.10 }, // This will be applied twice, once for each golem. Let's make one effect.
    },
    {
        id: 'efficient_mana_production',
        name: 'Efficient Mana Production',
        description: 'The combined knowledge of mana and iron golems boosts mana generation.',
        golemIds: ['mana_golem', 'iron_golem'],
        effect: { type: 'generationMultiplier', target: 'mana', value: 1.25 },
    },
    {
        id: 'accelerated_automation',
        name: 'Accelerated Automation',
        description: 'The combined power of iron and gremlin golems boosts gear generation.',
        golemIds: ['iron_golem', 'gremlin_golem'],
        effect: { type: 'generationMultiplier', target: 'cogwheelGears', value: 1.5 },
    },
];

export const synergyMap = new Map(allSynergies.map(s => [s.id, s]));
